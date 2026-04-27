const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./backend/database.db')

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS brugere (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titel TEXT,
    beskrivelse TEXT,
    kategori TEXT,
    lat REAL,
    lng REAL,
    bruger_id INTEGER,
    start_dato TEXT,
    slut_dato TEXT
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS deltagere (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    bruger_id INTEGER,
    UNIQUE(event_id, bruger_id)
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS event_historik (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    titel TEXT,
    beskrivelse TEXT,
    kategori TEXT,
    start_dato TEXT,
    slut_dato TEXT,
    ændret_dato TEXT DEFAULT (datetime('now'))
  )`)
})

module.exports = db