import {
  Badge,
  Box,
  Button,
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
import { IconArrowAutofitWidth, IconInfoCircle } from '@tabler/icons-react'
import { type ReadingWithDewPoint } from '../services/api'
import { AnimatedText } from '../ui/AnimatedText'
import { useAppShellStyles } from '../ui/app-shell'
import { useDashboardTypography } from '../ui/typography'

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

type ComparisonBandProps = {
  title: string
  leftLabel: string
  leftValue: string
  centerLabel: string
  centerValue: string
  centerColor: 'seafoam' | 'amber' | 'gray'
  rightLabel: string
  rightValue: string
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
  centerLabel,
  centerValue,
  centerColor,
  rightLabel,
  rightValue,
  comparisonSurface,
  softSurface,
  borderColor,
  connectorColor,
  softText,
  panelShadow,
  tileShadow,
  isMobile,
}: ComparisonBandProps) {
  const typography = useDashboardTypography()
  const metricTileStyle = {
    background: softSurface,
    borderColor,
    boxShadow: tileShadow,
    justifySelf: isMobile ? 'center' : undefined,
    width: isMobile ? 'min(100%, 326px)' : undefined,
  }

  return (
    <Stack gap={isMobile ? 6 : 'xs'}>
      <Text style={{ ...typography.sectionLabel, color: softText }}>
        {title}
      </Text>

      <Paper
        radius="lg"
        p={{ base: 'sm', sm: 'md' }}
        withBorder
        style={{ background: comparisonSurface, borderColor, boxShadow: panelShadow }}
      >
        <SimpleGrid cols={{ base: 1, xs: 3 }} spacing={{ base: 8, xs: 'sm' }}>
          <Paper radius="md" p={{ base: 'xs', sm: 'sm' }} withBorder style={metricTileStyle}>
            <Stack gap={3} h="100%" align={isMobile ? 'center' : 'stretch'}>
              <Text span ta={isMobile ? 'center' : undefined} style={typography.metricLabel}>
                {leftLabel}
              </Text>
              <AnimatedText
                valueKey={`${title}-${leftLabel}-${leftValue}`}
                ta={isMobile ? 'center' : undefined}
                style={{ ...typography.displayValue, ...compactMetricValueStyle, marginTop: 'auto' }}
              >
                {leftValue}
              </AnimatedText>
            </Stack>
          </Paper>

          <Stack gap={5} align="center" justify="center" px={isMobile ? 4 : 'xs'} py={isMobile ? 2 : 0}>
            <Text span ta="center" style={typography.metricLabel}>
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
              <ThemeIcon radius="md" size={isMobile ? 30 : 34} variant="filled" color={centerColor}>
                <IconArrowAutofitWidth size={isMobile ? 16 : 18} />
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
            <AnimatedText
              valueKey={`${title}-${centerLabel}-${centerValue}`}
              fw={800}
              ta="center"
              style={{ ...typography.displayValue, ...compactDeltaValueStyle }}
              variant="status"
            >
              {centerValue}
            </AnimatedText>
          </Stack>

          <Paper radius="md" p={{ base: 'xs', sm: 'sm' }} withBorder style={metricTileStyle}>
            <Stack gap={3} h="100%" align={isMobile ? 'center' : 'stretch'}>
              <Text span ta={isMobile ? 'center' : undefined} style={typography.metricLabel}>
                {rightLabel}
              </Text>
              <AnimatedText
                valueKey={`${title}-${rightLabel}-${rightValue}`}
                ta={isMobile ? 'center' : undefined}
                style={{ ...typography.displayValue, ...compactMetricValueStyle, marginTop: 'auto' }}
              >
                {rightValue}
              </AnimatedText>
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
  onOpenDewPointGuide,
}: {
  current: ReadingWithDewPoint | null
  lastUpdatedAbsolute: string
  lastUpdatedRelative: string
  onOpenDewPointGuide: () => void
}) {
  const isMobile = useMediaQuery('(max-width: 48em)')
  const theme = useMantineTheme()
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const isDark = colorScheme === 'dark'
  const shellStyles = useAppShellStyles()
  const typography = useDashboardTypography()

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
    dewPointDelta !== null ? (dewPointDelta > 0 ? 'seafoam' : dewPointDelta < 0 ? 'amber' : 'gray') : 'gray'

  const comparisonSurface = isDark
    ? `linear-gradient(145deg, ${alpha(theme.colors.ocean[9], 0.38)}, ${alpha(theme.colors.seafoam[9], 0.16)})`
    : `linear-gradient(145deg, ${alpha(theme.colors.ocean[1], 0.95)}, ${alpha(theme.colors.seafoam[1], 0.72)})`

  const softSurface = isDark
    ? alpha(theme.white, 0.04)
    : `linear-gradient(180deg, ${alpha(theme.white, 0.94)}, ${alpha(theme.colors.gray[0], 0.9)})`
  const borderColor = isDark ? alpha(theme.white, 0.1) : alpha(theme.colors.ocean[8], 0.11)
  const comparisonShadow = isDark ? undefined : `inset 0 1px 0 ${alpha(theme.white, 0.9)}, 0 14px 30px ${alpha(theme.colors.ocean[7], 0.07)}`
  const tileShadow = isDark ? undefined : `0 10px 24px ${alpha(theme.colors.dark[9], 0.05)}, inset 0 1px 0 ${alpha(theme.white, 0.92)}`
  const temperatureConnectorColor =
    dewPointDelta !== null && dewPointDelta > 0 ? theme.colors.seafoam[isDark ? 4 : 6] : theme.colors.amber[isDark ? 4 : 6]
  const humidityConnectorColor =
    humidityDelta !== null && humidityDelta <= 0 ? theme.colors.seafoam[isDark ? 4 : 6] : theme.colors.amber[isDark ? 4 : 6]
  const recommendationConnectorColor =
    dewPointDelta === null
      ? theme.colors.gray[isDark ? 4 : 6]
      : dewPointDelta > 0
        ? theme.colors.seafoam[isDark ? 4 : 6]
        : theme.colors.amber[isDark ? 4 : 6]
  const softText = isDark ? theme.colors.gray[4] : theme.colors.gray[7]

  return (
    <Paper className="bbs2-motion-panel" radius="lg" p={{ base: 'sm', xs: 'md', sm: 'lg' }} style={shellStyles.sectionPanel}>
      <Box style={shellStyles.sectionOverlay} />
      <Grid align="center" gap={{ base: 'sm', sm: 'lg', md: '1.5rem' }}>
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Stack gap={isMobile ? 'sm' : 'md'}>
            <Paper
              className="bbs2-hover-lift"
              radius="lg"
              withBorder
              p={{ base: 'xs', sm: 'sm' }}
              style={{
                maxWidth: 560,
                background: isDark ? alpha(theme.colors.ocean[9], 0.28) : alpha(theme.white, 0.78),
                borderColor,
                boxShadow: isDark ? undefined : `inset 0 1px 0 ${alpha(theme.white, 0.85)}`,
              }}
            >
              <Group justify="space-between" align="center" gap="xs" wrap="nowrap">
                <Stack gap={1} style={{ minWidth: 0 }}>
                  <Text c="dimmed" style={typography.sectionLabel}>
                    Aktuell
                  </Text>
                  <AnimatedText
                    valueKey={`hero-status-${climateLabel}`}
                    fw={800}
                    size={isMobile ? 'md' : 'lg'}
                    ff={theme.headings.fontFamily}
                    variant="status"
                    style={{ lineHeight: 1.1 }}
                  >
                    {climateLabel}
                  </AnimatedText>
                </Stack>
                <Badge variant="light" color={recommendationColor} style={{ ...typography.compactBadge, flexShrink: 0 }}>
                  {dewPointDelta !== null && dewPointDelta > 0 ? 'Lüften' : dewPointDelta !== null ? 'Warten' : '--'}
                </Badge>
              </Group>
            </Paper>

            <Stack gap={isMobile ? 'sm' : 'md'}>
              <Title order={1} style={typography.heroTitle}>
                Klarer Blick auf
                <Text span inherit style={typography.heroAccent}>
                  Taupunkt und Lüftung.
                </Text>
              </Title>
              <Text maw={isMobile ? undefined : 560} style={typography.heroCopy}>
                Live-Werte für innen und außen, Taupunktvergleich und eine schnelle Einschätzung fürs Auslüften in einer
                ruhigeren Übersicht.
              </Text>
              <Button
                variant="light"
                color="ocean"
                leftSection={<IconInfoCircle size={18} />}
                onClick={onOpenDewPointGuide}
                w={isMobile ? '100%' : 'fit-content'}
                size="sm"
              >
                Taupunkt verstehen
              </Button>
            </Stack>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Paper className="bbs2-motion-panel" radius="lg" p={{ base: 'sm', xs: 'md', sm: 'md' }} style={{ ...shellStyles.glassPanel, animationDelay: '90ms' }}>
            <Stack gap={isMobile ? 'xs' : 'sm'}>
              <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
                <Stack gap={2} style={{ flex: 1, minWidth: isMobile ? 0 : undefined }}>
                  <Text c="dimmed" style={typography.sectionLabel}>
                    Empfehlung
                  </Text>
                  <AnimatedText
                    valueKey={recommendation}
                    fw={800}
                    size={isMobile ? 'lg' : 'xl'}
                    ff={theme.headings.fontFamily}
                    variant="status"
                  >
                    {recommendation}
                  </AnimatedText>
                </Stack>

                <Badge
                  variant={isDark ? 'filled' : 'light'}
                  color="ocean"
                  style={typography.compactBadge}
                  title={`Zuletzt aktualisiert um ${lastUpdatedAbsolute}`}
                >
                  {lastUpdatedRelative}
                </Badge>
              </Group>

              <ComparisonBand
                title="Temperatur"
                leftLabel="Innen"
                leftValue={formatTemperature(current ? current.indoorTemp : null)}
                centerLabel="Differenz"
                centerValue={formatTemperature(temperatureDelta)}
                centerColor={dewPointDelta !== null && dewPointDelta > 0 ? 'seafoam' : 'amber'}
                rightLabel="Außen"
                rightValue={formatTemperature(current ? current.outdoorTemp : null)}
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
                centerLabel="Differenz"
                centerValue={formatHumidity(humidityDelta)}
                centerColor={humidityDelta !== null && humidityDelta <= 0 ? 'seafoam' : 'amber'}
                rightLabel="Außen"
                rightValue={formatHumidity(current ? current.outdoorHumidity : null)}
                comparisonSurface={comparisonSurface}
                softSurface={softSurface}
                borderColor={borderColor}
                connectorColor={humidityConnectorColor}
                softText={softText}
                panelShadow={comparisonShadow}
                tileShadow={tileShadow}
                isMobile={isMobile}
              />

              <ComparisonBand
                title="Einschätzung"
                leftLabel="Taupunkt innen"
                leftValue={formatTemperature(current ? current.dewPointIndoor : null)}
                centerLabel="Empfehlung"
                centerValue={dewPointDelta !== null && dewPointDelta > 0 ? 'Lüften' : dewPointDelta !== null ? 'Warten' : '--'}
                centerColor={recommendationColor}
                rightLabel="Taupunkt außen"
                rightValue={formatTemperature(current ? current.dewPointOutdoor : null)}
                comparisonSurface={comparisonSurface}
                softSurface={softSurface}
                borderColor={borderColor}
                connectorColor={recommendationConnectorColor}
                softText={softText}
                panelShadow={comparisonShadow}
                tileShadow={tileShadow}
                isMobile={isMobile}
              />
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Paper>
  )
}
