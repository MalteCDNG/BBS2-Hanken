import {
  ActionIcon,
  Badge,
  Button,
  Container,
  Flex,
  Group,
  NativeSelect,
  Select,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconClock, IconDashboard, IconMoonStars, IconRefresh, IconSunHigh } from '@tabler/icons-react'

export function HeaderBar({
  refreshInterval,
  onIntervalChange,
  onManualRefresh,
  isRefreshing,
  lastUpdatedRelative,
}: {
  refreshInterval: number
  onIntervalChange: (value: number) => void
  onManualRefresh: () => void
  isRefreshing: boolean
  lastUpdatedRelative: string
}) {
  const refreshSeconds = refreshInterval / 1000
  const isMobile = useMediaQuery('(max-width: 36em)')
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const { setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const toggleColorScheme = () => setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')

  if (isMobile) {
    return (
      <Container size="xl" h="100%">
        <Stack justify="center" gap="xs" h="100%" py={8}>
          <Group justify="center" gap="sm" wrap="nowrap">
            <Tooltip label="Nach oben scrollen" withArrow>
              <ThemeIcon
                size={38}
                radius="md"
                variant="gradient"
                gradient={{ from: 'blue', to: 'teal' }}
                onClick={scrollToTop}
                style={{ cursor: 'pointer', flexShrink: 0 }}
              >
                <IconDashboard size={20} />
              </ThemeIcon>
            </Tooltip>

            <div>
              <Text fw={700} ta="left">
                Taupunktmonitor
              </Text>
              <Text size="xs" c="dimmed">
                Sensorboard live im Blick
              </Text>
            </div>
          </Group>

          <Group justify="center" gap="xs" wrap="wrap">
            <Badge color="green" variant="light" leftSection={<IconClock size={14} />}>
              {lastUpdatedRelative}
            </Badge>
            <Badge variant="light" color="gray">
              Auto {refreshSeconds}s
            </Badge>
            <Tooltip label="Farbschema umschalten" withArrow>
              <ActionIcon variant="default" size="lg" aria-label="Farbschema umschalten" onClick={toggleColorScheme}>
                {computedColorScheme === 'dark' ? <IconSunHigh size={18} /> : <IconMoonStars size={18} />}
              </ActionIcon>
            </Tooltip>
          </Group>

          <Group grow align="stretch" wrap="nowrap">
            <NativeSelect
              size="sm"
              value={String(refreshInterval)}
              data={[
                { value: '5000', label: 'Refresh 5s' },
                { value: '10000', label: 'Refresh 10s' },
                { value: '30000', label: 'Refresh 30s' },
                { value: '60000', label: 'Refresh 60s' },
              ]}
              onChange={(event) => onIntervalChange(parseInt(event.currentTarget.value, 10))}
              aria-label="Aktualisierungsintervall"
            />

            <Button
              size="sm"
              variant="light"
              leftSection={<IconRefresh size={16} />}
              onClick={onManualRefresh}
              loading={isRefreshing}
            >
              Neu laden
            </Button>
          </Group>
        </Stack>
      </Container>
    )
  }

  return (
    <Container size="xl" h="100%">
      <Flex direction="row" justify="space-between" align="center" h="100%" gap="sm">
        <Group gap="sm" wrap="nowrap">
          <Tooltip label="Nach oben scrollen" withArrow>
            <ThemeIcon
              size={38}
              radius="md"
              variant="gradient"
              gradient={{ from: 'blue', to: 'teal' }}
              onClick={scrollToTop}
              style={{ cursor: 'pointer', flexShrink: 0 }}
            >
              <IconDashboard size={20} />
            </ThemeIcon>
          </Tooltip>

          <div style={{ minWidth: 0 }}>
            <Text fw={700}>Taupunktmonitor</Text>
            <Text size="xs" c="dimmed">
              Live-Auswertung des Raspberry Pi Sensorboards mit klaren Lüftungstipps
            </Text>
          </div>
        </Group>

        <Group gap="xs" wrap="nowrap">
          <Tooltip label="Letzter Eingang von Sensordaten" withArrow>
            <Badge color="green" variant="light" leftSection={<IconClock size={14} />}>
              {lastUpdatedRelative}
            </Badge>
          </Tooltip>

          <Tooltip label="Farbschema umschalten" withArrow>
            <ActionIcon variant="default" size="lg" aria-label="Farbschema umschalten" onClick={toggleColorScheme}>
              {computedColorScheme === 'dark' ? <IconSunHigh size={18} /> : <IconMoonStars size={18} />}
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Aktualisierungshäufigkeit wählen" withArrow>
            <Select
              size="xs"
              value={String(refreshInterval)}
              data={[
                { value: '5000', label: '5s' },
                { value: '10000', label: '10s' },
                { value: '30000', label: '30s' },
                { value: '60000', label: '60s' },
              ]}
              allowDeselect={false}
              onChange={(value) => value && onIntervalChange(parseInt(value, 10))}
              aria-label="Aktualisierungsintervall"
              w={120}
            />
          </Tooltip>

          <Tooltip label={`Automatischer Refresh alle ${refreshSeconds}s`} withArrow>
            <Badge variant="light" color="gray">
              Auto {refreshSeconds}s
            </Badge>
          </Tooltip>

          <Tooltip label="Messwerte manuell neu laden" withArrow>
            <Button
              size="xs"
              variant="light"
              leftSection={<IconRefresh size={16} />}
              onClick={onManualRefresh}
              loading={isRefreshing}
            >
              Refresh
            </Button>
          </Tooltip>
        </Group>
      </Flex>
    </Container>
  )
}
