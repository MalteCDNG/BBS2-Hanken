const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const Database = require('better-sqlite3')

const app = express()
const port = process.env.MOCK_SERVER_PORT || 4000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const BASELINE = {
  indoorTemp: 21,
  outdoorTemp: 12,
  indoorHumidity: 55,
  outdoorHumidity: 72,
}

const dataDir = path.join(__dirname, 'data')
const databasePath = path.join(dataDir, 'mock-backend-readings.db')

fs.mkdirSync(dataDir, { recursive: true })

const db = new Database(databasePath)
db.exec(`
  CREATE TABLE IF NOT EXISTS readings (
    timestamp TEXT PRIMARY KEY,
    indoorTemp REAL NOT NULL,
    outdoorTemp REAL NOT NULL,
    indoorHumidity REAL NOT NULL,
    outdoorHumidity REAL NOT NULL,
    dewPointIndoor REAL NOT NULL,
    dewPointOutdoor REAL NOT NULL
  );
`)

function calculateDewPoint(tempC, humidity) {
  const a = 17.27
  const b = 237.7
  const alpha = (a * tempC) / (b + tempC) + Math.log(humidity / 100)
  return (b * alpha) / (a - alpha)
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function getSeasonalShift(date) {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const millisPerYear = 365 * 24 * 60 * 60 * 1000
  const progress = (date.getTime() - startOfYear.getTime()) / millisPerYear
  return Math.sin(progress * 2 * Math.PI) * 6
}

function generateReading(previous, { timestamp = new Date(), seasonalShift = 0 } = {}) {
  const drift = (scale) => (Math.random() - 0.5) * scale

  const indoorBaseline = BASELINE.indoorTemp + seasonalShift * 0.35
  const outdoorBaseline = BASELINE.outdoorTemp + seasonalShift
  const indoorHumidityBaseline = clamp(BASELINE.indoorHumidity - seasonalShift * 0.25, 35, 75)
  const outdoorHumidityBaseline = clamp(BASELINE.outdoorHumidity + seasonalShift * 0.3, 45, 95)

  const indoorTemp = clamp(
    (previous?.indoorTemp ?? indoorBaseline) + (indoorBaseline - (previous?.indoorTemp ?? indoorBaseline)) * 0.2 + drift(0.8),
    17,
    26
  )
  const outdoorTemp = clamp(
    (previous?.outdoorTemp ?? outdoorBaseline) + (outdoorBaseline - (previous?.outdoorTemp ?? outdoorBaseline)) * 0.2 + drift(1.2),
    -10,
    32
  )
  const indoorHumidity = clamp(
    (previous?.indoorHumidity ?? indoorHumidityBaseline) +
      (indoorHumidityBaseline - (previous?.indoorHumidity ?? indoorHumidityBaseline)) * 0.15 +
      drift(3),
    30,
    90
  )
  const outdoorHumidity = clamp(
    (previous?.outdoorHumidity ?? outdoorHumidityBaseline) +
      (outdoorHumidityBaseline - (previous?.outdoorHumidity ?? outdoorHumidityBaseline)) * 0.15 +
      drift(4),
    35,
    100
  )
  const dewPointIndoor = calculateDewPoint(indoorTemp, indoorHumidity)
  const dewPointOutdoor = calculateDewPoint(outdoorTemp, outdoorHumidity)

  return {
    timestamp: new Date(timestamp).toISOString(),
    indoorTemp: Number(indoorTemp.toFixed(1)),
    outdoorTemp: Number(outdoorTemp.toFixed(1)),
    indoorHumidity: Number(indoorHumidity.toFixed(1)),
    outdoorHumidity: Number(outdoorHumidity.toFixed(1)),
    dewPointIndoor: Number(dewPointIndoor.toFixed(1)),
    dewPointOutdoor: Number(dewPointOutdoor.toFixed(1)),
  }
}

const insertReading = db.prepare(`
  INSERT OR REPLACE INTO readings (
    timestamp,
    indoorTemp,
    outdoorTemp,
    indoorHumidity,
    outdoorHumidity,
    dewPointIndoor,
    dewPointOutdoor
  )
  VALUES (
    @timestamp,
    @indoorTemp,
    @outdoorTemp,
    @indoorHumidity,
    @outdoorHumidity,
    @dewPointIndoor,
    @dewPointOutdoor
  )
`)

const getLatestReading = db.prepare(`
  SELECT
    timestamp,
    indoorTemp,
    outdoorTemp,
    indoorHumidity,
    outdoorHumidity,
    dewPointIndoor,
    dewPointOutdoor
  FROM readings
  ORDER BY timestamp DESC
  LIMIT 1
`)

const getHistoryReadings = db.prepare(`
  SELECT
    timestamp,
    indoorTemp,
    outdoorTemp,
    indoorHumidity,
    outdoorHumidity,
    dewPointIndoor,
    dewPointOutdoor
  FROM readings
  WHERE timestamp > ? AND timestamp < ?
  ORDER BY timestamp ASC
`)

function pruneOldReadings(referenceDate = new Date()) {
  const cutoff = new Date(referenceDate)
  cutoff.setFullYear(cutoff.getFullYear() - 1)

  db.prepare('DELETE FROM readings WHERE timestamp < ?').run(cutoff.toISOString())
}

function seedHistory() {
  const existingCount = db.prepare('SELECT COUNT(*) as count FROM readings').get().count
  if (existingCount > 0) {
    return
  }

  const end = new Date()
  const start = new Date(end)
  start.setFullYear(start.getFullYear() - 1)

  const insertTransaction = db.transaction(() => {
    let previous = null

    for (let time = start.getTime(); time <= end.getTime(); time += 60 * 60 * 1000) {
      const seasonalShift = getSeasonalShift(new Date(time))
      const reading = generateReading(previous, { timestamp: time, seasonalShift })
      insertReading.run(reading)
      previous = reading
    }
  })

  insertTransaction()
}

seedHistory()

let fanState = null
let settings = {
  dht22_indoor_address: 'http://127.0.0.1:8000/get/',
  dht22_outdoor_address: 'http://127.0.0.1:8001/get/',
  data_cron: '*/30 * * * *',
  fan_override_duration: 0,
}

const mockAuth = {
  username: process.env.MOCK_ADMIN_USERNAME || 'admin',
  password: process.env.MOCK_ADMIN_PASSWORD || 'admin',
  token: 'mock-admin-token',
}

function requireAuth(req, res, next) {
  const authorization = req.get('authorization') || ''
  if (authorization !== `Bearer ${mockAuth.token}`) {
    res.status(401).json({ detail: 'Could not validate credentials' })
    return
  }

  next()
}

app.get('/', (req, res) => {
  res.json({ Hello: 'World' })
})

app.post('/auth/token/', (req, res) => {
  const { username, password } = req.body

  if (username !== mockAuth.username || password !== mockAuth.password) {
    res.status(401).json({ detail: 'Incorrect username or password' })
    return
  }

  res.json({
    access_token: mockAuth.token,
    token_type: 'bearer',
  })
})

app.get('/auth/me/', requireAuth, (req, res) => {
  res.json({
    username: mockAuth.username,
    email: 'admin@mock.local',
    full_name: 'Mock Admin',
    disabled: false,
  })
})

app.get('/settings/', requireAuth, (req, res) => {
  res.json(settings)
})

app.post('/settings/', requireAuth, (req, res) => {
  settings = {
    dht22_indoor_address: String(req.body.dht22_indoor_address || ''),
    dht22_outdoor_address: String(req.body.dht22_outdoor_address || ''),
    data_cron: String(req.body.data_cron || ''),
    fan_override_duration: Number(req.body.fan_override_duration) || 0,
  }

  res.json('ok')
})

app.get('/readings/current/', (req, res) => {
  const now = new Date()
  const seasonalShift = getSeasonalShift(now)
  const latest = getLatestReading.get()
  const reading = generateReading(latest, { timestamp: now, seasonalShift })
  insertReading.run(reading)
  pruneOldReadings(now)

  res.json(reading)
})

app.get('/readings/history/', (req, res) => {
  const { start, end } = req.query

  if (typeof start !== 'string' || typeof end !== 'string') {
    res.status(400).json({ detail: 'Missing start or end query parameter.' })
    return
  }

  const readings = getHistoryReadings.all(start, end)
  res.json(readings)
})

app.get('/readings/history/delta/', (req, res) => {
  const { end, days } = req.query

  if (typeof end !== 'string' || typeof days !== 'string') {
    res.status(400).json({ detail: 'Missing end or days query parameter.' })
    return
  }

  const endDate = new Date(end)
  const dayCount = Number.parseInt(days, 10)

  if (Number.isNaN(endDate.getTime()) || Number.isNaN(dayCount)) {
    res.status(400).json({ detail: 'Invalid end or days query parameter.' })
    return
  }

  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - dayCount)

  const inclusiveEnd = new Date(endDate)
  inclusiveEnd.setDate(inclusiveEnd.getDate() + 1)

  const readings = getHistoryReadings.all(startDate.toISOString(), inclusiveEnd.toISOString())
  res.json(readings)
})

app.post('/insert/', (req, res) => {
  insertReading.run(req.body)
  res.json('OK')
})

app.get('/fan/', (req, res) => {
  if (!fanState) {
    res.status(204).send()
    return
  }

  res.json(fanState)
})

app.post('/fan/toggle/', (req, res) => {
  fanState = {
    running: !(fanState?.running ?? false),
    updatedAt: new Date().toISOString(),
  }

  res.json(fanState)
})

app.listen(port, () => {
  console.log(`Mock backend API listening on http://localhost:${port}`)
})
