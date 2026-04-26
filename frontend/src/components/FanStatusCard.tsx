import { Box, Button, Group, Paper, Stack, Text, ThemeIcon, useMantineTheme } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconAlertCircle, IconPlayerPause, IconPlayerPlay, IconWind } from '@tabler/icons-react'
import { FanStatus } from '../services/api'
import { useAppShellStyles } from '../ui/app-shell'
import { useDashboardTypography } from '../ui/typography'

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
  const theme = useMantineTheme()
  const shellStyles = useAppShellStyles()
  const typography = useDashboardTypography()
  const isRunning = status?.running ?? false
  const buttonLabel = isRunning ? 'Lüfter stoppen' : 'Lüfter starten'
  const buttonIcon = isRunning ? <IconPlayerPause size={18} /> : <IconPlayerPlay size={18} />
  const updatedAtLabel = status ? new Date(status.updatedAt).toLocaleString('de-DE') : 'unbekannt'

  return (
    <Paper radius="xl" p={{ base: 'sm', xs: 'md', sm: 'lg' }} style={shellStyles.sectionPanel}>
      <Box style={shellStyles.sectionOverlay} />
      <Stack gap={isMobile ? 'md' : 'lg'}>
        <Group gap="sm" align="flex-start" wrap="nowrap" style={{ minWidth: 0 }}>
          <ThemeIcon size={isMobile ? 42 : 48} radius="xl" variant="gradient" gradient={{ from: 'ocean.7', to: 'seafoam.5', deg: 145 }}>
            <IconWind size={isMobile ? 22 : 24} />
          </ThemeIcon>

          <Box style={{ minWidth: 0 }}>
            <Text c="dimmed" style={typography.sectionLabel}>
              Steuerung
            </Text>
            <Text fw={800} size={isMobile ? 'lg' : 'xl'} ff={theme.headings.fontFamily}>
              Lüfterstatus
            </Text>
            <Text size="sm" c="dimmed" maw={isMobile ? undefined : 320}>
              Manueller Eingriff für das Sensorboard und die aktuelle Ventilation.
            </Text>
          </Box>
        </Group>

        <Paper component="div" style={shellStyles.metricPanel}>
          <Text span style={typography.metricLabel}>
            Betriebsmodus
          </Text>
          <Text fw={800} style={{ ...typography.displayValue, fontSize: isMobile ? '1.8rem' : '2rem' }}>
            {isRunning ? 'Läuft' : 'Inaktiv'}
          </Text>
          <Text size="sm" c="dimmed" style={{ overflowWrap: 'anywhere' }}>
            Letzte Rückmeldung: {updatedAtLabel}
          </Text>
        </Paper>

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
