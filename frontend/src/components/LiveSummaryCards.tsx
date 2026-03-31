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
import { IconAlertCircle, IconDashboard } from '@tabler/icons-react'
import { type ReadingWithDewPoint } from '../services/api'

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
      ? `linear-gradient(135deg, ${theme.colors.ocean[8]}, ${theme.colors.ocean[6]})`
      : `linear-gradient(135deg, ${theme.colors.ocean[0]}, ${theme.colors.ocean[1]})`,
    teal: isDark
      ? `linear-gradient(135deg, ${theme.colors.mint[8]}, ${theme.colors.mint[6]})`
      : `linear-gradient(135deg, ${theme.colors.mint[0]}, ${theme.colors.mint[1]})`,
    orange: isDark
      ? `linear-gradient(135deg, ${theme.colors.orange[8]}, ${theme.colors.orange[6]})`
      : `linear-gradient(135deg, ${theme.colors.orange[0]}, ${theme.colors.yellow[0]})`,
  }

  const borderColor = isDark ? theme.colors.dark[4] : theme.colors.gray[2]
  const fallbackBackground = isDark ? theme.colors.dark[6] : theme.colors.gray[0]
  const primaryTextColor = isDark ? theme.white : theme.colors.dark[8]
  const secondaryTextColor = isDark ? 'rgba(255,255,255,0.84)' : theme.colors.dark[5]

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
        variant={isDark ? 'filled' : 'light'}
        radius="md"
        size="md"
        px="sm"
        pos="absolute"
        top={16}
        right={16}
      >
        Live
      </Badge>

      <Group gap="sm" align="flex-start">
        <ThemeIcon size={44} radius="md" color={accent} variant={isDark ? 'white' : 'light'}>
          <IconDashboard size={24} />
        </ThemeIcon>

        <Stack gap={4}>
          <Text size="sm" c={secondaryTextColor}>
            {label}
          </Text>
          <Title order={2} c={primaryTextColor}>
            {value.toFixed(1)}°C
          </Title>
          {description ? (
            <Text size="sm" c={secondaryTextColor}>
              {description}
            </Text>
          ) : null}
        </Stack>
      </Group>
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
        accent="blue"
        description={current ? `Luftfeuchte ${current.indoorHumidity.toFixed(0)}%` : undefined}
      />
      <TemperatureCard
        label="Außenluft"
        value={current?.outdoorTemp ?? 0}
        accent="teal"
        description={current ? `Luftfeuchte ${current.outdoorHumidity.toFixed(0)}%` : undefined}
      />
      <TemperatureCard
        label="Taupunkt innen"
        value={current?.dewPointIndoor ?? 0}
        accent="orange"
        description={
          current
            ? `Außentaupunkt ${current.dewPointOutdoor.toFixed(1)}°C`
            : 'Relevante Schwelle für Kondensationsgefahr'
        }
      />
    </SimpleGrid>
  )
}
