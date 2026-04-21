import { useCallback, useMemo, useState } from 'react'
import { ActionIcon, Affix, AppShell, Box, Container, Grid, useComputedColorScheme } from '@mantine/core'
import { IconRefresh } from '@tabler/icons-react'
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
import { useMediaQuery } from '@mantine/hooks'
import { FanStatusCard } from './components/FanStatusCard'
import { HeaderBar } from './components/HeaderBar'
import { HeroSection } from './components/HeroSection'
import { HistoryChart } from './components/HistoryChart'
import { FooterBar } from './components/FooterBar'
import { HISTORY_RANGE_OPTIONS, HistoryRange, useHistoryData } from './hooks/useHistoryData'
import { toggleFan } from './services/api'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler, TimeScale)

function App() {
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const isDark = colorScheme === 'dark'
  const isMobile = useMediaQuery('(max-width: 48em)')
  const [isTogglingFan, setIsTogglingFan] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(10000)
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
    smoothingLabel,
  } = useHistoryData(refreshInterval)

  const showChartPoints = chartHistory.length <= 1

  const chartPalette = useMemo(
    () =>
      isDark
        ? {
            indoor: '#84b0ff',
            indoorFill: 'rgba(132, 176, 255, 0.18)',
            outdoor: '#71ebca',
            outdoorFill: 'rgba(113, 235, 202, 0.16)',
            dew: '#ffca52',
            grid: 'rgba(216, 231, 255, 0.12)',
            text: '#d8e7ff',
            mutedText: '#a8bfdc',
          }
        : {
            indoor: '#0a4f9f',
            indoorFill: 'rgba(10, 79, 159, 0.14)',
            outdoor: '#069b74',
            outdoorFill: 'rgba(6, 155, 116, 0.14)',
            dew: '#cc8700',
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
          borderColor: chartPalette.indoor,
          backgroundColor: chartPalette.indoorFill,
          tension: 0.38,
          fill: true,
          borderWidth: 3,
          pointRadius: showChartPoints ? 4 : 0,
          pointHoverRadius: 6,
          pointHitRadius: 12,
        },
        {
          label: 'Außen',
          data: chartHistory.map((entry) => ({ x: entry.timestamp, y: entry.outdoorTemp })),
          borderColor: chartPalette.outdoor,
          backgroundColor: chartPalette.outdoorFill,
          tension: 0.38,
          fill: true,
          borderWidth: 3,
          pointRadius: showChartPoints ? 4 : 0,
          pointHoverRadius: 6,
          pointHitRadius: 12,
        },
        {
          label: 'Taupunkt innen',
          data: chartHistory.map((entry) => ({ x: entry.timestamp, y: entry.dewPointIndoor })),
          borderColor: chartPalette.dew,
          backgroundColor: 'transparent',
          borderDash: [8, 8],
          tension: 0.34,
          fill: false,
          borderWidth: 2,
          pointRadius: showChartPoints ? 4 : 0,
          pointHoverRadius: 6,
          pointHitRadius: 12,
        },
      ],
    }),
    [chartHistory, chartPalette, showChartPoints]
  )

  const chartOptions = useMemo<ChartOptions<'line'>>(() => {
    const timeUnit = HISTORY_RANGE_OPTIONS[historyRange].timeUnit

    return {
      responsive: true,
      maintainAspectRatio: false,
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
          labels: {
            color: chartPalette.mutedText,
            usePointStyle: true,
            boxWidth: 8,
            boxHeight: 8,
            padding: 18,
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
          },
        },
        y: {
          title: {
            display: true,
            text: 'Temperatur (°C)',
            color: chartPalette.mutedText,
          },
          grid: {
            color: chartPalette.grid,
            drawBorder: false,
          },
          ticks: {
            color: chartPalette.mutedText,
            callback: (value: number | string) => `${value}°`,
          },
        },
      },
    }
  }, [chartPalette, historyRange, isDark])

  const selectedRangeLabel = HISTORY_RANGE_OPTIONS[historyRange].label

  const handleToggleFan = useCallback(async () => {
    setIsTogglingFan(true)
    try {
      const updatedStatus = await toggleFan()
      setFanStatus(updatedStatus)
      setFanError(null)
    } catch (err) {
      console.error(err)
      setFanError('Konnte den Lüfterstatus nicht umschalten.')
    } finally {
      setIsTogglingFan(false)
    }
  }, [setFanError, setFanStatus])

  return (
    <AppShell padding={{ base: 'sm', sm: 'lg' }} header={isMobile ? undefined : { height: 108 }}>
      {!isMobile ? (
        <AppShell.Header className="shell-header" withBorder={false}>
          <HeaderBar
            refreshInterval={refreshInterval}
            onIntervalChange={setRefreshInterval}
            onManualRefresh={refreshData}
            isRefreshing={isRefreshing}
            lastUpdatedRelative={lastUpdatedRelative}
          />
        </AppShell.Header>
      ) : null}

      <AppShell.Main className="app-shell-main">
        <Container size="xl" py={{ base: 'xs', sm: 'xl' }}>
          {isMobile ? (
            <Box mb="md">
              <HeaderBar
                refreshInterval={refreshInterval}
                onIntervalChange={setRefreshInterval}
                onManualRefresh={refreshData}
                isRefreshing={isRefreshing}
                lastUpdatedRelative={lastUpdatedRelative}
              />
            </Box>
          ) : null}

          <Grid gutter={{ base: 'md', md: 'xl' }}>
            <Grid.Col span={12}>
              <HeroSection current={current} lastUpdatedAbsolute={lastUpdatedAbsolute} lastUpdatedRelative={lastUpdatedRelative} />
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
                smoothingLabel={smoothingLabel}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 4 }} id="controls">
              <FanStatusCard status={fanStatus} loading={isTogglingFan} error={fanError} onToggle={handleToggleFan} />
            </Grid.Col>
          </Grid>
        </Container>

        <Box mt={{ base: 'lg', sm: 'xl' }} pb={{ base: 'md', sm: 'lg' }}>
          <FooterBar />
        </Box>

        {isMobile ? (
          <Affix position={{ bottom: 18, right: 18 }}>
            <ActionIcon
              className="mobile-refresh-fab"
              size={54}
              radius={999}
              variant="gradient"
              gradient={{ from: 'ocean.7', to: 'seafoam.5', deg: 145 }}
              onClick={refreshData}
              loading={isRefreshing}
              aria-label="Messwerte neu laden"
            >
              <IconRefresh size={22} />
            </ActionIcon>
          </Affix>
        ) : null}
      </AppShell.Main>
    </AppShell>
  )
}

export default App
