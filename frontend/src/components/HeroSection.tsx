import {
  Badge,
  Box,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  alpha,
  useComputedColorScheme,
  useMantineTheme,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconArrowAutofitWidth, IconCloud, IconHome } from '@tabler/icons-react'
import { type ReadingWithDewPoint } from '../services/api'

function formatTemperature(value: number | null) {
  return value === null ? '--' : `${value.toFixed(1)}°C`
}

function formatHumidity(value: number | null) {
  return value === null ? '--' : `${value.toFixed(0)}%`
}

const compactMetricValueStyle = {
  fontSize: 'clamp(1.6rem, 2.2vw, 2.2rem)',
}

const compactDeltaValueStyle = {
  fontSize: 'clamp(1.35rem, 1.8vw, 1.85rem)',
}

const prominentAssessmentValueStyle = {
  fontSize: 'clamp(1.75rem, 2.3vw, 2.5rem)',
}

type ComparisonBandProps = {
  title: string
  leftLabel: string
  leftValue: string
  leftHint: string
  leftIcon: React.ReactNode
  leftColor: 'ocean' | 'seafoam'
  centerLabel: string
  centerValue: string
  centerHint: string
  centerColor: 'teal' | 'orange'
  rightLabel: string
  rightValue: string
  rightHint: string
  rightIcon: React.ReactNode
  rightColor: 'ocean' | 'seafoam'
  comparisonSurface: string
  softSurface: string
  borderColor: string
  connectorColor: string
  softText: string
  panelShadow?: string
  tileShadow?: string
  isMobile: boolean
}

function ComparisonBand({
  title,
  leftLabel,
  leftValue,
  leftHint,
  leftIcon,
  leftColor,
  centerLabel,
  centerValue,
  centerHint,
  centerColor,
  rightLabel,
  rightValue,
  rightHint,
  rightIcon,
  rightColor,
  comparisonSurface,
  softSurface,
  borderColor,
  connectorColor,
  softText,
  panelShadow,
  tileShadow,
  isMobile,
}: ComparisonBandProps) {
  return (
    <Stack gap="xs">
      <Text className="surface-label" style={{ color: softText }}>
        {title}
      </Text>

      <Paper
        radius="xl"
        p={{ base: 'sm', sm: 'md' }}
        withBorder
        style={{ background: comparisonSurface, borderColor, boxShadow: panelShadow }}
      >
        <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="sm">
          <Paper radius="lg" p="sm" withBorder style={{ background: softSurface, borderColor, boxShadow: tileShadow }}>
            <Stack gap={4}>
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Text className="metric-pill-label">{leftLabel}</Text>
                <ThemeIcon radius="xl" size={30} variant="light" color={leftColor}>
                  {leftIcon}
                </ThemeIcon>
              </Group>
              <Text className="temperature-value" style={compactMetricValueStyle}>
                {leftValue}
              </Text>
              <Text size="sm" c={softText}>
                {leftHint}
              </Text>
            </Stack>
          </Paper>

          <Stack gap={6} align="center" justify="center" px="xs">
            <Text className="metric-pill-label" ta="center">
              {centerLabel}
            </Text>
            <Group gap={8} wrap="nowrap" align="center">
              <Box
                style={{
                  width: isMobile ? 28 : 36,
                  height: 2,
                  borderRadius: 999,
                  background: alpha(connectorColor, 0.45),
                }}
              />
              <ThemeIcon radius="xl" size={34} variant="filled" color={centerColor}>
                <IconArrowAutofitWidth size={18} />
              </ThemeIcon>
              <Box
                style={{
                  width: isMobile ? 28 : 36,
                  height: 2,
                  borderRadius: 999,
                  background: alpha(connectorColor, 0.45),
                }}
              />
            </Group>
            <Text fw={800} className="live-card-value" ta="center" style={compactDeltaValueStyle}>
              {centerValue}
            </Text>
            {centerHint ? (
              <Text size="xs" c="dimmed" ta="center">
                {centerHint}
              </Text>
            ) : null}
          </Stack>

          <Paper radius="lg" p="sm" withBorder style={{ background: softSurface, borderColor, boxShadow: tileShadow }}>
            <Stack gap={4}>
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Text className="metric-pill-label">{rightLabel}</Text>
                <ThemeIcon radius="xl" size={30} variant="light" color={rightColor}>
                  {rightIcon}
                </ThemeIcon>
              </Group>
              <Text className="temperature-value" style={compactMetricValueStyle}>
                {rightValue}
              </Text>
              <Text size="sm" c={softText}>
                {rightHint}
              </Text>
            </Stack>
          </Paper>
        </SimpleGrid>
      </Paper>
    </Stack>
  )
}

export function HeroSection({
  current,
  lastUpdatedAbsolute,
  lastUpdatedRelative,
}: {
  current: ReadingWithDewPoint | null
  lastUpdatedAbsolute: string
  lastUpdatedRelative: string
}) {
  const isMobile = useMediaQuery('(max-width: 48em)')
  const theme = useMantineTheme()
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const isDark = colorScheme === 'dark'

  const temperatureDelta = current ? current.indoorTemp - current.outdoorTemp : null
  const humidityDelta = current ? current.indoorHumidity - current.outdoorHumidity : null
  const dewPointDelta = current ? current.dewPointIndoor - current.dewPointOutdoor : null

  const climateLabel = current
    ? current.indoorHumidity >= 70
      ? 'Aufmerksam beobachten'
      : current.indoorHumidity >= 55
        ? 'Raumklima stabil'
        : 'Eher trocken'
    : 'Noch keine Live-Daten'

  const recommendation = current
    ? dewPointDelta !== null && dewPointDelta > 0
      ? 'Lüften lohnt sich.'
      : 'Lüften lohnt sich nicht.'
    : 'Sobald Messwerte eintreffen, erscheint hier die Einschätzung.'

  const recommendationColor =
    dewPointDelta !== null ? (dewPointDelta > 0 ? 'teal' : dewPointDelta < 0 ? 'orange' : 'gray') : 'gray'

  const comparisonSurface = isDark
    ? `linear-gradient(145deg, ${alpha(theme.colors.ocean[9], 0.34)}, ${alpha(theme.colors.seafoam[9], 0.14)})`
    : `linear-gradient(145deg, ${alpha(theme.colors.ocean[1], 0.98)}, ${alpha(theme.colors.seafoam[1], 0.88)})`

  const softSurface = isDark
    ? alpha(theme.white, 0.04)
    : `linear-gradient(180deg, ${alpha(theme.white, 0.94)}, ${alpha(theme.colors.gray[0], 0.9)})`
  const borderColor = isDark ? alpha(theme.white, 0.1) : alpha(theme.colors.ocean[8], 0.12)
  const comparisonShadow = isDark ? undefined : `inset 0 1px 0 ${alpha(theme.white, 0.9)}, 0 14px 30px ${alpha(theme.colors.ocean[7], 0.08)}`
  const tileShadow = isDark ? undefined : `0 10px 24px ${alpha(theme.colors.dark[9], 0.05)}, inset 0 1px 0 ${alpha(theme.white, 0.92)}`
  const assessmentSurface = isDark
    ? softSurface
    : `linear-gradient(180deg, ${alpha(theme.white, 0.78)}, ${alpha(theme.colors.gray[0], 0.72)})`
  const assessmentTileSurface = isDark
    ? alpha(theme.white, 0.03)
    : `linear-gradient(180deg, ${alpha(theme.white, 0.94)}, ${alpha(theme.colors.gray[0], 0.86)})`
  const assessmentTileShadow = isDark ? undefined : `0 8px 18px ${alpha(theme.colors.dark[9], 0.04)}, inset 0 1px 0 ${alpha(theme.white, 0.9)}`
  const temperatureConnectorColor =
    dewPointDelta !== null && dewPointDelta > 0 ? theme.colors.teal[isDark ? 4 : 6] : theme.colors.orange[isDark ? 4 : 6]
  const humidityConnectorColor =
    humidityDelta !== null && humidityDelta <= 0 ? theme.colors.teal[isDark ? 4 : 6] : theme.colors.orange[isDark ? 4 : 6]
  const softText = isDark ? theme.colors.gray[4] : theme.colors.gray[7]

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
              <Text className="hero-copy" c="dimmed" maw={isMobile ? undefined : 560}>
                Live-Werte für innen und außen, Taupunktvergleich und eine schnelle Einschätzung fürs Auslüften in einer
                ruhigeren Übersicht.
              </Text>
            </Stack>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Paper className="glass-panel" radius="xl" p={{ base: 'md', sm: 'lg' }}>
            <Stack gap="sm">
              <Group justify="space-between" align="flex-start" wrap="wrap">
                <Stack gap={2}>
                  <Text className="surface-label" c="dimmed">
                    Live Snapshot
                  </Text>
                  <Text fw={800} size="xl" ff="var(--app-font-display)">
                    {climateLabel}
                  </Text>
                </Stack>

                <Badge variant={isDark ? 'filled' : 'light'} color="ocean" title={`Zuletzt aktualisiert um ${lastUpdatedAbsolute}`}>
                  {lastUpdatedRelative}
                </Badge>
              </Group>

              <ComparisonBand
                title="Temperatur"
                leftLabel="Innen"
                leftValue={formatTemperature(current ? current.indoorTemp : null)}
                leftHint="Im Raum"
                leftIcon={<IconHome size={16} />}
                leftColor="ocean"
                centerLabel="Differenz"
                centerValue={formatTemperature(temperatureDelta)}
                centerHint=""
                centerColor={dewPointDelta !== null && dewPointDelta > 0 ? 'teal' : 'orange'}
                rightLabel="Außen"
                rightValue={formatTemperature(current ? current.outdoorTemp : null)}
                rightHint="Vor Ort"
                rightIcon={<IconCloud size={16} />}
                rightColor="seafoam"
                comparisonSurface={comparisonSurface}
                softSurface={softSurface}
                borderColor={borderColor}
                connectorColor={temperatureConnectorColor}
                softText={softText}
                panelShadow={comparisonShadow}
                tileShadow={tileShadow}
                isMobile={isMobile}
              />

              <ComparisonBand
                title="Luftfeuchte"
                leftLabel="Innen"
                leftValue={formatHumidity(current ? current.indoorHumidity : null)}
                leftHint="Im Raum"
                leftIcon={<IconHome size={16} />}
                leftColor="ocean"
                centerLabel="Differenz"
                centerValue={formatHumidity(humidityDelta)}
                centerHint=""
                centerColor={humidityDelta !== null && humidityDelta <= 0 ? 'teal' : 'orange'}
                rightLabel="Außen"
                rightValue={formatHumidity(current ? current.outdoorHumidity : null)}
                rightHint="Vor Ort"
                rightIcon={<IconCloud size={16} />}
                rightColor="seafoam"
                comparisonSurface={comparisonSurface}
                softSurface={softSurface}
                borderColor={borderColor}
                connectorColor={humidityConnectorColor}
                softText={softText}
                panelShadow={comparisonShadow}
                tileShadow={tileShadow}
                isMobile={isMobile}
              />

              <Paper radius="lg" p="sm" withBorder style={{ background: assessmentSurface, borderColor, boxShadow: comparisonShadow }}>
                <Stack gap="sm">
                  <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
                    <Stack gap={4} style={{ flex: 1, minWidth: 220 }}>
                      <Text className="surface-label" c="dimmed">
                        Einschätzung
                      </Text>
                      {!current ? (
                        <Text fw={700} size="sm">
                          {recommendation}
                        </Text>
                      ) : null}
                    </Stack>

                    <Badge color={recommendationColor} variant={isDark ? 'filled' : 'light'}>
                      {dewPointDelta !== null && dewPointDelta > 0 ? 'Lüften lohnt sich' : 'Lüften lohnt sich nicht'}
                    </Badge>
                  </Group>

                  <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="sm">
                    <Paper radius="md" p="sm" withBorder style={{ background: assessmentTileSurface, borderColor, boxShadow: assessmentTileShadow }}>
                      <Box
                        style={{
                          height: 38,
                          display: 'flex',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Text className="metric-pill-label">Taupunkt innen</Text>
                      </Box>
                      <Text fw={800} className="temperature-value" style={prominentAssessmentValueStyle}>
                        {formatTemperature(current ? current.dewPointIndoor : null)}
                      </Text>
                    </Paper>

                    <Paper radius="md" p="sm" withBorder style={{ background: assessmentTileSurface, borderColor, boxShadow: assessmentTileShadow }}>
                      <Box
                        style={{
                          height: 38,
                          display: 'flex',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Text className="metric-pill-label">Differenz</Text>
                      </Box>
                      <Text fw={800} className="temperature-value" style={prominentAssessmentValueStyle}>
                        {formatTemperature(dewPointDelta)}
                      </Text>
                    </Paper>

                    <Paper radius="md" p="sm" withBorder style={{ background: assessmentTileSurface, borderColor, boxShadow: assessmentTileShadow }}>
                      <Box
                        style={{
                          height: 38,
                          display: 'flex',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Text className="metric-pill-label">Taupunkt außen</Text>
                      </Box>
                      <Text fw={800} className="temperature-value" style={prominentAssessmentValueStyle}>
                        {formatTemperature(current ? current.dewPointOutdoor : null)}
                      </Text>
                    </Paper>
                  </SimpleGrid>
                </Stack>
              </Paper>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Paper>
  )
}
