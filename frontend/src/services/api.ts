import axios from 'axios'

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

  return response.data
}

export async function fetchHistory(
  start: string,
  end: string
): Promise<ReadingWithDewPoint[]> {
  const { data } = await api.get<ReadingWithDewPoint[]>(API_ROUTES.readings.history, {
    params: { start, end },
  })
  return data
}

export async function fetchFanStatus(): Promise<FanStatus | null> {
  const response = await api.get<FanStatus | ''>(API_ROUTES.fan.status)
  if (isNoContent(response.status, response.data)) {
    return null
  }

  return response.data
}

export async function toggleFan(): Promise<FanStatus> {
  const { data } = await api.post<FanStatus>(API_ROUTES.fan.toggle)
  return data
}

export { API_ROUTES }
