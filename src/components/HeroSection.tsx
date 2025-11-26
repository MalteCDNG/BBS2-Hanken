import { ReactNode } from 'react'
import { Badge, Divider, Grid, Group, Paper, Stack, Text, Title } from '@mantine/core'
import { StatCard, StatCards } from './StatCards'
import { SensorReading } from '../services/api'

export function HeroSection({
  current,
  statCards,
  lastUpdatedAbsolute,
  lastUpdatedRelative,
  accentBadges,
}: {
  current: SensorReading | null
  statCards: StatCard[]
  lastUpdatedAbsolute: string
  lastUpdatedRelative: string
  accentBadges: ReactNode
}) {
  return (
    <Paper radius="lg" p="xl" shadow="card" withBorder className="gradient-panel">
      <Grid align="center" justify="space-between" gutter="xl">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap="sm" align="center" ta="center">
            <Text fw={700} size="sm" c="dimmed" className="overline">
              Smart Monitoring
            </Text>
            <Title order={1}>Taupunktlüftung</Title>
            <Text c="dimmed" maw={720}>
              Aktuelle Messwerte vom Raspberry Pi Backend mit Langzeitverlauf – optimiert für klares Situationsbewusstsein,
              gesundes Raumklima und schnelle Lüftungsentscheidungen.
            </Text>
            <Group gap="sm" justify="center">
              {accentBadges}
            </Group>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Paper withBorder radius="md" p="md" shadow="soft" className="card-surface">
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Letzte Aktualisierung
                </Text>
                <Badge variant="light" color="blue" title={`Zuletzt aktualisiert ${lastUpdatedAbsolute}`}>
                  {lastUpdatedRelative}
                </Badge>
              </Group>
              <Divider />
              <Group justify="space-between" id="live">
                <Text size="sm" c="dimmed">
                  Innen
                </Text>
                <Text fw={600}>{current ? `${current.indoorTemp.toFixed(1)}°C` : '—'}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Außen
                </Text>
                <Text fw={600}>{current ? `${current.outdoorTemp.toFixed(1)}°C` : '—'}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Taupunkt
                </Text>
                <Text fw={600}>{current ? `${current.dewPoint.toFixed(1)}°C` : '—'}</Text>
              </Group>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      <StatCards cards={statCards} />
    </Paper>
  )
}
