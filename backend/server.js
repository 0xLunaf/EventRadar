const express = require('express')
const bcrypt = require('bcryptjs')
const cors = require('cors')
const db = require('./database')

const app = express()
app.use(cors())
app.use(express.json())

// Opret bruger
app.post('/signup', async (req, res) => {
  const { email, password } = req.body
  const hashedPassword = await bcrypt.hash(password, 10)
  
  db.run('INSERT INTO brugere (email, password) VALUES (?, ?)', 
    [email, hashedPassword], 
    (err) => {
      if (err) return res.status(400).json({ fejl: 'Email findes allerede' })
      res.json({ besked: 'Bruger oprettet!' })
    }
  )
})

// Log ind
app.post('/login', async (req, res) => {
  const { email, password } = req.body
  
  db.get('SELECT * FROM brugere WHERE email = ?', [email], async (err, bruger) => {
    if (!bruger) return res.status(400).json({ fejl: 'Bruger findes ikke' })
    
    const korrekt = await bcrypt.compare(password, bruger.password)
    if (!korrekt) return res.status(400).json({ fejl: 'Forkert adgangskode' })
    
    res.json({ besked: 'Logget ind!', bruger: { id: bruger.id, email: bruger.email } })
  })
})

// Hent alle events
app.get('/events', (req, res) => {
  db.all('SELECT * FROM events', [], (err, rows) => {
    res.json(rows)
  })
})

// Opret event
app.post('/events', (req, res) => {
  const { titel, beskrivelse, kategori, lat, lng, bruger_id } = req.body
  db.run('INSERT INTO events (titel, beskrivelse, kategori, lat, lng, bruger_id) VALUES (?, ?, ?, ?, ?, ?)',
    [titel, beskrivelse, kategori, lat, lng, bruger_id],
    (err) => {
      if (err) return res.status(400).json({ fejl: err.message })
      res.json({ besked: 'Event oprettet!' })
    }
  )
})

app.listen(3001, () => console.log('Server kører på port 3001'))