import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AppShell,
  Badge,
  Container,
  Grid,
  Stack,
  Tooltip as MantineTooltip,
  useComputedColorScheme,
  useMantineTheme,
} from '@mantine/core'
import { IconTemperature, IconTemperatureMinus, IconTemperaturePlus } from '@tabler/icons-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import { formatDistance } from 'date-fns'
import { de } from 'date-fns/locale'
import { FanStatusCard } from './components/FanStatusCard'
import { fetchCurrent, fetchFanStatus, fetchHistory, SensorReading, toggleFan, type FanStatus } from './services/api'
import { HeaderBar } from './components/HeaderBar'
import { HeroSection } from './components/HeroSection'
import { StatCard } from './components/StatCards'
import { LiveSummaryCards } from './components/LiveSummaryCards'
import { HistoryChart } from './components/HistoryChart'
import { AdvicePanel, VentilationAdvice } from './components/AdvicePanel'
import { FooterBar } from './components/FooterBar'
import { ChartData, ChartOptions } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler, TimeScale)

type HistoryRange = '1m' | '1h' | '6h' | '24h' | '7d' | '30d' | '90d' | '1y'

type TimeUnit = 'second' | 'minute' | 'hour' | 'day' | 'month'

type HistoryRangeOption = { label: string; durationMs: number; timeUnit: TimeUnit }

const HISTORY_RANGE_ORDER: HistoryRange[] = ['1m', '1h', '6h', '24h', '7d', '30d', '90d', '1y']

const HISTORY_RANGE_OPTIONS: Record<HistoryRange, HistoryRangeOption> = {
  '1m': { label: '1 Minute', durationMs: 60 * 1000, timeUnit: 'second' },
  '1h': { label: '1 Stunde', durationMs: 60 * 60 * 1000, timeUnit: 'minute' },
  '6h': { label: '6 Stunden', durationMs: 6 * 60 * 60 * 1000, timeUnit: 'hour' },
  '24h': { label: '24 Stunden', durationMs: 24 * 60 * 60 * 1000, timeUnit: 'hour' },
  '7d': { label: '7 Tage', durationMs: 7 * 24 * 60 * 60 * 1000, timeUnit: 'day' },
  '30d': { label: '30 Tage', durationMs: 30 * 24 * 60 * 60 * 1000, timeUnit: 'day' },
  '90d': { label: '90 Tage', durationMs: 90 * 24 * 60 * 60 * 1000, timeUnit: 'day' },
  '1y': { label: '1 Jahr', durationMs: 365 * 24 * 60 * 60 * 1000, timeUnit: 'month' },
}

const HISTORY_BUCKET_SIZES: Record<HistoryRange, number> = {
  '1m': 10 * 1000, // feinere Auflösung für Kurzzeitanzeige
  '1h': 5 * 60 * 1000,
  '6h': 5 * 60 * 1000,
  '24h': 5 * 60 * 1000,
  '7d': 5 * 60 * 1000,
  '30d': 5 * 60 * 1000,
  '90d': 5 * 60 * 1000,
  '1y': 5 * 60 * 1000,
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp)
  return new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

function App() {
  const theme = useMantineTheme()
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const isDark = colorScheme === 'dark'
  const [current, setCurrent] = useState<SensorReading | null>(null)
  const [history, setHistory] = useState<SensorReading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fanStatus, setFanStatus] = useState<FanStatus | null>(null)
  const [fanError, setFanError] = useState<string | null>(null)
  const [isTogglingFan, setIsTogglingFan] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(10000)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [historyRange, setHistoryRange] = useState<HistoryRange>('7d')

  const historyRangeOptions = useMemo(
    () => HISTORY_RANGE_ORDER.map((value) => ({ value, label: HISTORY_RANGE_OPTIONS[value].label })),
    []
  )

  const filteredHistory = useMemo(() => {
    const cutoff = Date.now() - HISTORY_RANGE_OPTIONS[historyRange].durationMs
    return history.filter((entry) => new Date(entry.timestamp).getTime() >= cutoff)
  }, [history, historyRange])

  const chartHistory = useMemo(() => {
    const bucketSizeMs = HISTORY_BUCKET_SIZES[historyRange]
    const buckets = new Map<number, SensorReading>()

    filteredHistory.forEach((entry) => {
      const time = new Date(entry.timestamp).getTime()
      const bucketKey = Math.floor(time / bucketSizeMs) * bucketSizeMs
      const existing = buckets.get(bucketKey)

      // Wir behalten den neuesten Messwert innerhalb des Buckets, um Sprünge zu vermeiden
      if (!existing || new Date(existing.timestamp).getTime() < time) {
        buckets.set(bucketKey, entry)
      }
    })

    return Array.from(buckets.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, value]) => value)
  }, [filteredHistory, historyRange])

  const smoothingLabel = useMemo(() => {
    const bucketMs = HISTORY_BUCKET_SIZES[historyRange]
    if (bucketMs < 60 * 1000) {
      return `${bucketMs / 1000} Sekunden`
    }

    const minutes = bucketMs / (60 * 1000)
    return `${minutes} Minuten`
  }, [historyRange])

  const refreshData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const [currentReading, historyReadings, currentFanStatus] = await Promise.all([
        fetchCurrent(),
        fetchHistory(),
        fetchFanStatus(),
      ])
      setCurrent(currentReading)
      const mergedHistory = [...historyReadings]
      const hasCurrentReading = historyReadings.some(
        (entry) => new Date(entry.timestamp).getTime() === new Date(currentReading.timestamp).getTime()
      )

      if (!hasCurrentReading) {
        mergedHistory.push(currentReading)
      }

      mergedHistory.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      setHistory(mergedHistory)
      setError(null)
      setFanStatus(currentFanStatus)
      setFanError(null)
    } catch (err) {
      console.error(err)
      setError('Konnte Sensordaten nicht laden. Läuft der Mock-Server?')
      setFanError('Konnte Lüfterstatus nicht laden.')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    refreshData()
    const interval = setInterval(refreshData, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshData, refreshInterval])

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(interval)
  }, [])

  const chartData = useMemo<ChartData<'line', { x: string; y: number }[]>>(() => {
    return {
      datasets: [
        {
          label: 'Innen',
          data: chartHistory.map((entry) => ({ x: entry.timestamp, y: entry.indoorTemp })),
          borderColor: '#228be6',
          backgroundColor: 'rgba(34, 139, 230, 0.1)',
          tension: 0.3,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHitRadius: 10,
        },
        {
          label: 'Außen',
          data: chartHistory.map((entry) => ({ x: entry.timestamp, y: entry.outdoorTemp })),
          borderColor: '#12b886',
          backgroundColor: 'rgba(18, 184, 134, 0.1)',
          tension: 0.3,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHitRadius: 10,
        },
        {
          label: 'Taupunkt',
          data: chartHistory.map((entry) => ({ x: entry.timestamp, y: entry.dewPoint })),
          borderColor: '#fd7e14',
          backgroundColor: 'rgba(253, 126, 20, 0.1)',
          borderDash: [6, 6],
          tension: 0.3,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHitRadius: 10,
        },
      ],
    }
  }, [chartHistory])

  const chartOptions = useMemo<ChartOptions<'line'>>(
    () => {
      const timeUnit = HISTORY_RANGE_OPTIONS[historyRange].timeUnit

      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom' as const,
          },
          tooltip: {
            mode: 'index' as const,
            intersect: false,
            callbacks: {
              title: (items) =>
                items.length > 0
                  ? new Intl.DateTimeFormat('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    }).format(new Date(items[0].parsed.x as number))
                  : '',
            },
          },
        },
        scales: {
          x: {
            type: 'time' as const,
            adapters: {
              date: {
                locale: de,
              },
            },
            time: {
              unit: timeUnit,
              displayFormats: {
                second: 'HH:mm:ss',
                minute: 'HH:mm:ss',
                hour: 'HH:mm',
                day: 'dd.MM.',
                month: 'LLL yy',
              },
              tooltipFormat: 'dd.MM.yyyy HH:mm:ss',
            },
            grid: { display: false },
            ticks: {
              autoSkip: true,
              maxRotation: 0,
            },
          },
          y: {
            title: { display: true, text: 'Temperatur (°C)' },
            ticks: { callback: (value: number | string) => `${value}°` },
          },
        },
        interaction: {
          mode: 'nearest' as const,
          intersect: false,
        },
      }
    },
    [historyRange]
  )

  const ventilationAdvice = useMemo<VentilationAdvice>(() => {
    if (!current) {
      return {
        title: 'Warte auf Messdaten',
        description: 'Sobald frische Messwerte eintreffen, erscheint hier die Lüftungsempfehlung.',
        color: 'gray',
      }
    }

    const dewpointDelta = current.indoorTemp - current.dewPoint
    const outsideIsCooler = current.outdoorTemp < current.indoorTemp

    if (dewpointDelta < 2) {
      return {
        title: 'Lüften vermeiden',
        description: 'Die Raumluft liegt dicht am Taupunkt – Lüften nur kurz und vorsichtig.',
        color: 'red',
      }
    }

    if (outsideIsCooler) {
      return {
        title: 'Gute Lüftungsbedingungen',
        description: 'Außenluft ist kühler als die Innenluft. Stoßlüften beugt Kondensation vor.',
        color: 'green',
      }
    }

    return {
      title: 'Neutral',
      description: 'Temperaturen sind ausgeglichen. Bei Bedarf kurz lüften, um Feuchte abzubauen.',
      color: 'yellow',
    }
  }, [current])

  const statCards = useMemo<StatCard[]>(
    () => [
      {
        label: 'Innen ↔ Außen',
        value: current ? `${(current.indoorTemp - current.outdoorTemp).toFixed(1)}°C` : '—',
        hint: 'Temperaturdifferenz',
        colors: ['blue', 'cyan'] as const,
        icon: <IconTemperaturePlus size={20} />,
      },
      {
        label: 'Taupunktabstand',
        value: current ? `${(current.indoorTemp - current.dewPoint).toFixed(1)}°C` : '—',
        hint: 'Abstand zur Kondensation',
        colors: ['orange', 'yellow'] as const,
        icon: <IconTemperature size={20} />,
      },
      {
        label: 'Trend',
        value: current ? `${current.dewPoint.toFixed(1)}°C Taupunkt` : '—',
        hint: ventilationAdvice.title,
        colors: ['teal', 'green'] as const,
        icon: <IconTemperatureMinus size={20} />,
      },
    ],
    [current, ventilationAdvice.title]
  )

  const lastUpdatedAbsolute = current ? formatTimestamp(current.timestamp) : '—'
  const lastUpdatedRelative = useMemo(
    () =>
      current
        ? formatDistance(new Date(current.timestamp), new Date(now), {
            addSuffix: true,
            locale: de,
            includeSeconds: false,
          })
        : '—',
    [current, now]
  )

  const selectedRangeLabel = HISTORY_RANGE_OPTIONS[historyRange].label

  const handleToggleFan = useCallback(async () => {
    setIsTogglingFan(true)
    try {
      const updatedStatus = await toggleFan()
      setFanStatus(updatedStatus)
      setFanError(null)
    } catch (err) {
      console.error(err)
      setFanError('Konnte Lüfterstatus nicht umschalten.')
    } finally {
      setIsTogglingFan(false)
    }
  }, [])

  const accentBadges = (
    <>
      <MantineTooltip label="Innen- und Außenwerte im Blick" withArrow>
        <Badge variant="light" color="blue">
          Innen- & Außenluft
        </Badge>
      </MantineTooltip>
      <MantineTooltip label="Taupunkt überwachen für Kondensationsschutz" withArrow>
        <Badge variant="light" color="orange">
          Taupunktkontrolle
        </Badge>
      </MantineTooltip>
      <MantineTooltip label="Trendentwicklung über die Zeit" withArrow>
        <Badge variant="light" color="teal">
          Verlauf & Trends
        </Badge>
      </MantineTooltip>
    </>
  )

  const mainBackground = isDark
    ? `linear-gradient(180deg, ${theme.colors.dark[8]}, ${theme.colors.dark[7]} 45%, ${theme.colors.dark[6]})`
    : `linear-gradient(180deg, ${theme.colors.ocean[0]}, ${theme.colors.ocean[1]} 45%, ${theme.colors.gray[0]})`

  return (
    <AppShell padding="lg" header={{ height: 72 }} footer={{ height: 70 }}>
      <AppShell.Header>
        <HeaderBar
          refreshInterval={refreshInterval}
          onIntervalChange={setRefreshInterval}
          onManualRefresh={refreshData}
          isRefreshing={isRefreshing}
          lastUpdatedRelative={lastUpdatedRelative}
        />
      </AppShell.Header>

      <AppShell.Main bg={mainBackground}>
        <Container size="xl" py="xl">
          <Grid gutter="xl">
            <Grid.Col span={12}>
              <HeroSection
                current={current}
                statCards={statCards}
                lastUpdatedAbsolute={lastUpdatedAbsolute}
                lastUpdatedRelative={lastUpdatedRelative}
                accentBadges={accentBadges}
              />
            </Grid.Col>

            <Grid.Col span={12} id="live">
              <LiveSummaryCards current={current} loading={loading} error={error} />
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 8 }} id="history">
              <HistoryChart
                history={chartHistory}
                chartData={chartData}
                chartOptions={chartOptions}
                lastUpdatedAbsolute={lastUpdatedAbsolute}
                lastUpdatedRelative={lastUpdatedRelative}
                selectedRange={historyRange}
                onRangeChange={(value) => setHistoryRange(value as HistoryRange)}
                rangeLabel={selectedRangeLabel}
                rangeOptions={historyRangeOptions}
                smoothingLabel={smoothingLabel}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 4 }} id="advice">
              <Stack gap="lg">
                <AdvicePanel current={current} ventilationAdvice={ventilationAdvice} />
                <FanStatusCard status={fanStatus} loading={isTogglingFan} error={fanError} onToggle={handleToggleFan} />
              </Stack>
            </Grid.Col>
          </Grid>
        </Container>
      </AppShell.Main>

      <AppShell.Footer>
        <FooterBar />
      </AppShell.Footer>
    </AppShell>
  )
}

export default App
