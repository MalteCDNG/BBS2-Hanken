import { useCallback, useEffect, useMemo, useState } from 'react'
import { formatDistance } from 'date-fns'
import { de } from 'date-fns/locale'
import { fetchCurrent, fetchFanStatus, fetchHistory, type FanStatus, type ReadingWithDewPoint } from '../services/api'

type TimeUnit = 'hour' | 'day' | 'month'

export type HistoryRange = '6h' | '24h' | '7d' | '30d' | '90d' | '1y'

export type HistoryRangeOption = {
  label: string
  durationMs: number
  timeUnit: TimeUnit
}

const MEASUREMENT_INTERVAL_MS = 30 * 60 * 1000
const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

const HISTORY_RANGE_ORDER: HistoryRange[] = ['6h', '24h', '7d', '30d', '90d', '1y']

export const HISTORY_RANGE_OPTIONS: Record<HistoryRange, HistoryRangeOption> = {
  '6h': { label: '6 Stunden', durationMs: 6 * HOUR_MS, timeUnit: 'hour' },
  '24h': { label: '24 Stunden', durationMs: DAY_MS, timeUnit: 'hour' },
  '7d': { label: '7 Tage', durationMs: 7 * DAY_MS, timeUnit: 'day' },
  '30d': { label: '30 Tage', durationMs: 30 * DAY_MS, timeUnit: 'day' },
  '90d': { label: '90 Tage', durationMs: 90 * DAY_MS, timeUnit: 'day' },
  '1y': { label: '1 Jahr', durationMs: 365 * DAY_MS, timeUnit: 'month' },
}

const HISTORY_RESOLUTION: Record<HistoryRange, { bucketMs: number; label: string }> = {
  '6h': { bucketMs: MEASUREMENT_INTERVAL_MS, label: '30-Minuten-Messpunkte' },
  '24h': { bucketMs: MEASUREMENT_INTERVAL_MS, label: '30-Minuten-Messpunkte' },
  '7d': { bucketMs: 2 * HOUR_MS, label: '2-Stunden-Mittelwerte' },
  '30d': { bucketMs: 6 * HOUR_MS, label: '6-Stunden-Mittelwerte' },
  '90d': { bucketMs: 12 * HOUR_MS, label: '12-Stunden-Mittelwerte' },
  '1y': { bucketMs: 3 * DAY_MS, label: '3-Tage-Mittelwerte' },
}

function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(timestamp))
}

function averageReadings(readings: ReadingWithDewPoint[]): ReadingWithDewPoint {
  if (readings.length === 1) {
    return readings[0]
  }

  const totals = readings.reduce(
    (acc, entry) => ({
      timestamp: acc.timestamp + new Date(entry.timestamp).getTime(),
      indoorTemp: acc.indoorTemp + entry.indoorTemp,
      outdoorTemp: acc.outdoorTemp + entry.outdoorTemp,
      indoorHumidity: acc.indoorHumidity + entry.indoorHumidity,
      outdoorHumidity: acc.outdoorHumidity + entry.outdoorHumidity,
      dewPointIndoor: acc.dewPointIndoor + entry.dewPointIndoor,
      dewPointOutdoor: acc.dewPointOutdoor + entry.dewPointOutdoor,
    }),
    {
      timestamp: 0,
      indoorTemp: 0,
      outdoorTemp: 0,
      indoorHumidity: 0,
      outdoorHumidity: 0,
      dewPointIndoor: 0,
      dewPointOutdoor: 0,
    }
  )

  const count = readings.length

  return {
    timestamp: new Date(totals.timestamp / count).toISOString(),
    indoorTemp: totals.indoorTemp / count,
    outdoorTemp: totals.outdoorTemp / count,
    indoorHumidity: totals.indoorHumidity / count,
    outdoorHumidity: totals.outdoorHumidity / count,
    dewPointIndoor: totals.dewPointIndoor / count,
    dewPointOutdoor: totals.dewPointOutdoor / count,
  }
}

export function useHistoryData(refreshInterval: number) {
  const historyRequestBufferMs = 60 * 1000
  const [current, setCurrent] = useState<ReadingWithDewPoint | null>(null)
  const [history, setHistory] = useState<ReadingWithDewPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fanStatus, setFanStatus] = useState<FanStatus | null>(null)
  const [fanError, setFanError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [historyRange, setHistoryRange] = useState<HistoryRange>('7d')
  const [now, setNow] = useState(() => Date.now())

  const historyRangeOptions = useMemo(
    () =>
      HISTORY_RANGE_ORDER.map((value) => ({
        value,
        label: HISTORY_RANGE_OPTIONS[value].label,
      })),
    []
  )

  const filteredHistory = useMemo(() => {
    const cutoff = now - HISTORY_RANGE_OPTIONS[historyRange].durationMs
    return history.filter((entry) => new Date(entry.timestamp).getTime() >= cutoff)
  }, [history, historyRange, now])

  const chartHistory = useMemo(() => {
    const bucketSizeMs = HISTORY_RESOLUTION[historyRange].bucketMs
    const buckets = new Map<number, ReadingWithDewPoint[]>()

    filteredHistory.forEach((entry) => {
      const time = new Date(entry.timestamp).getTime()
      const bucketKey = Math.floor(time / bucketSizeMs) * bucketSizeMs
      const bucket = buckets.get(bucketKey) ?? []
      bucket.push(entry)
      buckets.set(bucketKey, bucket)
    })

    return Array.from(buckets.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, values]) => averageReadings(values))
  }, [filteredHistory, historyRange])

  const resolutionLabel = HISTORY_RESOLUTION[historyRange].label

  const refreshData = useCallback(async () => {
    setIsRefreshing(true)

    const end = new Date(Date.now() + historyRequestBufferMs).toISOString()
    const start = new Date(Date.now() - HISTORY_RANGE_OPTIONS[historyRange].durationMs).toISOString()

    try {
      const [historyReadings, currentFanStatus] = await Promise.all([fetchHistory(start, end), fetchFanStatus()])
      const currentReading = await fetchCurrent()

      setCurrent(currentReading)

      const mergedHistory = [...historyReadings]
      const hasCurrentReading = currentReading
        ? historyReadings.some(
            (entry) => new Date(entry.timestamp).getTime() === new Date(currentReading.timestamp).getTime()
          )
        : false

      if (currentReading && !hasCurrentReading) {
        mergedHistory.push(currentReading)
      }

      mergedHistory.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

      setHistory(mergedHistory)
      setError(null)
      setFanStatus(currentFanStatus)
      setFanError(null)
    } catch (err) {
      console.error(err)
      setError('Konnte Sensordaten nicht laden. Läuft das Backend?')
      setFanError('Konnte Lüfterstatus nicht laden.')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [historyRange, historyRequestBufferMs])

  useEffect(() => {
    queueMicrotask(() => {
      void refreshData()
    })
    const interval = setInterval(refreshData, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshData, refreshInterval])

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(interval)
  }, [])

  const lastUpdatedAbsolute = current ? formatTimestamp(current.timestamp) : '--'
  const lastUpdatedRelative = useMemo(
    () =>
      current
        ? formatDistance(new Date(current.timestamp), new Date(now), {
            addSuffix: true,
            locale: de,
            includeSeconds: false,
          })
        : '--',
    [current, now]
  )

  return {
    chartHistory,
    current,
    error,
    fanError,
    fanStatus,
    history,
    historyRange,
    historyRangeOptions,
    isRefreshing,
    lastUpdatedAbsolute,
    lastUpdatedRelative,
    loading,
    refreshData,
    setFanError,
    setFanStatus,
    setHistoryRange,
    resolutionLabel,
  }
}

export type UseHistoryDataResult = ReturnType<typeof useHistoryData>
