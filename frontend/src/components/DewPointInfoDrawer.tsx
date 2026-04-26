import { Badge, Box, Code, Drawer, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconCalculator, IconDroplet, IconShieldCheck, IconWind } from '@tabler/icons-react'

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

const formula = `e_s = 6.1078 * 10^((a * T) / (b + T))
e   = (relative Feuchte / 100) * e_s
v   = log10(e / 6.1078)
Taupunkt = (b * v) / (a - v)`

export function DewPointInfoDrawer({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const isMobile = useMediaQuery('(max-width: 48em)')

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
          <Text className="surface-label" c="dimmed">
            Wissen
          </Text>
          <Title order={2} ff="var(--app-font-display)">
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

            <Code block style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {formula}
            </Code>

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

        <Box className="metric-pill">
          <Text className="metric-pill-label">Merksatz</Text>
          <Text fw={800} ff="var(--app-font-display)">
            Innen-Taupunkt höher als außen: Lüften kann Feuchte rausbringen.
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            Innen-Taupunkt niedriger oder gleich: Lüften ist für Entfeuchtung meist weniger wirksam.
          </Text>
        </Box>
      </Stack>
    </Drawer>
  )
}
