import {
  Badge,
  Box,
  Divider,
  Group,
  Loader,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  useComputedColorScheme,
  useMantineTheme,
} from '@mantine/core'
import { ChartData, ChartOptions } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { type ReadingWithDewPoint } from '../services/api'

type HistoryChartProps = {
  error: string | null
  history: ReadingWithDewPoint[]
  loading: boolean
  chartData: ChartData<'line', { x: string; y: number }[]>
  chartOptions: ChartOptions<'line'>
  lastUpdatedAbsolute: string
  lastUpdatedRelative: string
  selectedRange: string
  onRangeChange: (value: string) => void
  rangeLabel: string
  rangeOptions: { label: string; value: string }[]
  smoothingLabel: string
}

export function HistoryChart({
  error,
  history,
  loading,
  chartData,
  chartOptions,
  lastUpdatedAbsolute,
  lastUpdatedRelative,
  selectedRange,
  onRangeChange,
  rangeLabel,
  rangeOptions,
  smoothingLabel,
}: HistoryChartProps) {
  const theme = useMantineTheme()
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const isDark = colorScheme === 'dark'
  const cardBackground = isDark ? theme.colors.dark[6] : theme.white
  const borderColor = isDark ? theme.colors.dark[4] : theme.colors.gray[2]
  const legendDetails = [
    { label: 'Innenluft (blau)', color: '#228be6' },
    { label: 'Außenluft (grün)', color: '#12b886' },
    { label: 'Taupunkt innen (orange, gestrichelt)', color: '#fd7e14' },
  ]

  let content

  if (loading) {
    content = (
      <Group justify="center" py="xl">
        <Loader />
        <Text c="dimmed">Lade Langzeitdaten ...</Text>
      </Group>
    )
  } else if (error) {
    content = (
      <Stack align="center" gap="xs" py="xl">
        <Text fw={600}>Verlauf derzeit nicht verfügbar</Text>
        <Text c="dimmed" ta="center">
          {error}
        </Text>
      </Stack>
    )
  } else if (history.length === 0) {
    content = (
      <Stack align="center" gap="xs" py="xl">
        <Text fw={600}>Noch keine Verlaufsdaten vorhanden</Text>
        <Text c="dimmed" ta="center">
          Sobald das Backend Messwerte liefert, erscheint hier die Chartanzeige.
        </Text>
      </Stack>
    )
  } else {
    content = (
      <Stack gap="md">
        <Group justify="space-between" align="flex-end">
          <div>
            <Text fw={600}>Verlauf</Text>
            <Text size="sm" c="dimmed">
              Angezeigte {history.length} Messpunkte ({smoothingLabel} geglättet) · Zeitraum: {rangeLabel} ·
              Aktualisiert {lastUpdatedRelative} ({lastUpdatedAbsolute})
            </Text>
          </div>
          <Stack gap={6} align="flex-end">
            <SegmentedControl
              data={rangeOptions}
              value={selectedRange}
              onChange={onRangeChange}
              size="sm"
              aria-label="Zeitraum auswählen"
            />
          </Stack>
        </Group>
        <Divider />
        <Box h={360} w="100%" style={{ position: 'relative' }}>
          <Line data={chartData} options={chartOptions} aria-label="Langzeitmessungen" style={{ width: '100%' }} />
        </Box>
        <Group gap="sm" wrap="wrap">
          {legendDetails.map((item) => (
            <Badge
              key={item.label}
              variant="light"
              leftSection={
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 6,
                    backgroundColor: item.color,
                    display: 'inline-block',
                  }}
                />
              }
            >
              {item.label}
            </Badge>
          ))}
        </Group>
      </Stack>
    )
  }

  return (
    <Paper withBorder radius="lg" p="lg" shadow="sm" bg={cardBackground} style={{ borderColor }}>
      {content}
    </Paper>
  )
}
