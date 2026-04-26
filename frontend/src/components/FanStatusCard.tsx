import { useEffect, useRef, useState } from 'react'
import { Box, Button, Group, Paper, Stack, Text, ThemeIcon, alpha, useMantineTheme } from '@mantine/core'
import { useMediaQuery, useReducedMotion } from '@mantine/hooks'
import { IconAlertCircle, IconCarFan, IconPlayerPause, IconPlayerPlay, IconWind } from '@tabler/icons-react'
import { FanStatus } from '../services/api'
import { AnimatedText } from '../ui/AnimatedText'
import { useAppShellStyles } from '../ui/app-shell'
import { useDashboardTypography } from '../ui/typography'

const FAN_GLOW_ANIMATION = 'bbs2-fan-glow 1.9s ease-in-out infinite'
const FAN_TARGET_SPEED = 1.55
const FAN_ACCELERATION = 2.15
const FAN_DECELERATION = 1.05
const FAN_STOP_SPEED = 0.015
const FAN_MAX_FRAME_SECONDS = 0.05

function useFanRotorMotion(isRunning: boolean, allowMotion: boolean) {
  const rotorRef = useRef<HTMLDivElement | null>(null)
  const angleRef = useRef(0)
  const speedRef = useRef(0)
  const lastTimeRef = useRef<number | null>(null)
  const isMovingRef = useRef(false)
  const [isMoving, setIsMoving] = useState(false)

  useEffect(() => {
    const rotor = rotorRef.current

    function updateMoving(nextMoving: boolean) {
      if (isMovingRef.current === nextMoving) {
        return
      }

      isMovingRef.current = nextMoving
      setIsMoving(nextMoving)
    }

    if (!rotor || !allowMotion) {
      speedRef.current = 0
      lastTimeRef.current = null
      updateMoving(false)

      if (rotor) {
        rotor.style.transform = `rotate(${angleRef.current.toFixed(2)}deg)`
      }

      return undefined
    }

    let frameId: number | undefined
    let disposed = false

    function tick(time: number) {
      if (disposed || !rotor) {
        return
      }

      const elapsedSeconds =
        lastTimeRef.current === null
          ? 0
          : Math.min((time - lastTimeRef.current) / 1000, FAN_MAX_FRAME_SECONDS)
      lastTimeRef.current = time

      const targetSpeed = isRunning ? FAN_TARGET_SPEED : 0
      const speedDelta = targetSpeed - speedRef.current
      const acceleration = speedDelta > 0 ? FAN_ACCELERATION : FAN_DECELERATION
      const speedStep = acceleration * elapsedSeconds

      if (Math.abs(speedDelta) <= speedStep) {
        speedRef.current = targetSpeed
      } else {
        speedRef.current += Math.sign(speedDelta) * speedStep
      }

      angleRef.current = (angleRef.current + speedRef.current * 360 * elapsedSeconds) % 360
      rotor.style.transform = `rotate(${angleRef.current.toFixed(2)}deg)`

      if (isRunning || speedRef.current > FAN_STOP_SPEED) {
        updateMoving(true)
        frameId = requestAnimationFrame(tick)
        return
      }

      speedRef.current = 0
      lastTimeRef.current = null
      updateMoving(false)
    }

    if (isRunning || speedRef.current > FAN_STOP_SPEED) {
      updateMoving(true)
      frameId = requestAnimationFrame(tick)
    } else {
      updateMoving(false)
    }

    return () => {
      disposed = true
      lastTimeRef.current = null

      if (frameId !== undefined) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [allowMotion, isRunning])

  return { isMoving, rotorRef }
}

function FanIndicator({
  isRunning,
  isMobile,
  isDark,
  allowMotion,
}: {
  isRunning: boolean
  isMobile: boolean
  isDark: boolean
  allowMotion: boolean
}) {
  const theme = useMantineTheme()
  const { isMoving, rotorRef } = useFanRotorMotion(isRunning, allowMotion)
  const size = isMobile ? 68 : 82
  const innerInset = isMobile ? 10 : 12
  const isVisuallyActive = isRunning || isMoving
  const accentColor = isVisuallyActive ? theme.colors.seafoam[5] : theme.colors.gray[5]
  const ringColor = isVisuallyActive ? theme.colors.ocean[6] : theme.colors.gray[4]
  const fanBackground = isDark ? alpha(theme.colors.dark[8], 0.72) : alpha(theme.white, 0.88)

  return (
    <Box
      aria-hidden="true"
      style={{
        position: 'relative',
        width: size,
        height: size,
        flex: '0 0 auto',
      }}
    >
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: isVisuallyActive
            ? `radial-gradient(circle, ${alpha(theme.colors.seafoam[4], isDark ? 0.26 : 0.24)}, transparent 62%)`
            : alpha(theme.colors.gray[5], isDark ? 0.12 : 0.08),
          animation: isVisuallyActive && allowMotion ? FAN_GLOW_ANIMATION : undefined,
        }}
      />
      <Box
        ref={rotorRef}
        style={{
          position: 'absolute',
          inset: innerInset,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          color: accentColor,
          background: fanBackground,
          border: `1px solid ${alpha(ringColor, isVisuallyActive ? 0.36 : 0.2)}`,
          boxShadow: isVisuallyActive
            ? `0 10px 28px ${alpha(theme.colors.seafoam[6], isDark ? 0.22 : 0.18)}`
            : `inset 0 1px 0 ${alpha(theme.white, isDark ? 0.08 : 0.58)}`,
          transform: 'rotate(0deg)',
          transformOrigin: 'center',
          transition: 'background 180ms ease, border-color 180ms ease, box-shadow 180ms ease, color 180ms ease',
          willChange: isVisuallyActive && allowMotion ? 'transform' : undefined,
        }}
      >
        <IconCarFan size={isMobile ? 38 : 46} stroke={1.75} />
      </Box>
      <Box
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: isMobile ? 8 : 10,
          height: isMobile ? 8 : 10,
          borderRadius: '50%',
          background: isVisuallyActive ? theme.colors.seafoam[4] : theme.colors.gray[4],
          boxShadow: `0 0 0 4px ${alpha(isVisuallyActive ? theme.colors.seafoam[4] : theme.colors.gray[4], isVisuallyActive ? 0.16 : 0.1)}`,
          transform: 'translate(-50%, -50%)',
          transition: 'background 180ms ease, box-shadow 180ms ease',
        }}
      />
    </Box>
  )
}

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
  const reduceMotion = useReducedMotion()
  const theme = useMantineTheme()
  const shellStyles = useAppShellStyles()
  const typography = useDashboardTypography()
  const isRunning = status?.running ?? false
  const statusLabel = isRunning ? 'Läuft' : 'Inaktiv'
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
          <Group justify="space-between" align="center" wrap="nowrap" gap="md">
            <Box style={{ minWidth: 0 }}>
              <Text span style={typography.metricLabel}>
                Betriebsmodus
              </Text>
              <AnimatedText
                valueKey={statusLabel}
                variant="status"
                fw={800}
                style={{
                  fontFamily: theme.headings.fontFamily,
                  fontSize: isMobile ? '1.35rem' : '1.55rem',
                  lineHeight: 1.08,
                  letterSpacing: 0,
                }}
              >
                {statusLabel}
              </AnimatedText>
              <Text size="sm" c="dimmed" style={{ overflowWrap: 'anywhere' }}>
                Letzte Rückmeldung: {updatedAtLabel}
              </Text>
            </Box>

            <FanIndicator isRunning={isRunning} isMobile={isMobile} isDark={shellStyles.isDark} allowMotion={!reduceMotion} />
          </Group>
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
