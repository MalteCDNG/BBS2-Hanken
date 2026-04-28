import { alpha, useComputedColorScheme, useMantineTheme } from '@mantine/core'

export function useDashboardTypography() {
  const theme = useMantineTheme()
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const isDark = colorScheme === 'dark'

  return {
    kicker: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: theme.spacing.sm,
      width: 'fit-content',
      padding: '8px 13px',
      borderRadius: theme.radius.lg,
      fontSize: '0.74rem',
      fontWeight: 800,
      letterSpacing: 0,
      textTransform: 'uppercase' as const,
      color: isDark ? theme.colors.ocean[2] : theme.colors.ocean[9],
      background: isDark ? alpha(theme.colors.ocean[8], 0.2) : alpha(theme.colors.ocean[4], 0.12),
      border: `1px solid ${isDark ? alpha(theme.colors.ocean[4], 0.24) : alpha(theme.colors.ocean[5], 0.16)}`,
    },
    kickerDot: {
      width: 8,
      height: 8,
      borderRadius: 999,
      background: 'linear-gradient(135deg, var(--mantine-color-ocean-6), var(--mantine-color-seafoam-5))',
      boxShadow: `0 0 0 5px ${alpha(theme.colors.ocean[4], isDark ? 0.18 : 0.12)}`,
    },
    sectionLabel: {
      fontSize: '0.74rem',
      fontWeight: 800,
      letterSpacing: 0,
      textTransform: 'uppercase' as const,
    },
    metricLabel: {
      display: 'block',
      marginBottom: 6,
      fontSize: '0.74rem',
      fontWeight: 800,
      letterSpacing: 0,
      textTransform: 'uppercase' as const,
      color: isDark ? theme.colors.gray[4] : theme.colors.gray[6],
    },
    heroTitle: {
      fontSize: 'clamp(2.15rem, 4.8vw, 4.4rem)',
      lineHeight: 1,
      letterSpacing: 0,
      textWrap: 'balance' as const,
    },
    heroAccent: {
      display: 'block',
      color: isDark ? theme.colors.ocean[3] : theme.colors.ocean[9],
    },
    heroCopy: {
      maxWidth: '40rem',
      fontSize: 'clamp(1rem, 1.2vw, 1.12rem)',
      color: isDark ? theme.colors.gray[3] : theme.colors.gray[7],
    },
    displayValue: {
      fontFamily: theme.headings.fontFamily,
      fontSize: 'clamp(1.7rem, 2.8vw, 2.5rem)',
      lineHeight: 0.95,
      letterSpacing: 0,
    },
    compactBadge: {
      height: 'auto',
      paddingInline: 12,
      paddingBlock: 8,
      fontWeight: 700,
      whiteSpace: 'normal' as const,
      textAlign: 'left' as const,
    },
  }
}
