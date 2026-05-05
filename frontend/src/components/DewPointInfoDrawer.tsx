import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Badge, Box, Divider, Drawer, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title, alpha, useMantineTheme } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconCalculator, IconDroplet, IconShieldCheck, IconWind } from '@tabler/icons-react'
import { useAppShellStyles } from '../ui/app-shell'
import { useDashboardTypography } from '../ui/typography'

const guideCards = [
  {
    title: 'Was ist der Taupunkt?',
    icon: <IconDroplet size={18} />,
    text: 'Der Taupunkt ist die Temperatur, bei der die Luft mit Wasserdampf gesättigt ist. Wird Luft oder eine Oberfläche darunter kühler, kann Wasser kondensieren.',
  },
  {
    title: 'Was sagt er aus?',
    icon: <IconShieldCheck size={18} />,
    text: 'Je höher der Taupunkt, desto mehr Wasser ist tatsächlich in der Luft. Er ist deshalb oft aussagekräftiger als relative Luftfeuchte allein.',
  },
  {
    title: 'Warum für Schimmel wichtig?',
    icon: <IconDroplet size={18} />,
    text: 'Wenn Wände, Fenster oder Ecken kälter als der Taupunkt sind, entsteht Kondenswasser. Dauerhaft feuchte Oberflächen erhöhen das Schimmelrisiko.',
  },
  {
    title: 'Warum beim Lüften?',
    icon: <IconWind size={18} />,
    text: 'Liegt der Taupunkt draußen niedriger als innen, bringt Lüften trockenere Luft in den Raum. Liegt er draußen höher, kann Lüften Feuchte eintragen.',
  },
]

const formulaTerms = [
  {
    symbol: 'T',
    label: 'Temperatur',
    text: 'Gemessene Lufttemperatur in Grad Celsius.',
  },
  {
    symbol: 'rF',
    label: 'Relative Feuchte',
    text: 'Wie viel Prozent der maximal möglichen Feuchte die Luft gerade enthält.',
  },
  {
    symbol: 'e_s',
    label: 'Sättigungsdampfdruck',
    text: 'Maximal möglicher Wasserdampfdruck der Luft bei der aktuellen Temperatur.',
  },
  {
    symbol: 'e',
    label: 'Dampfdruck',
    text: 'Der tatsächlich vorhandene Wasserdampfdruck: rF als Anteil von e_s.',
  },
  {
    symbol: 'v',
    label: 'Hilfswert',
    text: 'Logarithmischer Zwischenwert, mit dem aus dem Dampfdruck der Taupunkt berechnet wird.',
  },
  {
    symbol: 'T_d',
    label: 'Taupunkt',
    text: 'Die Temperatur, bei der die Luft mit Feuchte gesättigt wäre.',
  },
  {
    symbol: 'a, b',
    label: 'Magnus-Konstanten',
    text: 'Zahlenwerte der Formel: über 0 °C a=7,5 und b=237,3, darunter a=7,6 und b=250,7.',
  },
]

const dewPointExample = (() => {
  const temperature = 21.5
  const humidity = 58
  const a = 7.5
  const b = 237.3
  const saturationPressure = 6.1078 * 10 ** ((a * temperature) / (b + temperature))
  const vaporPressure = (humidity / 100) * saturationPressure
  const vaporLog = Math.log10(vaporPressure / 6.1078)
  const dewPoint = (b * vaporLog) / (a - vaporLog)

  return {
    temperature,
    humidity,
    a,
    b,
    saturationPressure,
    vaporPressure,
    vaporLog,
    dewPoint,
  }
})()

function formatDecimal(value: number, digits: number) {
  return value.toFixed(digits).replace('.', ',')
}

function FormulaLine({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const measureRef = useRef<HTMLSpanElement | null>(null)
  const [fontSize, setFontSize] = useState(14)

  useLayoutEffect(() => {
    function updateFontSize() {
      const container = containerRef.current
      const measure = measureRef.current

      if (!container || !measure) {
        return
      }

      const availableWidth = Math.max(0, container.clientWidth - 6)
      const requiredWidth = measure.scrollWidth

      if (availableWidth <= 0 || requiredWidth <= 0) {
        return
      }

      const nextFontSize = Math.min(14, Math.max(7, Math.floor((availableWidth / requiredWidth) * 14 * 100) / 100))
      setFontSize(nextFontSize)
    }

    updateFontSize()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateFontSize)
      return () => window.removeEventListener('resize', updateFontSize)
    }

    const observer = new ResizeObserver(updateFontSize)
    const container = containerRef.current

    if (container) {
      observer.observe(container)
    }

    return () => observer.disconnect()
  }, [children])

  const lineStyle = {
    alignItems: 'center',
    display: 'inline-flex',
    gap: 4,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
  } as const

  return (
    <Box ref={containerRef} style={{ minWidth: 0, overflow: 'hidden', position: 'relative', width: '100%' }}>
      <span
        ref={measureRef}
        aria-hidden="true"
        style={{
          ...lineStyle,
          fontFamily: 'monospace',
          fontSize: 14,
          fontWeight: 800,
          pointerEvents: 'none',
          position: 'absolute',
          visibility: 'hidden',
        }}
      >
        {children}
      </span>
      <Text
        component="span"
        fw={800}
        ff="monospace"
        style={{
          ...lineStyle,
          fontSize,
          maxWidth: '100%',
        }}
      >
        {children}
      </Text>
    </Box>
  )
}

function FormulaFraction({ numerator, denominator }: { numerator: string; denominator: string }) {
  return (
    <Box component="span" style={{ display: 'inline-grid', gridTemplateRows: 'auto auto', verticalAlign: 'middle' }}>
      <span style={{ borderBottom: '1px solid currentColor', fontWeight: 800, lineHeight: 1.1, textAlign: 'center' }}>
        {numerator}
      </span>
      <span style={{ fontWeight: 800, lineHeight: 1.1, textAlign: 'center' }}>
        {denominator}
      </span>
    </Box>
  )
}

function FormulaStep({
  label,
  formula,
  result,
}: {
  label: string
  formula: ReactNode
  result: string
}) {
  return (
    <Box
      style={{
        padding: 12,
        borderRadius: 10,
        border: '1px solid var(--mantine-color-default-border)',
        background: 'var(--mantine-color-body)',
      }}
    >
      <Stack gap={6}>
        <Text size="xs" c="dimmed" fw={700} tt="uppercase">
          {label}
        </Text>
        <FormulaLine>
          {formula}
        </FormulaLine>
        <Badge variant="light" color="seafoam" w="fit-content">
          {result}
        </Badge>
      </Stack>
    </Box>
  )
}

export function DewPointInfoDrawer({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const isMobile = useMediaQuery('(max-width: 48em)')
  const theme = useMantineTheme()
  const shellStyles = useAppShellStyles()
  const typography = useDashboardTypography()
  const formulaSurface = shellStyles.isDark ? alpha(theme.colors.dark[5], 0.72) : alpha(theme.colors.ocean[0], 0.74)

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position={isMobile ? 'bottom' : 'right'}
      size={isMobile ? '88%' : 'lg'}
      padding={isMobile ? 'md' : 'xl'}
      overlayProps={{ backgroundOpacity: 0.35, blur: 4 }}
      title={
        <Stack gap={4}>
          <Text c="dimmed" style={typography.sectionLabel}>
            Wissen
          </Text>
          <Title order={2} ff={theme.headings.fontFamily}>
            Taupunkt kurz erklärt
          </Title>
        </Stack>
      }
    >
      <Stack gap="lg">
        <Text c="dimmed">
          Der Taupunkt hilft euch einzuschätzen, ob die Luft eher Feuchte abgeben oder aufnehmen kann. Genau darum ist er für
          Lüftung, Kondensation und Schimmelvorsorge so praktisch.
        </Text>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          {guideCards.map((card) => (
            <Paper key={card.title} p="md" radius="lg" withBorder>
              <Stack gap="sm">
                <Group gap="sm" wrap="nowrap" align="center">
                  <ThemeIcon radius="xl" variant="light" color="ocean">
                    {card.icon}
                  </ThemeIcon>
                  <Text fw={800}>{card.title}</Text>
                </Group>
                <Text size="sm" c="dimmed">
                  {card.text}
                </Text>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>

        <Paper p="md" radius="lg" withBorder>
          <Stack gap="sm">
            <Group gap="sm" wrap="nowrap" align="center">
              <ThemeIcon radius="xl" variant="light" color="amber">
                <IconCalculator size={18} />
              </ThemeIcon>
              <Text fw={800}>Wie wird er berechnet?</Text>
            </Group>

            <Text size="sm" c="dimmed">
              Das Backend nutzt die Magnus-Formel über Sättigungsdampfdruck und Dampfdruck. Als Eingaben reichen Temperatur
              in Grad Celsius und relative Luftfeuchte in Prozent.
            </Text>

            <Stack gap="xs">
              <Text span style={typography.metricLabel}>
                Formelzeichen
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                {formulaTerms.map((term) => (
                  <Box
                    key={term.symbol}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--mantine-color-default-border)',
                      background: shellStyles.isDark ? alpha(theme.white, 0.04) : alpha(theme.white, 0.62),
                    }}
                  >
                    <Group gap="sm" align="flex-start" wrap="nowrap">
                      <Badge variant="light" color="ocean" ff="monospace" miw={44}>
                        {term.symbol}
                      </Badge>
                      <Stack gap={2} style={{ minWidth: 0 }}>
                        <Text fw={800} size="sm">
                          {term.label}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {term.text}
                        </Text>
                      </Stack>
                    </Group>
                  </Box>
                ))}
              </SimpleGrid>
            </Stack>

            <Box
              style={{
                padding: isMobile ? 12 : 14,
                borderRadius: theme.radius.lg,
                border: `1px solid ${shellStyles.isDark ? alpha(theme.white, 0.08) : alpha(theme.colors.ocean[8], 0.1)}`,
                background: formulaSurface,
              }}
            >
              <Stack gap="md">
                <Group gap="xs" wrap="wrap">
                  <Badge variant="filled" color="ocean">
                    T = {formatDecimal(dewPointExample.temperature, 1)} °C
                  </Badge>
                  <Badge variant="filled" color="seafoam">
                    rF = {dewPointExample.humidity} %
                  </Badge>
                  <Badge variant="light" color="ocean">
                    a = {formatDecimal(dewPointExample.a, 1)}
                  </Badge>
                  <Badge variant="light" color="ocean">
                    b = {formatDecimal(dewPointExample.b, 1)}
                  </Badge>
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                  <FormulaStep
                    label="1. Sättigungsdampfdruck"
                    formula={
                      <>
                        <span>e_s = 6,1078 · 10^(</span>
                        <FormulaFraction numerator="a · T" denominator="b + T" />
                        <span>)</span>
                      </>
                    }
                    result={`e_s = ${formatDecimal(dewPointExample.saturationPressure, 2)} hPa`}
                  />
                  <FormulaStep
                    label="2. Dampfdruck"
                    formula={<span>e = rF / 100 · e_s</span>}
                    result={`e = ${formatDecimal(dewPointExample.vaporPressure, 2)} hPa`}
                  />
                  <FormulaStep
                    label="3. Hilfswert"
                    formula={<span>v = log10(e / 6,1078)</span>}
                    result={`v = ${formatDecimal(dewPointExample.vaporLog, 4)}`}
                  />
                  <FormulaStep
                    label="4. Taupunkt"
                    formula={
                      <>
                        <span>T_d = </span>
                        <FormulaFraction numerator="b · v" denominator="a - v" />
                      </>
                    }
                    result={`T_d = ${formatDecimal(dewPointExample.dewPoint, 1)} °C`}
                  />
                </SimpleGrid>

                <Divider />

                <Text size="sm" c="dimmed">
                  Im Beispiel mit {formatDecimal(dewPointExample.temperature, 1)} °C und {dewPointExample.humidity} %
                  relativer Feuchte liegt der Taupunkt also bei etwa {formatDecimal(dewPointExample.dewPoint, 1)} °C.
                </Text>
              </Stack>
            </Box>

            <Group gap="xs" wrap="wrap">
              <Badge variant="light" color="ocean">
                ab 0 °C: a=7.5, b=237.3
              </Badge>
              <Badge variant="light" color="seafoam">
                unter 0 °C: a=7.6, b=250.7
              </Badge>
            </Group>
          </Stack>
        </Paper>

        <Paper component="div" style={shellStyles.metricPanel}>
          <Text span style={typography.metricLabel}>
            Merksatz
          </Text>
          <Text fw={800} ff={theme.headings.fontFamily}>
            Innen-Taupunkt höher als außen: Lüften kann Feuchte rausbringen.
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            Innen-Taupunkt niedriger oder gleich: Lüften ist für Entfeuchtung meist weniger wirksam.
          </Text>
        </Paper>
      </Stack>
    </Drawer>
  )
}
