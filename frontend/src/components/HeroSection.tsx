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
import { IconArrowAutofitWidth, IconCloud, IconHome, IconInfoCircle } from '@tabler/icons-react'
import { type ReadingWithDewPoint } from '../services/api'
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
  leftIcon: React.ReactNode
  leftColor: 'ocean' | 'seafoam'
  centerLabel: string
  centerValue: string
  centerHint: string
  centerColor: 'teal' | 'orange' | 'gray'
  rightLabel: string
  rightValue: string
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
  leftIcon,
  leftColor,
  centerLabel,
  centerValue,
  centerHint,
  centerColor,
  rightLabel,
  rightValue,
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
  const typography = useDashboardTypography()

  return (
    <Stack gap={isMobile ? 6 : 'xs'}>
      <Text style={{ ...typography.sectionLabel, color: softText }}>
        {title}
      </Text>

      <Paper
        radius="xl"
        p={{ base: 'sm', sm: 'md' }}
        withBorder
        style={{ background: comparisonSurface, borderColor, boxShadow: panelShadow }}
      >
        <SimpleGrid cols={{ base: 1, xs: 3 }} spacing={{ base: 8, xs: 'sm' }}>
          <Paper radius={isMobile ? 'md' : 'lg'} p={{ base: 'xs', sm: 'sm' }} withBorder style={{ background: softSurface, borderColor, boxShadow: tileShadow }}>
            <Stack gap={3} h="100%">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Text span style={typography.metricLabel}>
                  {leftLabel}
                </Text>
                <ThemeIcon radius="xl" size={isMobile ? 28 : 30} variant="light" color={leftColor}>
                  {leftIcon}
                </ThemeIcon>
              </Group>
              <Text style={{ ...typography.displayValue, ...compactMetricValueStyle, marginTop: 'auto' }}>
                {leftValue}
              </Text>
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
              <ThemeIcon radius="xl" size={isMobile ? 30 : 34} variant="filled" color={centerColor}>
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
            <Text fw={800} ta="center" style={{ ...typography.displayValue, ...compactDeltaValueStyle }}>
              {centerValue}
            </Text>
            {centerHint ? (
              <Text size="xs" c="dimmed" ta="center">
                {centerHint}
              </Text>
            ) : null}
          </Stack>

          <Paper radius={isMobile ? 'md' : 'lg'} p={{ base: 'xs', sm: 'sm' }} withBorder style={{ background: softSurface, borderColor, boxShadow: tileShadow }}>
            <Stack gap={3} h="100%">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Text span style={typography.metricLabel}>
                  {rightLabel}
                </Text>
                <ThemeIcon radius="xl" size={isMobile ? 28 : 30} variant="light" color={rightColor}>
                  {rightIcon}
                </ThemeIcon>
              </Group>
              <Text style={{ ...typography.displayValue, ...compactMetricValueStyle, marginTop: 'auto' }}>
                {rightValue}
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
  const temperatureConnectorColor =
    dewPointDelta !== null && dewPointDelta > 0 ? theme.colors.teal[isDark ? 4 : 6] : theme.colors.orange[isDark ? 4 : 6]
  const humidityConnectorColor =
    humidityDelta !== null && humidityDelta <= 0 ? theme.colors.teal[isDark ? 4 : 6] : theme.colors.orange[isDark ? 4 : 6]
  const recommendationConnectorColor =
    dewPointDelta === null
      ? theme.colors.gray[isDark ? 4 : 6]
      : dewPointDelta > 0
        ? theme.colors.teal[isDark ? 4 : 6]
        : theme.colors.orange[isDark ? 4 : 6]
  const softText = isDark ? theme.colors.gray[4] : theme.colors.gray[7]

  return (
    <Paper radius="xl" p={{ base: 'sm', xs: 'md', sm: 'xl' }} style={shellStyles.sectionPanel}>
      <Box style={shellStyles.sectionOverlay} />
      <Grid align="center" gap={{ base: 'sm', sm: 'lg', md: '2rem' }}>
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Stack gap={isMobile ? 'sm' : 'lg'}>
            <Group gap="sm" wrap="nowrap" style={typography.kicker}>
              <Box style={typography.kickerDot} />
              <Text span inherit>
                Smart Monitoring
              </Text>
            </Group>

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
                size={isMobile ? 'sm' : 'md'}
              >
                Taupunkt verstehen
              </Button>
            </Stack>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Paper radius="xl" p={{ base: 'sm', xs: 'md', sm: 'lg' }} style={shellStyles.glassPanel}>
            <Stack gap={isMobile ? 'xs' : 'sm'}>
              <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
                <Stack gap={2} style={{ flex: 1, minWidth: isMobile ? 0 : undefined }}>
                  <Text c="dimmed" style={typography.sectionLabel}>
                    Live Snapshot
                  </Text>
                  <Text fw={800} size={isMobile ? 'lg' : 'xl'} ff={theme.headings.fontFamily}>
                    {climateLabel}
                  </Text>
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
                leftIcon={<IconHome size={16} />}
                leftColor="ocean"
                centerLabel="Differenz"
                centerValue={formatTemperature(temperatureDelta)}
                centerHint=""
                centerColor={dewPointDelta !== null && dewPointDelta > 0 ? 'teal' : 'orange'}
                rightLabel="Außen"
                rightValue={formatTemperature(current ? current.outdoorTemp : null)}
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
                leftIcon={<IconHome size={16} />}
                leftColor="ocean"
                centerLabel="Differenz"
                centerValue={formatHumidity(humidityDelta)}
                centerHint=""
                centerColor={humidityDelta !== null && humidityDelta <= 0 ? 'teal' : 'orange'}
                rightLabel="Außen"
                rightValue={formatHumidity(current ? current.outdoorHumidity : null)}
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

              <ComparisonBand
                title="Einschätzung"
                leftLabel="Taupunkt innen"
                leftValue={formatTemperature(current ? current.dewPointIndoor : null)}
                leftIcon={<IconHome size={16} />}
                leftColor="ocean"
                centerLabel="Empfehlung"
                centerValue={dewPointDelta !== null && dewPointDelta > 0 ? 'Lüften' : dewPointDelta !== null ? 'Warten' : '--'}
                centerHint={recommendation}
                centerColor={recommendationColor}
                rightLabel="Taupunkt außen"
                rightValue={formatTemperature(current ? current.dewPointOutdoor : null)}
                rightIcon={<IconCloud size={16} />}
                rightColor="seafoam"
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
