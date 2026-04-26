import {
  ActionIcon,
  Box,
  Button,
  Container,
  Group,
  NativeSelect,
  Paper,
  Select,
  Stack,
  Text,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconMoonStars, IconRefresh, IconSettings, IconSunHigh } from '@tabler/icons-react'

const intervalOptions = [
  { value: '5000', label: '5s' },
  { value: '10000', label: '10s' },
  { value: '30000', label: '30s' },
  { value: '60000', label: '60s' },
]

export function HeaderBar({
  refreshInterval,
  onIntervalChange,
  onManualRefresh,
  onOpenAdmin,
  isRefreshing,
}: {
  refreshInterval: number
  onIntervalChange: (value: number) => void
  onManualRefresh: () => void
  onOpenAdmin: () => void
  isRefreshing: boolean
}) {
  const isMobile = useMediaQuery('(max-width: 48em)')
  const isNarrowMobile = useMediaQuery('(max-width: 30em)')
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const { setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const toggleColorScheme = () => setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')

  const brand = (
    <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
      <Tooltip label="Nach oben scrollen" withArrow>
        <Box
          className="brand-mark"
          onClick={scrollToTop}
          style={{
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <img src="/Logo.png" alt="Taupunktmonitor Logo" />
        </Box>
      </Tooltip>

      <div style={{ minWidth: 0 }}>
        <Text fw={800} size={isNarrowMobile ? 'md' : 'lg'} ff="var(--app-font-display)">
          Taupunktmonitor
        </Text>
        <Text size="sm" c="dimmed" maw={340}>
          {isNarrowMobile ? 'Taupunkt und Lüftersteuerung.' : 'Live-Dashboard für Sensorwerte, Taupunkt und Lüftersteuerung.'}
        </Text>
      </div>
    </Group>
  )

  if (isMobile) {
    return (
      <Container size="xl" h="100%" py="xs">
        <Paper className="glass-panel fade-in-up" px={{ base: 'sm', xs: 'md' }} py="sm" radius="xl">
          <Stack gap="md">
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              {brand}

              <Group gap="xs" wrap="nowrap">
                <Tooltip label="Admin-Einstellungen öffnen" withArrow>
                  <ActionIcon variant="white" size="lg" aria-label="Admin-Einstellungen öffnen" onClick={onOpenAdmin}>
                    <IconSettings size={18} />
                  </ActionIcon>
                </Tooltip>

                <Tooltip label="Farbschema umschalten" withArrow>
                  <ActionIcon variant="white" size="lg" aria-label="Farbschema umschalten" onClick={toggleColorScheme}>
                    {computedColorScheme === 'dark' ? <IconSunHigh size={18} /> : <IconMoonStars size={18} />}
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>

            <NativeSelect
              size="sm"
              value={String(refreshInterval)}
              data={intervalOptions.map((option) => ({
                value: option.value,
                label: `Refresh ${option.label}`,
              }))}
              onChange={(event) => onIntervalChange(parseInt(event.currentTarget.value, 10))}
              aria-label="Aktualisierungsintervall"
            />
          </Stack>
        </Paper>
      </Container>
    )
  }

  return (
    <Container size="xl" h="100%" py="sm">
      <Paper className="glass-panel fade-in-up" px="lg" py="sm" radius="xl">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap="lg" wrap="nowrap" style={{ minWidth: 0 }}>
            {brand}
          </Group>

          <Group gap="xs" wrap="nowrap">
            <Tooltip label="Aktualisierungsintervall wählen" withArrow>
              <Select
                size="sm"
                value={String(refreshInterval)}
                data={intervalOptions}
                allowDeselect={false}
                onChange={(value) => value && onIntervalChange(parseInt(value, 10))}
                aria-label="Aktualisierungsintervall"
                w={96}
              />
            </Tooltip>

            <Tooltip label="Messwerte manuell neu laden" withArrow>
              <Button
                size="sm"
                variant="gradient"
                gradient={{ from: 'ocean.7', to: 'seafoam.5', deg: 145 }}
                leftSection={<IconRefresh size={16} />}
                onClick={onManualRefresh}
                loading={isRefreshing}
              >
                Refresh
              </Button>
            </Tooltip>

            <Tooltip label="Admin-Einstellungen öffnen" withArrow>
              <ActionIcon variant="white" size="lg" aria-label="Admin-Einstellungen öffnen" onClick={onOpenAdmin}>
                <IconSettings size={18} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Farbschema umschalten" withArrow>
              <ActionIcon variant="white" size="lg" aria-label="Farbschema umschalten" onClick={toggleColorScheme}>
                {computedColorScheme === 'dark' ? <IconSunHigh size={18} /> : <IconMoonStars size={18} />}
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Paper>
    </Container>
  )
}
