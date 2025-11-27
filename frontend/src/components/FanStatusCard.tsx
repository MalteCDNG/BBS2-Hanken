import {
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
  useComputedColorScheme,
  useMantineTheme,
} from '@mantine/core'
import { IconAlertCircle, IconPlayerPause, IconPlayerPlay, IconWind } from '@tabler/icons-react'
import { FanStatus } from '../services/api'

export function FanStatusCard({
  status,
  loading,
  error,
  onToggle,
}: {
  status: FanStatus | null
  loading: boolean
  error: string | null
  onToggle: () => void
}) {
  const isRunning = status?.running ?? false
  const badgeColor = isRunning ? 'green' : 'gray'
  const badgeLabel = isRunning ? 'Aktiv' : 'Aus'
  const buttonLabel = isRunning ? 'Lüfter stoppen' : 'Lüfter starten'
  const buttonIcon = isRunning ? <IconPlayerPause size={18} /> : <IconPlayerPlay size={18} />
  const theme = useMantineTheme()
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const isDark = colorScheme === 'dark'
  const cardBackground = isDark ? theme.colors.dark[6] : theme.white
  const borderColor = isDark ? theme.colors.dark[4] : theme.colors.gray[2]

  return (
    <Paper withBorder radius="lg" p="lg" shadow="soft" bg={cardBackground} style={{ borderColor }}>
      <Group justify="space-between" align="flex-start" mb="sm">
        <Group gap="sm">
          <ThemeIcon color="blue" variant="light" size={36} radius="md">
            <IconWind size={20} />
          </ThemeIcon>
          <div>
            <Text fw={600}>Lüfterstatus</Text>
            <Text size="sm" c="dimmed">
              Zeigt den aktuellen Betriebszustand des Lüfters mit manuellem Schalter.
            </Text>
          </div>
        </Group>
        <Tooltip label={`Aktualisiert ${status ? new Date(status.updatedAt).toLocaleString('de-DE') : 'unbekannt'}`} withArrow>
          <Badge color={badgeColor} variant="light" size="lg">
            {badgeLabel}
          </Badge>
        </Tooltip>
      </Group>

      {error && (
        <Group gap="xs" c="red" mb="sm">
          <IconAlertCircle size={16} />
          <Text size="sm">{error}</Text>
        </Group>
      )}

      <Group justify="space-between">
        <Stack gap={2}>
          <Text size="sm" c="dimmed">
            Betriebsmodus
          </Text>
          <Text fw={600}>{isRunning ? 'Läuft' : 'Inaktiv'}</Text>
        </Stack>

        <Button color={isRunning ? 'orange' : 'green'} leftSection={buttonIcon} loading={loading} onClick={onToggle}>
          {buttonLabel}
        </Button>
      </Group>
    </Paper>
  )
}
