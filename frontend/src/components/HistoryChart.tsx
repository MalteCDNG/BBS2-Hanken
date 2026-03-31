import {
  Badge,
  Box,
  Divider,
  Group,
  Loader,
  Paper,
  SegmentedControl,
  Select,
  Stack,
  Text,
  useComputedColorScheme,
  useMantineTheme,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
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
    <Stack align="center" justify="center" gap="xs" h={{ base: 260, sm: 360 }}>
      {loading ? <Loader size="sm" /> : null}
      <Text fw={600} ta="center">
        {title}
      </Text>
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
  const isMobile = useMediaQuery('(max-width: 36em)')
  const cardBackground = isDark ? theme.colors.dark[6] : theme.white
  const borderColor = isDark ? theme.colors.dark[4] : theme.colors.gray[2]

  const legendDetails = [
    { label: 'Innenluft', color: '#228be6' },
    { label: 'Außenluft', color: '#12b886' },
    { label: 'Taupunkt innen', color: '#fd7e14' },
  ]

  const hasData = history.length > 0
  const summary = hasData
    ? `Angezeigte ${history.length} Messpunkte (${smoothingLabel} geglättet) · Zeitraum: ${rangeLabel} · Aktualisiert ${lastUpdatedRelative} (${lastUpdatedAbsolute})`
    : `Zeitraum: ${rangeLabel}`

  return (
    <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }} shadow="sm" bg={cardBackground} style={{ borderColor }}>
      <Stack gap="md">
        <Stack gap="sm">
          <div>
            <Text fw={600}>Verlauf</Text>
            <Text size="sm" c="dimmed">
              {summary}
            </Text>
          </div>

          {isMobile ? (
            <Select
              value={selectedRange}
              data={rangeOptions}
              onChange={(value) => value && onRangeChange(value)}
              allowDeselect={false}
              aria-label="Zeitraum auswählen"
            />
          ) : (
            <Box style={{ overflowX: 'auto' }}>
              <SegmentedControl
                data={rangeOptions}
                value={selectedRange}
                onChange={onRangeChange}
                size="xs"
                aria-label="Zeitraum auswählen"
                style={{ minWidth: 480 }}
              />
            </Box>
          )}
        </Stack>

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
            <Box h={{ base: 260, sm: 360 }} w="100%" style={{ position: 'relative' }}>
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
