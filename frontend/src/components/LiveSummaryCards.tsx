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
  Title,
  useComputedColorScheme,
  useMantineTheme,
} from '@mantine/core'
import { IconDashboard, IconAlertCircle } from '@tabler/icons-react'
import { SensorReading } from '../services/api'

function TemperatureCard({
  label,
  value,
  accent,
  description,
}: {
  label: string
  value: number
  accent: string
  description?: string
}) {
  const theme = useMantineTheme()
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const isDark = colorScheme === 'dark'
  const accentGradients: Record<string, string> = {
    blue: isDark
      ? `linear-gradient(135deg, ${theme.colors.ocean[7]}, ${theme.colors.ocean[6]})`
      : `linear-gradient(135deg, ${theme.colors.ocean[0]}, ${theme.colors.ocean[1]})`,
    teal: isDark
      ? `linear-gradient(135deg, ${theme.colors.mint[7]}, ${theme.colors.mint[6]})`
      : `linear-gradient(135deg, ${theme.colors.mint[0]}, ${theme.colors.mint[1]})`,
    orange: isDark
      ? `linear-gradient(135deg, ${theme.colors.orange[7]}, ${theme.colors.orange[6]})`
      : `linear-gradient(135deg, ${theme.colors.orange[0]}, ${theme.colors.yellow[0]})`,
  }
  const borderColor = isDark ? theme.colors.dark[4] : theme.colors.gray[2]
  const fallbackBackground = isDark ? theme.colors.dark[6] : theme.colors.gray[0]

  return (
    <Paper
      withBorder
      radius="lg"
      p="lg"
      shadow="card"
      bg={accentGradients[accent] ?? fallbackBackground}
      style={{ position: 'relative', overflow: 'hidden', borderColor }}
    >
      <Badge
        color={accent}
        variant="light"
        radius="md"
        size="md"
        px="sm"
        pos="absolute"
        top={16}
        right={16}
        style={{ boxShadow: `0 0 0 1px var(--mantine-color-${accent}-4)` }}
      >
        Live
      </Badge>
      <Group gap="sm" align="flex-start">
        <ThemeIcon size={44} radius="md" color={accent} variant="light">
          <IconDashboard size={24} />
        </ThemeIcon>
        <Stack gap={4}>
          <Text size="sm" c="dimmed">
            {label}
          </Text>
          <Title order={2}>{value.toFixed(1)}°C</Title>
          {description && (
            <Text size="sm" c="dimmed">
              {description}
            </Text>
          )}
        </Stack>
      </Group>
    </Paper>
  )
}

export function LiveSummaryCards({ current, loading, error }: { current: SensorReading | null; loading: boolean; error: string | null }) {
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
      <TemperatureCard label="Innenluft" value={current?.indoorTemp ?? 0} accent="blue" />
      <TemperatureCard label="Außenluft" value={current?.outdoorTemp ?? 0} accent="teal" />
      <TemperatureCard
        label="Taupunkttemperatur"
        value={current?.dewPoint ?? 0}
        accent="orange"
        description="Relevante Schwelle für Kondensationsgefahr"
      />
    </SimpleGrid>
  )
}
