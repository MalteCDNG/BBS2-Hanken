const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const Database = require('better-sqlite3')

const app = express()
const port = process.env.MOCK_SERVER_PORT || 4000

app.use(cors())
app.use(express.json())

const BASELINE = {
  indoor: 21,
  outdoor: 12,
  humidity: 55,
}

const dataDir = path.join(__dirname, 'data')
const databasePath = path.join(dataDir, 'mock-readings.db')

fs.mkdirSync(dataDir, { recursive: true })

const db = new Database(databasePath)
db.exec(`
  CREATE TABLE IF NOT EXISTS readings (
    timestamp TEXT PRIMARY KEY,
    indoorTemp REAL NOT NULL,
    outdoorTemp REAL NOT NULL,
    humidity REAL NOT NULL,
    dewPoint REAL NOT NULL
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

  const indoorBaseline = BASELINE.indoor + seasonalShift * 0.35
  const outdoorBaseline = BASELINE.outdoor + seasonalShift
  const humidityBaseline = BASELINE.humidity

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
  const humidity = clamp(
    (previous?.humidity ?? humidityBaseline) + (humidityBaseline - (previous?.humidity ?? humidityBaseline)) * 0.15 + drift(3),
    30,
    90
  )
  const dewPoint = calculateDewPoint(indoorTemp, humidity)

  return {
    timestamp: new Date(timestamp).toISOString(),
    indoorTemp: Number(indoorTemp.toFixed(1)),
    outdoorTemp: Number(outdoorTemp.toFixed(1)),
    humidity: Number(humidity.toFixed(1)),
    dewPoint: Number(dewPoint.toFixed(1)),
  }
}

const insertReading = db.prepare(`
  INSERT OR REPLACE INTO readings (timestamp, indoorTemp, outdoorTemp, humidity, dewPoint)
  VALUES (@timestamp, @indoorTemp, @outdoorTemp, @humidity, @dewPoint)
`)

const getLatestReading = db.prepare(`
  SELECT timestamp, indoorTemp, outdoorTemp, humidity, dewPoint
  FROM readings
  ORDER BY timestamp DESC
  LIMIT 1
`)

const getAllReadings = db.prepare(`
  SELECT timestamp, indoorTemp, outdoorTemp, humidity, dewPoint
  FROM readings
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

let fanState = {
  running: false,
  updatedAt: new Date().toISOString(),
}

app.get('/api/current', (req, res) => {
  const now = new Date()
  const seasonalShift = getSeasonalShift(now)
  const latest = getLatestReading.get()
  const reading = generateReading(latest, { timestamp: now, seasonalShift })
  insertReading.run(reading)
  pruneOldReadings(now)

  res.json(reading)
})

app.get('/api/history', (req, res) => {
  const readings = getAllReadings.all()
  res.json({ readings })
})

app.get('/api/fan', (req, res) => {
  res.json(fanState)
})

app.post('/api/fan/toggle', (req, res) => {
  fanState = {
    running: !fanState.running,
    updatedAt: new Date().toISOString(),
  }

  res.json(fanState)
})

app.listen(port, () => {
  console.log(`Mock dew-point API listening on http://localhost:${port}`)
})
