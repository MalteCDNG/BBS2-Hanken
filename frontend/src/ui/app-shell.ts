import { alpha, useComputedColorScheme, useMantineTheme } from '@mantine/core'

export function useAppShellStyles() {
  const theme = useMantineTheme()
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const isDark = colorScheme === 'dark'

  const shellBackground = isDark
    ? [
        `radial-gradient(circle at top left, ${alpha(theme.colors.ocean[4], 0.2)}, transparent 34%)`,
        `radial-gradient(circle at 85% 18%, ${alpha(theme.colors.seafoam[4], 0.16)}, transparent 22%)`,
        `linear-gradient(180deg, ${theme.colors.dark[8]} 0%, ${theme.colors.dark[7]} 42%, ${theme.colors.dark[9]} 100%)`,
      ].join(', ')
    : [
        `radial-gradient(circle at top left, ${alpha(theme.colors.ocean[4], 0.16)}, transparent 34%)`,
        `radial-gradient(circle at 85% 18%, ${alpha(theme.colors.seafoam[4], 0.16)}, transparent 22%)`,
        'linear-gradient(180deg, #f6f9fe 0%, #eef3fb 42%, #e5edf7 100%)',
      ].join(', ')

  const shellOverlay = isDark
    ? [
        `radial-gradient(circle at 50% 0%, ${alpha(theme.white, 0.1)}, transparent 42%)`,
        `linear-gradient(180deg, ${alpha(theme.white, 0.04)}, transparent 24%)`,
      ].join(', ')
    : [
        `radial-gradient(circle at 50% 0%, ${alpha(theme.white, 0.65)}, transparent 42%)`,
        `linear-gradient(180deg, ${alpha(theme.white, 0.2)}, transparent 24%)`,
      ].join(', ')

  const glassPanel = {
    background: isDark ? alpha(theme.colors.dark[6], 0.74) : alpha(theme.white, 0.7),
    border: `1px solid ${isDark ? alpha(theme.white, 0.09) : alpha(theme.white, 0.55)}`,
    backdropFilter: 'blur(22px)',
    boxShadow: isDark ? theme.shadows.glass : '0 18px 48px rgba(14, 30, 56, 0.14)',
  }

  const sectionPanel = {
    position: 'relative' as const,
    overflow: 'hidden' as const,
    background: isDark ? alpha(theme.colors.dark[6], 0.82) : alpha(theme.white, 0.78),
    border: `1px solid ${isDark ? alpha(theme.white, 0.09) : alpha(theme.colors.ocean[8], 0.12)}`,
    backdropFilter: 'blur(18px)',
    boxShadow: isDark ? theme.shadows.soft : '0 18px 50px rgba(14, 30, 56, 0.09)',
  }

  const sectionOverlay = {
    position: 'absolute' as const,
    inset: 0,
    pointerEvents: 'none' as const,
    background: isDark
      ? `linear-gradient(155deg, ${alpha(theme.white, 0.08)}, transparent 42%)`
      : `linear-gradient(155deg, ${alpha(theme.white, 0.44)}, transparent 42%)`,
  }

  const metricPanel = {
    padding: '14px 16px',
    borderRadius: theme.radius.xl,
    background: isDark ? alpha(theme.white, 0.05) : alpha(theme.white, 0.72),
    border: `1px solid ${isDark ? alpha(theme.white, 0.08) : alpha(theme.colors.ocean[8], 0.12)}`,
    boxShadow: isDark ? 'none' : `inset 0 1px 0 ${alpha(theme.white, 0.5)}`,
  }

  const chartViewport = {
    borderRadius: `calc(${theme.radius.xl} + 2px)`,
    background: isDark ? alpha(theme.colors.dark[7], 0.88) : alpha(theme.white, 0.74),
    border: `1px solid ${isDark ? alpha(theme.white, 0.08) : alpha(theme.colors.ocean[8], 0.1)}`,
    boxShadow: isDark ? 'none' : `inset 0 1px 0 ${alpha(theme.white, 0.6)}`,
  }

  return {
    isDark,
    shellBackground,
    shellOverlay,
    glassPanel,
    sectionPanel,
    sectionOverlay,
    metricPanel,
    chartViewport,
  }
}
