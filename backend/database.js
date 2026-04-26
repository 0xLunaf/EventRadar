const sqlite3 = require('sqlite3').verbose()

const db = new sqlite3.Database('./database.db')

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
  bruger_id INTEGER
)`)

module.exports = db