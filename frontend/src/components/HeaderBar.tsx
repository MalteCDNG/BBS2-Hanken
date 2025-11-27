import {
  ActionIcon,
  Badge,
  Button,
  Container,
  Group,
  Select,
  Text,
  ThemeIcon,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core'
import { IconDashboard, IconRefresh, IconClock, IconMoonStars, IconSunHigh } from '@tabler/icons-react'

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
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const { setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const toggleColorScheme = () =>
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')

  return (
    <Container size="xl" h="100%">
      <Group justify="space-between" align="center" h="100%">
        <Group>
          <Tooltip label="Nach oben scrollen" withArrow>
            <ThemeIcon
              size={38}
              radius="md"
              variant="gradient"
              gradient={{ from: 'blue', to: 'teal' }}
              onClick={scrollToTop}
              style={{ cursor: 'pointer' }}
            >
              <IconDashboard size={20} />
            </ThemeIcon>
          </Tooltip>
          <div>
            <Text fw={700}>Taupunktmonitor</Text>
            <Text size="xs" c="dimmed">
              Live-Auswertung des Raspberry Pi Sensorboards mit klaren Lüftungstipps
            </Text>
          </div>
        </Group>
        <Group gap="sm" wrap="wrap" justify="flex-end">
          <Tooltip label="Letzter Eingang von Sensordaten" withArrow>
            <Badge color="green" variant="light" leftSection={<IconClock size={14} />}>
              {lastUpdatedRelative}
            </Badge>
          </Tooltip>
          <Tooltip label="Farbschema umschalten" withArrow>
            <ActionIcon
              variant="default"
              size="lg"
              aria-label="Farbschema umschalten"
              onClick={toggleColorScheme}
            >
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
              Aktualisierung alle {refreshSeconds}s
            </Badge>
          </Tooltip>
          <Tooltip label="Messwerte manuell neu laden" withArrow>
            <Button size="xs" variant="light" leftSection={<IconRefresh size={16} />} onClick={onManualRefresh} loading={isRefreshing}>
              Refresh
            </Button>
          </Tooltip>
        </Group>
      </Group>
    </Container>
  )
}
