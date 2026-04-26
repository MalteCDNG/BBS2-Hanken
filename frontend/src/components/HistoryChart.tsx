import {
  Badge,
  Box,
  Group,
  Loader,
  NativeSelect,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconChartLine, IconClock } from '@tabler/icons-react'
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
    <Stack align="center" justify="center" gap="xs" h={{ base: 240, sm: 380 }}>
      {loading ? <Loader size="sm" /> : null}
      <Text fw={700} ta="center">
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
  const isMobile = useMediaQuery('(max-width: 48em)')

  const hasData = history.length > 0
  const summary = hasData
    ? isMobile
      ? `${history.length} Punkte, zuletzt ${lastUpdatedRelative}`
      : `${history.length} Messpunkte, ${smoothingLabel} geglättet, zuletzt ${lastUpdatedRelative}`
    : `Zeitraum ${rangeLabel}`

  return (
    <Paper className="section-card chart-card fade-in-up" radius="xl" p={{ base: 'sm', xs: 'md', sm: 'lg' }}>
      <Stack gap={isMobile ? 'md' : 'lg'}>
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
          <Group gap="sm" wrap="nowrap" align="flex-start" style={{ minWidth: 0, flex: 1 }}>
            <ThemeIcon size={isMobile ? 42 : 46} radius="xl" variant="light" color="ocean">
              <IconChartLine size={isMobile ? 22 : 24} />
            </ThemeIcon>

            <div style={{ minWidth: 0 }}>
              <Text className="surface-label" c="dimmed">
                Historie
              </Text>
              <Text fw={800} size={isMobile ? 'lg' : 'xl'} ff="var(--app-font-display)">
                Verlauf im Zeitfenster
              </Text>
              <Text size="sm" c="dimmed">
                {summary}
              </Text>
            </div>
          </Group>

          <Group gap={6} wrap="wrap" className="chart-badges">
            <Badge variant="light" color="ocean" className="compact-badge">
              {rangeLabel}
            </Badge>
            <Badge variant="light" color="seafoam" leftSection={<IconClock size={13} />} className="compact-badge chart-timestamp-badge">
              {lastUpdatedAbsolute}
            </Badge>
          </Group>
        </Group>

        {isMobile ? (
          <NativeSelect
            size="sm"
            value={selectedRange}
            data={rangeOptions}
            onChange={(event) => onRangeChange(event.currentTarget.value)}
            aria-label="Zeitraum auswählen"
          />
        ) : (
          <SegmentedControl data={rangeOptions} value={selectedRange} onChange={onRangeChange} aria-label="Zeitraum auswählen" />
        )}

        <Box className="chart-viewport" p={{ base: 'xs', xs: 'sm', sm: 'md' }}>
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
            <Box h={{ base: 220, xs: 240, sm: 380 }} w="100%" style={{ position: 'relative' }}>
              <Line data={chartData} options={chartOptions} aria-label="Langzeitmessungen" style={{ width: '100%' }} />
            </Box>
          )}
        </Box>
      </Stack>
    </Paper>
  )
}
