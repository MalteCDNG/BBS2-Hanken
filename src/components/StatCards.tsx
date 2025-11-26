import { ReactNode } from 'react'
import { Paper, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core'

export type StatCard = {
  label: string
  value: string
  hint: string
  colors: readonly [string, string]
  icon: ReactNode
}

export function StatCards({ cards }: { cards: StatCard[] }) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md" mt="lg">
      {cards.map((stat) => (
        <Paper
          key={stat.label}
          radius="lg"
          p="md"
          shadow="card"
          className="stat-card"
          data-accent={`${stat.colors[0]}-${stat.colors[1]}`}
        >
          <Stack gap={6} align="center" ta="center">
            <ThemeIcon size={38} radius="md" variant="white" color={stat.colors[0]}>
              {stat.icon}
            </ThemeIcon>
            <Text fw={600}>{stat.label}</Text>
            <Text size="lg" fw={700}>
              {stat.value}
            </Text>
            <Text size="sm" c="rgba(255,255,255,0.85)">{stat.hint}</Text>
          </Stack>
        </Paper>
      ))}
    </SimpleGrid>
  )
}
