import axios from 'axios'

const AUTH_TOKEN_STORAGE_KEY = 'bbs2-hanken-auth-token'
const FAN_OVERRIDE_DURATION_STORAGE_KEY = 'bbs2-hanken-fan-override-duration'

export interface ReadingWithDewPoint {
  timestamp: string
  indoorTemp: number
  outdoorTemp: number
  indoorHumidity: number
  outdoorHumidity: number
  dewPointIndoor: number
  dewPointOutdoor: number
}

export interface FanStatus {
  running: boolean
  updatedAt: string
  override: string | null
}

export interface AuthToken {
  access_token: string
  token_type: string
}

export interface CurrentUser {
  username: string
  email: string | null
  full_name: string | null
  disabled: boolean | null
}

export interface AppSettings {
  dht22_indoor_address: string
  dht22_outdoor_address: string
  data_cron: string
  fan_override_duration: number
}

const API_ROUTES = {
  auth: {
    me: '/auth/me/',
    token: '/auth/token/',
  },
  fan: {
    status: '/fan/',
    toggle: '/fan/toggle/',
  },
  insert: {
    create: '/insert/',
  },
  readings: {
    current: '/readings/current/',
    history: '/readings/history/',
    historyDelta: '/readings/history/delta/',
  },
  settings: {
    root: '/settings/',
    dht22IndoorAddress: '/settings/dht22_indoor_address/',
    dht22OutdoorAddress: '/settings/dht22_outdoor_address/',
  },
  websocket: '/ws/',
} as const

const baseURL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/+$/, '')

const api = axios.create({
  baseURL,
})

export function getStoredAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
}

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
}

api.interceptors.request.use((config) => {
  const token = getStoredAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

function normalizeApiTimestamp(timestamp: string): string {
  const hasExplicitTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(timestamp)
  return hasExplicitTimezone ? timestamp : `${timestamp}Z`
}

function normalizeReading<T extends ReadingWithDewPoint>(reading: T): T {
  return {
    ...reading,
    timestamp: normalizeApiTimestamp(reading.timestamp),
  }
}

function normalizeFanStatus<T extends FanStatus>(status: T): T {
  return {
    ...status,
    updatedAt: normalizeApiTimestamp(status.updatedAt),
    override: status.override ? normalizeApiTimestamp(status.override) : null,
  }
}

export function normalizeFanOverrideDuration(duration: unknown): number | null {
  const value = typeof duration === 'number' ? duration : Number(duration)
  if (!Number.isFinite(value) || value <= 0) {
    return null
  }

  return Math.floor(value)
}

export function getStoredFanOverrideDuration(): number | null {
  return normalizeFanOverrideDuration(localStorage.getItem(FAN_OVERRIDE_DURATION_STORAGE_KEY))
}

export function setStoredFanOverrideDuration(duration: number) {
  const normalizedDuration = normalizeFanOverrideDuration(duration)
  if (normalizedDuration === null) {
    localStorage.removeItem(FAN_OVERRIDE_DURATION_STORAGE_KEY)
    return
  }

  localStorage.setItem(FAN_OVERRIDE_DURATION_STORAGE_KEY, String(normalizedDuration))
}

function formatDurationSecondsForApi(durationSeconds: number): string {
  return `PT${durationSeconds}S`
}

function isNoContent<T>(
  status: number,
  data: T | '' | null | undefined
): data is '' | null | undefined {
  return status === 204 || data == null || data === ''
}

export async function fetchCurrent(): Promise<ReadingWithDewPoint | null> {
  const response = await api.get<ReadingWithDewPoint | ''>(API_ROUTES.readings.current)
  if (isNoContent(response.status, response.data)) {
    return null
  }

  return normalizeReading(response.data)
}

export async function fetchHistory(
  start: string,
  end: string
): Promise<ReadingWithDewPoint[]> {
  const { data } = await api.get<ReadingWithDewPoint[]>(API_ROUTES.readings.history, {
    params: { start, end },
  })
  return data.map(normalizeReading)
}

export async function fetchFanStatus(): Promise<FanStatus | null> {
  const response = await api.get<FanStatus | ''>(API_ROUTES.fan.status)
  if (isNoContent(response.status, response.data)) {
    return null
  }

  return normalizeFanStatus(response.data)
}

export async function toggleFan(durationSeconds?: number | null): Promise<FanStatus> {
  const normalizedDuration = normalizeFanOverrideDuration(durationSeconds)
  const params = normalizedDuration === null ? undefined : { duration: formatDurationSecondsForApi(normalizedDuration) }
  const { data } = await api.post<FanStatus>(API_ROUTES.fan.toggle, undefined, { params })
  return normalizeFanStatus(data)
}

export async function login(username: string, password: string): Promise<AuthToken> {
  const body = new URLSearchParams()
  body.set('username', username)
  body.set('password', password)

  const { data } = await api.post<AuthToken>(API_ROUTES.auth.token, body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  setAuthToken(data.access_token)
  return data
}

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const { data } = await api.get<CurrentUser>(API_ROUTES.auth.me)
  return data
}

export async function fetchSettings(): Promise<AppSettings> {
  const { data } = await api.get<AppSettings>(API_ROUTES.settings.root)
  return data
}

export async function updateSettings(settings: AppSettings): Promise<string> {
  const { data } = await api.post<string>(API_ROUTES.settings.root, settings)
  return data
}

export { API_ROUTES }
