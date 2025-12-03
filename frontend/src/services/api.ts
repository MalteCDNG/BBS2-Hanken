import axios from 'axios'

export interface SensorReading {
  indoorTemp: number
  outdoorTemp: number
  dewPoint: number
  humidity?: number
  timestamp: string
}

export interface FanStatus {
  running: boolean
  updatedAt: string
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
})

export async function fetchCurrent(): Promise<SensorReading> {
  const { data } = await api.get<SensorReading>('/readings/current/')
  return data
}

export async function fetchHistory(
  start: string,
  end: string
): Promise<SensorReading[]> {
  const { data } = await api.get<SensorReading[]>('/readings/history/', {
    params: { start, end },
  })
  return data
}

export async function fetchFanStatus(): Promise<FanStatus> {
  const { data } = await api.get<FanStatus>('/fan/')
  return data
}

export async function toggleFan(): Promise<FanStatus> {
  const { data } = await api.post<FanStatus>('/fan/toggle/')
  return data
}
