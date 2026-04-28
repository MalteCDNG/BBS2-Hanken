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
  UnstyledButton,
  alpha,
  useComputedColorScheme,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconMoonStars, IconRefresh, IconSettings, IconSunHigh } from '@tabler/icons-react'
import { useAppShellStyles } from '../ui/app-shell'
import { useDashboardTypography } from '../ui/typography'

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
  const theme = useMantineTheme()
  const shellStyles = useAppShellStyles()
  const typography = useDashboardTypography()
  const toggleColorScheme = () => setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')

  const brand = (
    <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
      <Tooltip label="Nach oben scrollen" withArrow>
        <UnstyledButton
          onClick={scrollToTop}
          style={{
            flexShrink: 0,
            width: isNarrowMobile ? 44 : 52,
            height: isNarrowMobile ? 44 : 52,
            padding: 3,
            borderRadius: isNarrowMobile ? 14 : 18,
            background: `linear-gradient(160deg, ${theme.colors.ocean[6]}, ${theme.colors.seafoam[5]})`,
            boxShadow: `0 18px 30px ${alpha(theme.colors.ocean[6], 0.28)}`,
          }}
        >
          <Box
            component="img"
            src="/Logo.png"
            alt="Taupunktmonitor Logo"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: isNarrowMobile ? 11 : 15,
              objectFit: 'cover',
              background: alpha(theme.white, computedColorScheme === 'dark' ? 0.16 : 0.82),
            }}
          />
        </UnstyledButton>
      </Tooltip>

      <Box style={{ minWidth: 0 }}>
        <Text fw={800} size={isNarrowMobile ? 'md' : 'lg'} ff={theme.headings.fontFamily}>
          Taupunktmonitor
        </Text>
        <Text size="sm" c="dimmed" maw={340}>
          {isNarrowMobile ? 'Taupunkt und Lüftersteuerung.' : 'Live-Dashboard für Sensorwerte, Taupunkt und Lüftersteuerung.'}
        </Text>
      </Box>
    </Group>
  )

  if (isMobile) {
    return (
      <Container size="xl" h="100%" px={0} py={4}>
        <Paper
          className="bbs2-motion-panel"
          px={{ base: 'sm', xs: 'md' }}
          py={{ base: 'xs', xs: 'sm' }}
          radius="lg"
          style={{
            ...shellStyles.glassPanel,
            paddingBottom: theme.spacing.sm,
          }}
        >
          <Stack gap="xs">
            <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
              {brand}

              <Group gap={6} wrap="nowrap" align="center">
                <Tooltip label="Admin-Einstellungen öffnen" withArrow>
                  <ActionIcon variant="white" size={isNarrowMobile ? 'md' : 'lg'} aria-label="Admin-Einstellungen öffnen" onClick={onOpenAdmin}>
                    <IconSettings size={17} />
                  </ActionIcon>
                </Tooltip>

                <Tooltip label="Farbschema umschalten" withArrow>
                  <ActionIcon variant="white" size={isNarrowMobile ? 'md' : 'lg'} aria-label="Farbschema umschalten" onClick={toggleColorScheme}>
                    {computedColorScheme === 'dark' ? <IconSunHigh size={17} /> : <IconMoonStars size={17} />}
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>

            <Group grow align="end" gap="xs" wrap="nowrap">
              <NativeSelect
                size="sm"
                label="Refresh"
                value={String(refreshInterval)}
                data={intervalOptions.map((option) => ({
                  value: option.value,
                  label: `Alle ${option.label}`,
                }))}
                onChange={(event) => onIntervalChange(parseInt(event.currentTarget.value, 10))}
                aria-label="Aktualisierungsintervall"
                styles={{
                  label: {
                    ...typography.sectionLabel,
                    marginBottom: 6,
                    color: computedColorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.gray[6],
                  },
                }}
              />

              <Tooltip label="Messwerte manuell neu laden" withArrow>
                <Button
                  size="sm"
                  variant="light"
                  color="ocean"
                  leftSection={<IconRefresh size={15} />}
                  onClick={onManualRefresh}
                  loading={isRefreshing}
                  fullWidth
                >
                  Jetzt
                </Button>
              </Tooltip>
            </Group>
          </Stack>
        </Paper>
      </Container>
    )
  }

  return (
    <Container size="xl" h="100%" py="sm">
      <Paper className="bbs2-motion-panel" px="lg" py="sm" radius="lg" style={shellStyles.glassPanel}>
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
