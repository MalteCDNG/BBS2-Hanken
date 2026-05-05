import { useCallback, useMemo, useState } from 'react'
import { AppShell, Box, Container, Grid, useComputedColorScheme } from '@mantine/core'
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
  ChartData,
  ChartOptions,
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import { de } from 'date-fns/locale'
import { useMediaQuery, useReducedMotion } from '@mantine/hooks'
import { AdminSettingsDrawer } from './components/AdminSettingsDrawer'
import { DewPointInfoDrawer } from './components/DewPointInfoDrawer'
import { FanStatusCard } from './components/FanStatusCard'
import { HeaderBar } from './components/HeaderBar'
import { HeroSection } from './components/HeroSection'
import { HistoryChart } from './components/HistoryChart'
import { FooterBar } from './components/FooterBar'
import { HISTORY_RANGE_OPTIONS, HistoryRange, useHistoryData } from './hooks/useHistoryData'
import {
  DEFAULT_FAN_OVERRIDE_DURATION_SECONDS,
  getStoredFanOverrideDuration,
  normalizeFanOverrideSettingsDuration,
  toggleFan,
  type AppSettings,
} from './services/api'
import { useAppShellStyles } from './ui/app-shell'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler, TimeScale)

type ChartSeriesKey = 'indoor' | 'outdoor' | 'dewPointIndoor'

const CHART_SERIES_KEYS: ChartSeriesKey[] = ['indoor', 'outdoor', 'dewPointIndoor']

function App() {
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const isDark = colorScheme === 'dark'
  const isMobile = useMediaQuery('(max-width: 48em)')
  const isNarrowMobile = useMediaQuery('(max-width: 30em)')
  const reduceMotion = useReducedMotion()
  const shellStyles = useAppShellStyles()
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false)
  const [isDewPointGuideOpen, setIsDewPointGuideOpen] = useState(false)
  const [isTogglingFan, setIsTogglingFan] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(10000)
  const [fanOverrideDurationSeconds, setFanOverrideDurationSeconds] = useState(
    () => getStoredFanOverrideDuration() ?? DEFAULT_FAN_OVERRIDE_DURATION_SECONDS
  )
  const [visibleChartSeries, setVisibleChartSeries] = useState<ChartSeriesKey[]>(CHART_SERIES_KEYS)
  const {
    chartHistory,
    current,
    error,
    fanError,
    fanStatus,
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
  } = useHistoryData(refreshInterval)

  const chartPointRadius = useMemo(() => {
    if (chartHistory.length <= 1) {
      return 4
    }

    if (chartHistory.length <= 200) {
      return isMobile ? 2 : 2.6
    }

    if (chartHistory.length <= 1000) {
      return isMobile ? 1.3 : 1.8
    }

    return isMobile ? 0.8 : 1.2
  }, [chartHistory.length, isMobile])
  const chartPointHoverRadius = Math.max(chartPointRadius + 3, 5)

  const chartPalette = useMemo(
    () =>
      isDark
        ? {
            indoor: '#74a6ff',
            indoorFill: 'rgba(116, 166, 255, 0.18)',
            outdoor: '#38d5f4',
            outdoorFill: 'rgba(56, 213, 244, 0.14)',
            dew: '#b29cff',
            grid: 'rgba(216, 231, 255, 0.12)',
            text: '#d8e7ff',
            mutedText: '#a8bfdc',
          }
        : {
            indoor: '#064da6',
            indoorFill: 'rgba(6, 77, 166, 0.14)',
            outdoor: '#008cad',
            outdoorFill: 'rgba(0, 140, 173, 0.12)',
            dew: '#5a46d6',
            grid: 'rgba(16, 35, 63, 0.08)',
            text: '#10233f',
            mutedText: '#5a6c86',
          },
    [isDark]
  )

  const chartData = useMemo<ChartData<'line', { x: string; y: number }[]>>(
    () => ({
      datasets: [
        {
          label: 'Innen',
          data: chartHistory.map((entry) => ({ x: entry.timestamp, y: entry.indoorTemp })),
          hidden: !visibleChartSeries.includes('indoor'),
          borderColor: chartPalette.indoor,
          backgroundColor: chartPalette.indoorFill,
          pointBackgroundColor: chartPalette.indoor,
          pointHoverBackgroundColor: chartPalette.indoor,
          tension: 0.38,
          fill: true,
          borderWidth: 3,
          pointRadius: chartPointRadius,
          pointHoverRadius: chartPointHoverRadius,
          pointHitRadius: 12,
        },
        {
          label: 'Außen',
          data: chartHistory.map((entry) => ({ x: entry.timestamp, y: entry.outdoorTemp })),
          hidden: !visibleChartSeries.includes('outdoor'),
          borderColor: chartPalette.outdoor,
          backgroundColor: chartPalette.outdoorFill,
          pointBackgroundColor: chartPalette.outdoor,
          pointHoverBackgroundColor: chartPalette.outdoor,
          tension: 0.38,
          fill: true,
          borderWidth: 3,
          pointRadius: chartPointRadius,
          pointHoverRadius: chartPointHoverRadius,
          pointHitRadius: 12,
        },
        {
          label: 'Taupunkt innen',
          data: chartHistory.map((entry) => ({ x: entry.timestamp, y: entry.dewPointIndoor })),
          hidden: !visibleChartSeries.includes('dewPointIndoor'),
          borderColor: chartPalette.dew,
          backgroundColor: 'transparent',
          pointBackgroundColor: chartPalette.dew,
          pointHoverBackgroundColor: chartPalette.dew,
          borderDash: [8, 8],
          tension: 0.34,
          fill: false,
          borderWidth: 2,
          pointRadius: chartPointRadius,
          pointHoverRadius: chartPointHoverRadius,
          pointHitRadius: 12,
        },
      ],
    }),
    [chartHistory, chartPalette, chartPointHoverRadius, chartPointRadius, visibleChartSeries]
  )

  const chartOptions = useMemo<ChartOptions<'line'>>(() => {
    const timeUnit = HISTORY_RANGE_OPTIONS[historyRange].timeUnit

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: reduceMotion
        ? false
        : {
            duration: 850,
            easing: 'easeOutQuart',
          },
      interaction: {
        mode: 'nearest',
        intersect: false,
      },
      elements: {
        point: {
          borderWidth: 0,
        },
      },
      plugins: {
        legend: {
          position: 'bottom',
          onClick: (_event, legendItem) => {
            const seriesKey = CHART_SERIES_KEYS[legendItem.datasetIndex ?? -1]
            if (!seriesKey) {
              return
            }

            setVisibleChartSeries((current) => {
              const isVisible = current.includes(seriesKey)

              if (isVisible && current.length === 1) {
                return current
              }

              return isVisible ? current.filter((key) => key !== seriesKey) : [...current, seriesKey]
            })
          },
          labels: {
            color: chartPalette.mutedText,
            usePointStyle: true,
            boxWidth: isMobile ? 7 : 8,
            boxHeight: isMobile ? 7 : 8,
            padding: isMobile ? 12 : 18,
            font: {
              size: isMobile ? 11 : 12,
            },
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: isDark ? 'rgba(9, 22, 40, 0.94)' : 'rgba(255, 255, 255, 0.96)',
          titleColor: chartPalette.text,
          bodyColor: chartPalette.text,
          borderColor: chartPalette.grid,
          borderWidth: 1,
          padding: 14,
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
          type: 'time',
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
          grid: {
            color: chartPalette.grid,
            drawBorder: false,
          },
          ticks: {
            autoSkip: true,
            maxRotation: 0,
            color: chartPalette.mutedText,
            font: {
              size: isMobile ? 10 : 12,
            },
          },
        },
        y: {
          title: {
            display: !isNarrowMobile,
            text: 'Temperatur (°C)',
            color: chartPalette.mutedText,
          },
          grid: {
            color: chartPalette.grid,
            drawBorder: false,
          },
          ticks: {
            color: chartPalette.mutedText,
            font: {
              size: isMobile ? 10 : 12,
            },
            callback: (value: number | string) => `${value}°`,
          },
        },
      },
    }
  }, [chartPalette, historyRange, isDark, isMobile, isNarrowMobile, reduceMotion])

  const selectedRangeLabel = HISTORY_RANGE_OPTIONS[historyRange].label

  const handleToggleFan = useCallback(async () => {
    setIsTogglingFan(true)
    try {
      const updatedStatus = await toggleFan(fanOverrideDurationSeconds)
      setFanStatus(updatedStatus)
      setFanError(null)
    } catch (err) {
      console.error(err)
      setFanError('Konnte den Lüfterstatus nicht umschalten.')
    } finally {
      setIsTogglingFan(false)
    }
  }, [fanOverrideDurationSeconds, setFanError, setFanStatus])

  const handleSettingsChange = useCallback((settings: AppSettings) => {
    setFanOverrideDurationSeconds(normalizeFanOverrideSettingsDuration(settings.fan_override_duration))
  }, [])

  const openDewPointGuide = useCallback(() => {
    setIsDewPointGuideOpen(true)
  }, [])

  const closeDewPointGuide = useCallback(() => {
    setIsDewPointGuideOpen(false)
  }, [])

  const openAdminDrawer = useCallback(() => {
    setIsAdminDrawerOpen(true)
  }, [])

  const closeAdminDrawer = useCallback(() => {
    setIsAdminDrawerOpen(false)
  }, [])

  return (
    <>
      <AppShell padding={{ base: 10, sm: 'lg' }} header={isMobile ? undefined : { height: 108 }}>
        {!isMobile ? (
          <AppShell.Header withBorder={false} bg="transparent">
            <HeaderBar
              refreshInterval={refreshInterval}
              onIntervalChange={setRefreshInterval}
              onManualRefresh={refreshData}
              onOpenAdmin={openAdminDrawer}
              isRefreshing={isRefreshing}
            />
          </AppShell.Header>
        ) : null}

        <AppShell.Main
          style={{
            position: 'relative',
            background: shellStyles.shellBackground,
          }}
        >
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: shellStyles.shellOverlay,
            }}
          />
          <Container size="xl" py={{ base: 6, sm: 'xl' }} px={{ base: 4, xs: 'sm', sm: 'md' }}>
            {isMobile ? (
              <Box mb="sm" pos="relative">
                <HeaderBar
                  refreshInterval={refreshInterval}
                  onIntervalChange={setRefreshInterval}
                  onManualRefresh={refreshData}
                  onOpenAdmin={openAdminDrawer}
                  isRefreshing={isRefreshing}
                />
              </Box>
            ) : null}

            <Grid gap={{ base: 'sm', sm: 'md', md: 'xl' }} pos="relative">
              <Grid.Col span={12}>
                <HeroSection
                  current={current}
                  lastUpdatedAbsolute={lastUpdatedAbsolute}
                  lastUpdatedRelative={lastUpdatedRelative}
                  onOpenDewPointGuide={openDewPointGuide}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, lg: 8 }} id="history">
                <HistoryChart
                  error={error}
                  history={chartHistory}
                  loading={loading || isRefreshing}
                  chartData={chartData}
                  chartOptions={chartOptions}
                  lastUpdatedAbsolute={lastUpdatedAbsolute}
                  lastUpdatedRelative={lastUpdatedRelative}
                  selectedRange={historyRange}
                  onRangeChange={(value) => setHistoryRange(value as HistoryRange)}
                  rangeLabel={selectedRangeLabel}
                  rangeOptions={historyRangeOptions}
                  resolutionLabel={resolutionLabel}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, lg: 4 }} id="controls">
                <FanStatusCard
                  status={fanStatus}
                  loading={isTogglingFan}
                  error={fanError}
                  overrideDurationSeconds={fanOverrideDurationSeconds}
                  onToggle={handleToggleFan}
                />
              </Grid.Col>
            </Grid>
          </Container>

          <Box mt={{ base: 'md', sm: 'xl' }} pb={{ base: 'md', sm: 'lg' }}>
            <FooterBar />
          </Box>
        </AppShell.Main>
      </AppShell>

      <AdminSettingsDrawer opened={isAdminDrawerOpen} onClose={closeAdminDrawer} onSettingsChange={handleSettingsChange} />
      <DewPointInfoDrawer opened={isDewPointGuideOpen} onClose={closeDewPointGuide} />
    </>
  )
}

export default App
