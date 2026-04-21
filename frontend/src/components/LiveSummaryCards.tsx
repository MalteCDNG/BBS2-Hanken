import { ReactNode } from 'react'
import {
  Alert,
  Badge,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  alpha,
  useComputedColorScheme,
  useMantineTheme,
} from '@mantine/core'
import { IconAlertCircle, IconArrowUpRight, IconCloud, IconDroplet, IconHome } from '@tabler/icons-react'
import { type ReadingWithDewPoint } from '../services/api'

function TemperatureCard({
  label,
  value,
  accent,
  description,
  metaLabel,
  metaValue,
  icon,
  index,
}: {
  label: string
  value: number
  accent: string
  description: string
  metaLabel: string
  metaValue: string
  icon: ReactNode
  index: number
}) {
  const theme = useMantineTheme()
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const isDark = colorScheme === 'dark'
  const accentColor = theme.colors[accent]?.[6] ?? theme.colors.blue[6]
  const accentSoft = theme.colors[accent]?.[1] ?? theme.colors.blue[1]
  const accentGlow = theme.colors[accent]?.[4] ?? theme.colors.blue[4]
  const cardBackground = isDark
    ? `linear-gradient(180deg, ${alpha(accentGlow, 0.18)}, rgba(8, 18, 33, 0.96))`
    : `linear-gradient(180deg, ${alpha(accentSoft, 0.68)}, ${alpha('#ffffff', 0.92)})`

  return (
    <Paper
      className="section-card live-card fade-in-up"
      radius="xl"
      p="lg"
      style={{
        animationDelay: `${180 + index * 80}ms`,
        background: cardBackground,
        borderColor: isDark ? alpha(accentGlow, 0.24) : undefined,
      }}
    >
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="sm" align="flex-start" wrap="nowrap">
            <ThemeIcon size={46} radius="xl" style={{ backgroundColor: alpha(accentColor, 0.14), color: accentColor }}>
              {icon}
            </ThemeIcon>

            <div>
              <Text className="surface-label" c="dimmed">
                {label}
              </Text>
              <Text size="sm" c="dimmed">
                {description}
              </Text>
            </div>
          </Group>

          <Badge variant="light" color={accent}>
            Live
          </Badge>
        </Group>

        <Group justify="space-between" align="end" wrap="nowrap">
          <Text size="2.7rem" fw={800} className="live-card-value">
            {value.toFixed(1)}°C
          </Text>

          <Group gap={6} c={accentColor} wrap="nowrap">
            <IconArrowUpRight size={16} />
            <Text fw={700} size="sm">
              {metaValue}
            </Text>
          </Group>
        </Group>

        <div className="metric-pill">
          <Text className="metric-pill-label">{metaLabel}</Text>
          <Text fw={700}>{metaValue}</Text>
        </div>
      </Stack>
    </Paper>
  )
}

export function LiveSummaryCards({
  current,
  loading,
  error,
}: {
  current: ReadingWithDewPoint | null
  loading: boolean
  error: string | null
}) {
  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={18} />} title="Fehler" color="red" radius="md" variant="light">
        {error}
      </Alert>
    )
  }

  if (loading && !current) {
    return (
      <Group justify="center">
        <Loader />
      </Group>
    )
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
      <TemperatureCard
        label="Innenluft"
        value={current?.indoorTemp ?? 0}
        accent="ocean"
        description="Temperatur und Feuchte im Raum"
        metaLabel="Relative Feuchte"
        metaValue={current ? `${current.indoorHumidity.toFixed(0)}%` : '--'}
        icon={<IconHome size={24} />}
        index={0}
      />

      <TemperatureCard
        label="Außenluft"
        value={current?.outdoorTemp ?? 0}
        accent="seafoam"
        description="Vergleichswert für Wetter und Auslüften"
        metaLabel="Relative Feuchte"
        metaValue={current ? `${current.outdoorHumidity.toFixed(0)}%` : '--'}
        icon={<IconCloud size={24} />}
        index={1}
      />

      <TemperatureCard
        label="Taupunkt innen"
        value={current?.dewPointIndoor ?? 0}
        accent="amber"
        description="Relevante Schwelle für Kondensation"
        metaLabel="Taupunkt außen"
        metaValue={current ? `${current.dewPointOutdoor.toFixed(1)}°C` : '--'}
        icon={<IconDroplet size={24} />}
        index={2}
      />
    </SimpleGrid>
  )
}
