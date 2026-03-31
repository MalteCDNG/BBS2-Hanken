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

function HistoryState({
  title,
  description,
  loading = false,
}: {
  title: string
  description: string
  loading?: boolean
}) {
  return (
    <Stack align="center" justify="center" gap="xs" h={360}>
      {loading ? <Loader size="sm" /> : null}
      <Text fw={600}>{title}</Text>
      <Text c="dimmed" ta="center" maw={420}>
        {description}
      </Text>
    </Stack>
  )
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
    { label: 'Innenluft', color: '#228be6' },
    { label: 'Außenluft', color: '#12b886' },
    { label: 'Taupunkt innen', color: '#fd7e14' },
  ]

  const hasData = history.length > 0

  return (
    <Paper withBorder radius="lg" p="lg" shadow="sm" bg={cardBackground} style={{ borderColor }}>
      <Stack gap="md">
        <Group justify="space-between" align="flex-end">
          <div>
            <Text fw={600}>Verlauf</Text>
            <Text size="sm" c="dimmed">
              {hasData
                ? `Angezeigte ${history.length} Messpunkte (${smoothingLabel} geglättet) · Zeitraum: ${rangeLabel} · Aktualisiert ${lastUpdatedRelative} (${lastUpdatedAbsolute})`
                : `Zeitraum: ${rangeLabel}`}
            </Text>
          </div>
          <SegmentedControl
            data={rangeOptions}
            value={selectedRange}
            onChange={onRangeChange}
            size="sm"
            aria-label="Zeitraum auswählen"
          />
        </Group>

        <Divider />

        {loading ? (
          <HistoryState
            loading
            title="Verlauf wird geladen"
            description="Die Messpunkte für den gewählten Zeitraum werden gerade neu geladen."
          />
        ) : error ? (
          <HistoryState title="Verlauf derzeit nicht verfügbar" description={error} />
        ) : !hasData ? (
          <HistoryState
            title="Noch keine Verlaufsdaten vorhanden"
            description="Sobald das Backend Messwerte für den gewählten Zeitraum liefert, erscheint hier die Chart."
          />
        ) : (
          <>
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
                        borderRadius: 999,
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
          </>
        )}
      </Stack>
    </Paper>
  )
}
