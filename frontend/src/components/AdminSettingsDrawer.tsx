import { Component, useCallback, useEffect, useState } from 'react'
import type { ErrorInfo, FormEvent, ReactNode } from 'react'
import axios from 'axios'
import {
  Alert,
  Badge,
  Button,
  Divider,
  Drawer,
  Group,
  Loader,
  NumberInput,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import {
  IconAlertCircle,
  IconCheck,
  IconDeviceFloppy,
  IconLogin,
  IconLogout,
  IconSettings,
  IconUser,
} from '@tabler/icons-react'
import {
  clearAuthToken,
  fetchCurrentUser,
  fetchSettings,
  getStoredAuthToken,
  login,
  updateSettings,
  type AppSettings,
  type CurrentUser,
} from '../services/api'

class AdminDrawerErrorBoundary extends Component<
  { children: ReactNode; onReset: () => void },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    console.error('Admin drawer crashed', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false })
    this.props.onReset()
  }

  render() {
    if (this.state.hasError) {
      return (
        <Paper p="md" radius="lg" withBorder>
          <Stack gap="md">
            <Alert icon={<IconAlertCircle size={18} />} color="red" variant="light" radius="lg">
              Der Adminbereich konnte nicht gerendert werden. Die restliche Seite bleibt verfügbar.
            </Alert>
            <Button type="button" variant="light" color="ocean" onClick={this.handleReset}>
              Adminbereich zurücksetzen
            </Button>
          </Stack>
        </Paper>
      )
    }

    return this.props.children
  }
}

function normalizeSettings(settings: AppSettings): AppSettings {
  return {
    dht22_indoor_address: settings.dht22_indoor_address ?? '',
    dht22_outdoor_address: settings.dht22_outdoor_address ?? '',
    data_cron: settings.data_cron ?? '',
    fan_override_duration: Number(settings.fan_override_duration) || 0,
  }
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    return 'Benutzername, Passwort oder Session sind nicht gültig.'
  }

  return fallback
}

export function AdminSettingsDrawer({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  return (
    <AdminDrawerErrorBoundary onReset={onClose}>
      <AdminSettingsDrawerContent opened={opened} onClose={onClose} />
    </AdminDrawerErrorBoundary>
  )
}

function AdminSettingsDrawerContent({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const isMobile = useMediaQuery('(max-width: 48em)')
  const [authChecked, setAuthChecked] = useState(false)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [settingsForm, setSettingsForm] = useState<AppSettings | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isLoadingSettings, setIsLoadingSettings] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    setIsLoadingSettings(true)
    setSettingsError(null)
    setSettingsSuccess(null)

    try {
      const settings = await fetchSettings()
      setSettingsForm(normalizeSettings(settings))
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearAuthToken()
        setCurrentUser(null)
        setSettingsForm(null)
      }

      setSettingsError(getApiErrorMessage(error, 'Einstellungen konnten nicht geladen werden.'))
    } finally {
      setIsLoadingSettings(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function verifyStoredToken() {
      const storedToken = getStoredAuthToken()
      if (!storedToken) {
        setAuthChecked(true)
        return
      }

      setIsCheckingAuth(true)
      try {
        const user = await fetchCurrentUser()
        if (!cancelled) {
          setCurrentUser(user)
          setAuthError(null)
        }
      } catch (error) {
        clearAuthToken()
        if (!cancelled) {
          setCurrentUser(null)
          setAuthError(getApiErrorMessage(error, 'Gespeicherte Session konnte nicht geprüft werden.'))
        }
      } finally {
        if (!cancelled) {
          setIsCheckingAuth(false)
          setAuthChecked(true)
        }
      }
    }

    verifyStoredToken()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (opened && currentUser && !settingsForm && !isLoadingSettings) {
      queueMicrotask(() => {
        void loadSettings()
      })
    }
  }, [currentUser, isLoadingSettings, loadSettings, opened, settingsForm])

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const username = String(formData.get('username') || '')
    const password = String(formData.get('password') || '')

    setIsLoggingIn(true)
    setAuthError(null)
    setSettingsError(null)
    setSettingsSuccess(null)

    try {
      await login(username, password)
      const user = await fetchCurrentUser()
      setCurrentUser(user)
      setSettingsForm(null)
    } catch (error) {
      clearAuthToken()
      setCurrentUser(null)
      setAuthError(getApiErrorMessage(error, 'Login konnte nicht ausgeführt werden. Läuft das Backend?'))
    } finally {
      setIsLoggingIn(false)
    }
  }

  function handleLogout() {
    clearAuthToken()
    setCurrentUser(null)
    setSettingsForm(null)
    setSettingsError(null)
    setSettingsSuccess(null)
    setAuthError(null)
  }

  async function handleSaveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!settingsForm) {
      return
    }

    const formData = new FormData(event.currentTarget)
    const nextSettings: AppSettings = {
      dht22_indoor_address: String(formData.get('dht22_indoor_address') || ''),
      dht22_outdoor_address: String(formData.get('dht22_outdoor_address') || ''),
      data_cron: String(formData.get('data_cron') || ''),
      fan_override_duration: Number(formData.get('fan_override_duration')) || 0,
    }

    setIsSavingSettings(true)
    setSettingsError(null)
    setSettingsSuccess(null)

    try {
      await updateSettings(nextSettings)
      setSettingsForm(nextSettings)
      setSettingsSuccess('Einstellungen wurden gespeichert.')
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearAuthToken()
        setCurrentUser(null)
        setSettingsForm(null)
      }

      setSettingsError(getApiErrorMessage(error, 'Einstellungen konnten nicht gespeichert werden.'))
    } finally {
      setIsSavingSettings(false)
    }
  }

  const title = (
    <Stack gap={4}>
      <Text className="surface-label" c="dimmed">
        Admin
      </Text>
      <Title order={2} ff="var(--app-font-display)">
        Einstellungen
      </Title>
    </Stack>
  )

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position={isMobile ? 'bottom' : 'right'}
      size={isMobile ? '92%' : 'lg'}
      padding={isMobile ? 'md' : 'xl'}
      overlayProps={{ backgroundOpacity: 0.35, blur: 4 }}
      title={title}
    >
      <Stack gap="lg">
        {!authChecked || isCheckingAuth ? (
          <Paper p="md" radius="lg" withBorder>
            <Group gap="sm">
              <Loader size="sm" />
              <Text fw={700}>Session wird geprüft</Text>
            </Group>
          </Paper>
        ) : currentUser ? (
          <>
            <Paper p="md" radius="lg" withBorder>
              <Group justify="space-between" align="center" wrap="wrap">
                <Group gap="sm" wrap="nowrap">
                  <ThemeIcon radius="xl" variant="light" color="ocean">
                    <IconUser size={18} />
                  </ThemeIcon>
                  <div>
                    <Text fw={800}>{currentUser.full_name || currentUser.username}</Text>
                    <Text size="sm" c="dimmed">
                      {currentUser.email || currentUser.username}
                    </Text>
                  </div>
                </Group>

                <Button variant="light" color="gray" leftSection={<IconLogout size={16} />} onClick={handleLogout}>
                  Logout
                </Button>
              </Group>
            </Paper>

            <Alert icon={<IconAlertCircle size={18} />} color="yellow" variant="light" radius="lg">
              Sensor-URLs sind im Frontend vorbereitet. Das aktuelle Backend nutzt für den Mess-Cron aber weiterhin die
              URLs aus der .env-Konfiguration.
            </Alert>

            <form onSubmit={handleSaveSettings}>
              <Paper p="md" radius="lg" withBorder>
                <Stack gap="md">
                  <Group justify="space-between" align="center" wrap="wrap">
                    <Group gap="sm" wrap="nowrap">
                      <ThemeIcon radius="xl" variant="light" color="seafoam">
                        <IconSettings size={18} />
                      </ThemeIcon>
                      <div>
                        <Text fw={800}>Backend-Settings</Text>
                        <Text size="sm" c="dimmed">
                          Wird als kompletter Settings-Body gespeichert.
                        </Text>
                      </div>
                    </Group>

                    {settingsForm ? (
                      <Badge variant="light" color="seafoam">
                        geladen
                      </Badge>
                    ) : null}
                  </Group>

                  <Divider />

                  {settingsError ? (
                    <Alert icon={<IconAlertCircle size={18} />} color="red" variant="light" radius="lg">
                      {settingsError}
                    </Alert>
                  ) : null}

                  {settingsSuccess ? (
                    <Alert icon={<IconCheck size={18} />} color="green" variant="light" radius="lg">
                      {settingsSuccess}
                    </Alert>
                  ) : null}

                  {isLoadingSettings ? (
                    <Group gap="sm">
                      <Loader size="sm" />
                      <Text c="dimmed">Einstellungen werden geladen</Text>
                    </Group>
                  ) : settingsForm ? (
                    <>
                      <TextInput
                        key={`indoor-${settingsForm.dht22_indoor_address}`}
                        name="dht22_indoor_address"
                        label="Innen-Sensor URL"
                        placeholder="http://127.0.0.1:8000/get/"
                        defaultValue={settingsForm.dht22_indoor_address}
                      />

                      <TextInput
                        key={`outdoor-${settingsForm.dht22_outdoor_address}`}
                        name="dht22_outdoor_address"
                        label="Außen-Sensor URL"
                        placeholder="http://127.0.0.1:8001/get/"
                        defaultValue={settingsForm.dht22_outdoor_address}
                      />

                      <TextInput
                        key={`cron-${settingsForm.data_cron}`}
                        name="data_cron"
                        label="Messintervall Cron"
                        placeholder="*/30 * * * *"
                        defaultValue={settingsForm.data_cron}
                      />

                      <NumberInput
                        key={`override-${settingsForm.fan_override_duration}`}
                        name="fan_override_duration"
                        label="Lüfter-Override-Dauer"
                        suffix=" Sekunden"
                        min={0}
                        step={60}
                        defaultValue={settingsForm.fan_override_duration}
                      />

                      <Button
                        type="submit"
                        variant="gradient"
                        gradient={{ from: 'ocean.7', to: 'seafoam.5', deg: 145 }}
                        leftSection={<IconDeviceFloppy size={18} />}
                        loading={isSavingSettings}
                      >
                        Einstellungen speichern
                      </Button>
                    </>
                  ) : (
                    <Button type="button" variant="light" color="ocean" onClick={loadSettings}>
                      Einstellungen laden
                    </Button>
                  )}
                </Stack>
              </Paper>
            </form>
          </>
        ) : (
          <form onSubmit={handleLogin}>
            <Paper p="md" radius="lg" withBorder>
              <Stack gap="md">
                <Group gap="sm" wrap="nowrap">
                  <ThemeIcon radius="xl" variant="light" color="ocean">
                    <IconLogin size={18} />
                  </ThemeIcon>
                  <div>
                    <Text fw={800}>Admin-Login</Text>
                    <Text size="sm" c="dimmed">
                      Für geschützte Backend-Einstellungen anmelden.
                    </Text>
                  </div>
                </Group>

                {authError ? (
                  <Alert icon={<IconAlertCircle size={18} />} color="red" variant="light" radius="lg">
                    {authError}
                  </Alert>
                ) : null}

                <TextInput name="username" label="Username" autoComplete="username" required />

                <PasswordInput name="password" label="Passwort" autoComplete="current-password" required />

                <Button
                  type="submit"
                  variant="gradient"
                  gradient={{ from: 'ocean.7', to: 'seafoam.5', deg: 145 }}
                  leftSection={<IconLogin size={18} />}
                  loading={isLoggingIn}
                >
                  Einloggen
                </Button>
              </Stack>
            </Paper>
          </form>
        )}
      </Stack>
    </Drawer>
  )
}
