import { ReactNode } from 'react'
import { Badge, Grid, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { StatCard, StatCards } from './StatCards'
import { type ReadingWithDewPoint } from '../services/api'

type HeroHighlight = {
  label: string
  value: string
  hint: string
}

export function HeroSection({
  current,
  statCards,
  lastUpdatedAbsolute,
  lastUpdatedRelative,
  accentBadges,
  highlights,
}: {
  current: ReadingWithDewPoint | null
  statCards: StatCard[]
  lastUpdatedAbsolute: string
  lastUpdatedRelative: string
  accentBadges: ReactNode
  highlights: HeroHighlight[]
}) {
  const isMobile = useMediaQuery('(max-width: 48em)')

  const climateLabel = current
    ? current.indoorHumidity >= 70
      ? 'Aufmerksam beobachten'
      : current.indoorHumidity >= 55
        ? 'Raumklima stabil'
        : 'Eher trocken'
    : 'Noch keine Live-Daten'

  const recommendation = current
    ? current.dewPointIndoor > current.dewPointOutdoor
      ? 'Außenluft wirkt aktuell trockener und unterstützt das Auslüften.'
      : 'Kein klarer Trocknungsvorteil von außen erkennbar.'
    : 'Sobald Messwerte eintreffen, erscheint hier die Einschätzung.'

  return (
    <Paper className="section-card fade-in-up" radius="xl" p={{ base: 'md', sm: 'xl' }}>
      <Grid align="center" gutter={{ base: 'lg', md: '2rem' }}>
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Stack gap={isMobile ? 'md' : 'lg'}>
            <div className="section-kicker">Smart Monitoring</div>

            <Stack gap="md">
              <Title order={1} className="hero-title">
                Klarer Blick auf
                <span className="hero-title-accent">Taupunkt und Lüftung.</span>
              </Title>
            </Stack>

            <Group gap="sm" wrap="wrap">
              {accentBadges}
            </Group>

            <div className="signal-grid">
              {highlights.map((item) => (
                <div key={item.label} className="signal-card">
                  <Text className="metric-pill-label">{item.label}</Text>
                  <Text fw={800} size="xl" className="live-card-value">
                    {item.value}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {item.hint}
                  </Text>
                </div>
              ))}
            </div>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Paper className="glass-panel" radius="xl" p={{ base: 'md', sm: 'lg' }}>
            <Stack gap={isMobile ? 'md' : 'lg'}>
              <Group justify="space-between" align="flex-start" wrap="wrap">
                <div>
                  <Text className="surface-label" c="dimmed">
                    Live Snapshot
                  </Text>
                  <Text fw={800} size="xl" ff="var(--app-font-display)">
                    {climateLabel}
                  </Text>
                </div>

                <Badge variant="light" color="ocean" title={`Zuletzt aktualisiert um ${lastUpdatedAbsolute}`}>
                  {lastUpdatedRelative}
                </Badge>
              </Group>

              <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm">
                <div className="metric-pill">
                  <span className="metric-pill-label">Innen</span>
                  <Text className="temperature-value">{current ? `${current.indoorTemp.toFixed(1)}°C` : '--'}</Text>
                  <Text size="sm" c="dimmed">
                    Feuchte {current ? `${current.indoorHumidity.toFixed(0)}%` : '--'}
                  </Text>
                </div>

                <div className="metric-pill">
                  <span className="metric-pill-label">Außen</span>
                  <Text className="temperature-value">{current ? `${current.outdoorTemp.toFixed(1)}°C` : '--'}</Text>
                  <Text size="sm" c="dimmed">
                    Feuchte {current ? `${current.outdoorHumidity.toFixed(0)}%` : '--'}
                  </Text>
                </div>

                <div className="metric-pill">
                  <span className="metric-pill-label">Taupunkt innen</span>
                  <Text className="temperature-value">{current ? `${current.dewPointIndoor.toFixed(1)}°C` : '--'}</Text>
                  <Text size="sm" c="dimmed">
                    Kondensationsgrenze im Raum
                  </Text>
                </div>

                <div className="metric-pill">
                  <span className="metric-pill-label">Taupunkt außen</span>
                  <Text className="temperature-value">{current ? `${current.dewPointOutdoor.toFixed(1)}°C` : '--'}</Text>
                  <Text size="sm" c="dimmed">
                    Vergleichswert fürs Auslüften
                  </Text>
                </div>
              </SimpleGrid>

              <div className="metric-pill">
                <Text className="surface-label" c="dimmed" mb={6}>
                  Einschätzung
                </Text>
                <Text fw={700} size={isMobile ? 'sm' : 'md'}>
                  {recommendation}
                </Text>
              </div>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      <StatCards cards={statCards} />
    </Paper>
  )
}
