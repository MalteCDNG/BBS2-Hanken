import { useCallback, useMemo, useState } from 'react'
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
import { de } from 'date-fns/locale'
import { FanStatusCard } from './components/FanStatusCard'
import { toggleFan } from './services/api'
import { HeaderBar } from './components/HeaderBar'
import { HeroSection } from './components/HeroSection'
import { StatCard } from './components/StatCards'
import { LiveSummaryCards } from './components/LiveSummaryCards'
import { HistoryChart } from './components/HistoryChart'
import { AdvicePanel, VentilationAdvice } from './components/AdvicePanel'
import { FooterBar } from './components/FooterBar'
import { ChartData, ChartOptions } from 'chart.js'
import { HISTORY_RANGE_OPTIONS, HistoryRange, useHistoryData } from './hooks/useHistoryData'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler, TimeScale)

function App() {
  const theme = useMantineTheme()
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const isDark = colorScheme === 'dark'
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