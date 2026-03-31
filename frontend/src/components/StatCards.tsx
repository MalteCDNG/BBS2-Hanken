import { ReactNode } from 'react'
import { alpha, Paper, SimpleGrid, Stack, Text, ThemeIcon, useComputedColorScheme, useMantineTheme } from '@mantine/core'

export type StatCard = {
  label: string
  value: string
  hint: string
  colors: readonly [string, string]
  icon: ReactNode
}

export function StatCards({ cards }: { cards: StatCard[] }) {
  const theme = useMantineTheme()
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const isDark = colorScheme === 'dark'

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md" mt="xl">
      {cards.map((stat, index) => {
        const fromColor = theme.colors[stat.colors[0]]?.[6] ?? theme.colors.blue[6]
        const toColor = theme.colors[stat.colors[1]]?.[4] ?? theme.colors.cyan[4]
        const background = isDark
          ? `linear-gradient(160deg, ${alpha(fromColor, 0.42)}, ${alpha(toColor, 0.24)})`
          : `linear-gradient(160deg, ${alpha(fromColor, 0.92)}, ${alpha(toColor, 0.76)})`

        return (
          <Paper
            key={stat.label}
            className="stat-card fade-in-up"
            radius="xl"
            p="lg"
            style={{
              background,
              color: theme.white,
              animationDelay: `${120 + index * 70}ms`,
              border: `1px solid ${alpha(fromColor, isDark ? 0.24 : 0.08)}`,
            }}
          >
            <Stack gap="sm">
              <ThemeIcon size={42} radius="xl" variant="white" color={stat.colors[0]}>
                {stat.icon}
              </ThemeIcon>

              <Text size="sm" fw={700} style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {stat.label}
              </Text>

              <Text size="2rem" fw={800} className="stat-card-value">
                {stat.value}
              </Text>

              <Text size="sm" c="rgba(255,255,255,0.84)">
                {stat.hint}
              </Text>
            </Stack>
          </Paper>
        )
      })}
    </SimpleGrid>
  )
}
