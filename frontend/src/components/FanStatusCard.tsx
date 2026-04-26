import { Button, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
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
  const isMobile = useMediaQuery('(max-width: 48em)')
  const isRunning = status?.running ?? false
  const buttonLabel = isRunning ? 'Lüfter stoppen' : 'Lüfter starten'
  const buttonIcon = isRunning ? <IconPlayerPause size={18} /> : <IconPlayerPlay size={18} />
  const updatedAtLabel = status ? new Date(status.updatedAt).toLocaleString('de-DE') : 'unbekannt'

  return (
    <Paper className="section-card fan-card fade-in-up" radius="xl" p={{ base: 'sm', xs: 'md', sm: 'lg' }}>
      <Stack gap={isMobile ? 'md' : 'lg'}>
        <Group gap="sm" align="flex-start" wrap="nowrap" style={{ minWidth: 0 }}>
          <ThemeIcon size={isMobile ? 42 : 48} radius="xl" variant="gradient" gradient={{ from: 'ocean.7', to: 'seafoam.5', deg: 145 }}>
            <IconWind size={isMobile ? 22 : 24} />
          </ThemeIcon>

          <div style={{ minWidth: 0 }}>
            <Text className="surface-label" c="dimmed">
              Steuerung
            </Text>
            <Text fw={800} size={isMobile ? 'lg' : 'xl'} ff="var(--app-font-display)">
              Lüfterstatus
            </Text>
            <Text size="sm" c="dimmed" maw={isMobile ? undefined : 320}>
              Manueller Eingriff für das Sensorboard und die aktuelle Ventilation.
            </Text>
          </div>
        </Group>

        <div className="metric-pill">
          <Text className="metric-pill-label">Betriebsmodus</Text>
          <Text fw={800} size="xl" className="live-card-value">
            {isRunning ? 'Läuft' : 'Inaktiv'}
          </Text>
          <Text size="sm" c="dimmed" className="wrap-anywhere">
            Letzte Rückmeldung: {updatedAtLabel}
          </Text>
        </div>

        {error ? (
          <Group gap="xs" c="red" wrap={isMobile ? 'wrap' : 'nowrap'}>
            <IconAlertCircle size={16} />
            <Text size="sm">{error}</Text>
          </Group>
        ) : null}

        <Button
          color={isRunning ? 'amber' : 'seafoam'}
          variant="gradient"
          gradient={isRunning ? { from: 'amber.6', to: 'orange.5', deg: 145 } : { from: 'ocean.7', to: 'seafoam.5', deg: 145 }}
          leftSection={buttonIcon}
          loading={loading}
          onClick={onToggle}
          fullWidth
          size={isMobile ? 'sm' : 'md'}
        >
          {buttonLabel}
        </Button>
      </Stack>
    </Paper>
  )
}
