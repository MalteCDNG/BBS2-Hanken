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
  useMantineTheme,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconChartLine, IconClock } from '@tabler/icons-react'
import { ChartData, ChartOptions } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { type ReadingWithDewPoint } from '../services/api'
import { useAppShellStyles } from '../ui/app-shell'
import { useDashboardTypography } from '../ui/typography'

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
  resolutionLabel: string
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
  resolutionLabel,
}: HistoryChartProps) {
  const isMobile = useMediaQuery('(max-width: 48em)')
  const theme = useMantineTheme()
  const shellStyles = useAppShellStyles()
  const typography = useDashboardTypography()

  const hasData = history.length > 0
  const summary = hasData
    ? isMobile
      ? `${history.length} Punkte, zuletzt ${lastUpdatedRelative}`
      : `${history.length} Punkte, ${resolutionLabel}, zuletzt ${lastUpdatedRelative}`
    : `Zeitraum ${rangeLabel}`

  return (
    <Paper className="bbs2-motion-panel" radius="xl" p={{ base: 'sm', xs: 'md', sm: 'lg' }} style={{ ...shellStyles.sectionPanel, animationDelay: '130ms' }}>
      <Box style={shellStyles.sectionOverlay} />
      <Stack gap={isMobile ? 'md' : 'lg'}>
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
          <Group gap="sm" wrap="nowrap" align="flex-start" style={{ minWidth: 0, flex: 1 }}>
            <ThemeIcon size={isMobile ? 42 : 46} radius="xl" variant="light" color="ocean">
              <IconChartLine size={isMobile ? 22 : 24} />
            </ThemeIcon>

            <Box style={{ minWidth: 0 }}>
              <Text c="dimmed" style={typography.sectionLabel}>
                Historie
              </Text>
              <Text fw={800} size={isMobile ? 'lg' : 'xl'} ff={theme.headings.fontFamily}>
                Verlauf im Zeitfenster
              </Text>
              <Text size="sm" c="dimmed">
                {summary}
              </Text>
            </Box>
          </Group>

          <Group gap={6} wrap="wrap" maw={{ base: '100%', sm: 320 }}>
            <Badge variant="light" color="seafoam" leftSection={<IconClock size={13} />} style={typography.compactBadge}>
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

        <Box className="bbs2-hover-lift" p={{ base: 'xs', xs: 'sm', sm: 'md' }} style={shellStyles.chartViewport}>
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
            <Box className="bbs2-chart-motion" h={{ base: 220, xs: 240, sm: 380 }} w="100%" style={{ position: 'relative' }}>
              <Line data={chartData} options={chartOptions} aria-label="Langzeitmessungen" style={{ width: '100%' }} />
            </Box>
          )}
        </Box>
      </Stack>
    </Paper>
  )
}
