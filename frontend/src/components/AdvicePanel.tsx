import {
  Badge,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  useComputedColorScheme,
  useMantineTheme,
} from '@mantine/core'
import { IconWind } from '@tabler/icons-react'
import { type ReadingWithDewPoint } from '../services/api'

export type VentilationAdvice = {
  title: string
  description: string
  color: 'gray' | 'red' | 'green' | 'yellow'
}

export function AdvicePanel({
  current,
  ventilationAdvice,
}: {
  current: ReadingWithDewPoint | null
  ventilationAdvice: VentilationAdvice
}) {
  const theme = useMantineTheme()
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const isDark = colorScheme === 'dark'
  const cardBackground = isDark ? theme.colors.dark[6] : theme.white
  const borderColor = isDark ? theme.colors.dark[4] : theme.colors.gray[2]

  return (
    <Stack gap="md">
      <Paper withBorder radius="lg" p="lg" shadow="soft" bg={cardBackground} style={{ borderColor }}>
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
                Innen / Außen
              </Text>
              <Text fw={600}>
                {current
                  ? `${current.indoorTemp.toFixed(1)}°C · ${current.indoorHumidity.toFixed(0)}% / ${current.outdoorTemp.toFixed(1)}°C · ${current.outdoorHumidity.toFixed(0)}%`
                  : '—'}
              </Text>
            </div>
            <Badge color="ocean" variant="light">
              Differenz {current ? (current.indoorTemp - current.outdoorTemp).toFixed(1) : '—'}°C
            </Badge>
          </Group>
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed">
                Taupunktabstand
              </Text>
              <Text fw={600}>{current ? (current.indoorTemp - current.dewPointIndoor).toFixed(1) : '—'}°C</Text>
            </div>
            <Badge color="amber" variant="light">
              Innen {current ? current.dewPointIndoor.toFixed(1) : '—'}°C · Außen {current ? current.dewPointOutdoor.toFixed(1) : '—'}°C
            </Badge>
          </Group>
        </Stack>
      </Paper>

      <Paper withBorder radius="lg" p="lg" shadow="soft" bg={cardBackground} style={{ borderColor }}>
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
