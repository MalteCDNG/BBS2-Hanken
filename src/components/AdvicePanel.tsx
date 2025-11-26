import { Badge, Divider, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core'
import { IconWind } from '@tabler/icons-react'
import { SensorReading } from '../services/api'

export type VentilationAdvice = {
  title: string
  description: string
  color: 'gray' | 'red' | 'green' | 'yellow'
}

export function AdvicePanel({ current, ventilationAdvice }: { current: SensorReading | null; ventilationAdvice: VentilationAdvice }) {
  return (
    <Stack gap="md">
      <Paper withBorder radius="lg" p="lg" shadow="soft" className="card-surface">
        <Stack gap="xs">
          <Group gap="sm">
            <ThemeIcon color={ventilationAdvice.color} variant="light" size={36} radius="md">
              <IconWind size={20} />
            </ThemeIcon>
            <div>
              <Text fw={600}>{ventilationAdvice.title}</Text>
              <Text size="sm" c="dimmed">
                {ventilationAdvice.description}
              </Text>
            </div>
          </Group>
          <Divider my="sm" />
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed">
                Innen ↔ Außen
              </Text>
              <Text fw={600}>{current ? `${current.indoorTemp.toFixed(1)}°C · ${current.outdoorTemp.toFixed(1)}°C` : '—'}</Text>
            </div>
            <Badge color="blue" variant="light">
              Differenz {current ? (current.indoorTemp - current.outdoorTemp).toFixed(1) : '—'}°C
            </Badge>
          </Group>
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed">
                Taupunktabstand
              </Text>
              <Text fw={600}>{current ? (current.indoorTemp - current.dewPoint).toFixed(1) : '—'}°C</Text>
            </div>
            <Badge color="orange" variant="light">
              Schwelle {current ? current.dewPoint.toFixed(1) : '—'}°C
            </Badge>
          </Group>
        </Stack>
      </Paper>

      <Paper withBorder radius="lg" p="lg" shadow="soft" className="card-surface">
        <Stack gap="xs">
          <Text fw={600}>Hinweise</Text>
          <Text size="sm" c="dimmed">
            • Messwerte stammen direkt vom lokalen Raspberry-Pi-Backend.
          </Text>
          <Text size="sm" c="dimmed">
            • Automatische Aktualisierung alle 10 Sekunden, manuell jederzeit möglich.
          </Text>
          <Text size="sm" c="dimmed">
            • Taupunkt und Differenzen im Blick behalten, um Kondensation und Schimmel vorzubeugen.
          </Text>
        </Stack>
      </Paper>
    </Stack>
  )
}
