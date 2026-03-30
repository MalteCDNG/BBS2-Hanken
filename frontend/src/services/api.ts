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

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
})

function isNoContent<T>(
  status: number,
  data: T | '' | null | undefined
): data is '' | null | undefined {
  return status === 204 || data == null || data === ''
}

export async function fetchCurrent(): Promise<ReadingWithDewPoint | null> {
  const response = await api.get<ReadingWithDewPoint | ''>('/readings/current/')
  if (isNoContent(response.status, response.data)) {
    return null
  }

  return response.data
}

export async function fetchHistory(
  start: string,
  end: string
): Promise<ReadingWithDewPoint[]> {
  const { data } = await api.get<ReadingWithDewPoint[]>('/readings/history/', {
    params: { start, end },
  })
  return data
}

export async function fetchFanStatus(): Promise<FanStatus | null> {
  const response = await api.get<FanStatus | ''>('/fan/')
  if (isNoContent(response.status, response.data)) {
    return null
  }

  return response.data
}

export async function toggleFan(): Promise<FanStatus> {
  const { data } = await api.post<FanStatus>('/fan/toggle/')
  return data
}
