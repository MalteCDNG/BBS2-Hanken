import { Badge, Box, Divider, Group, Loader, Paper, SegmentedControl, Stack, Text } from '@mantine/core'
import { ChartData, ChartOptions } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { SensorReading } from '../services/api'

export function HistoryChart({
  history,
  chartData,
  chartOptions,
  lastUpdatedAbsolute,
  lastUpdatedRelative,
  selectedRange,
  onRangeChange,
  rangeLabel,
  rangeOptions,
  smoothingLabel,
}: {
  history: SensorReading[]
  chartData: ChartData<'line', { x: string; y: number }[]>
  chartOptions: ChartOptions<'line'>
  lastUpdatedAbsolute: string
  lastUpdatedRelative: string
  selectedRange: string
  onRangeChange: (value: string) => void
  rangeLabel: string
  rangeOptions: { label: string; value: string }[]
  smoothingLabel: string
}) {
  const legendDetails = [
    { label: 'Innenluft (blau)', color: '#228be6' },
    { label: 'Außenluft (grün)', color: '#12b886' },
    { label: 'Taupunkt (orange, gestrichelt)', color: '#fd7e14' },
  ]

  return (
    <Paper withBorder radius="lg" p="lg" shadow="sm">
      {history.length === 0 ? (
        <Group justify="center" py="xl">
          <Loader />
          <Text c="dimmed">Lade Langzeitdaten …</Text>
        </Group>
      ) : (
        <Stack gap="md">
          <Group justify="space-between" align="flex-end">
            <div>
              <Text fw={600}>Verlauf</Text>
              <Text size="sm" c="dimmed">
                Angezeigte {history.length} Messpunkte ({smoothingLabel} geglättet) · Zeitraum: {rangeLabel} · Aktualisiert
                {` ${lastUpdatedRelative} (${lastUpdatedAbsolute})`}
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
      )}
    </Paper>
  )
}
