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
  const { titel, beskrivelse, kategori, lat, lng, bruger_id, start_dato, slut_dato } = req.body
  db.run('INSERT INTO events (titel, beskrivelse, kategori, lat, lng, bruger_id, start_dato, slut_dato) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [titel, beskrivelse, kategori, lat, lng, bruger_id, start_dato, slut_dato],
    (err) => {
      if (err) return res.status(400).json({ fejl: err.message })
      res.json({ besked: 'Event oprettet!' })
    }
  )
})

// Rediger event + gem historik
app.put('/events/:id', (req, res) => {
  const { titel, beskrivelse, kategori, start_dato, slut_dato, bruger_id } = req.body
  db.get('SELECT * FROM events WHERE id = ? AND bruger_id = ?',
    [req.params.id, bruger_id],
    (err, event) => {
      if (!event) return res.status(403).json({ fejl: 'Ikke tilladt' })
      db.run('INSERT INTO event_historik (event_id, titel, beskrivelse, kategori, start_dato, slut_dato) VALUES (?, ?, ?, ?, ?, ?)',
        [req.params.id, event.titel, event.beskrivelse, event.kategori, event.start_dato, event.slut_dato]
      )
      db.run('UPDATE events SET titel = ?, beskrivelse = ?, kategori = ?, start_dato = ?, slut_dato = ? WHERE id = ?',
        [titel, beskrivelse, kategori, start_dato, slut_dato, req.params.id],
        () => res.json({ besked: 'Event opdateret!' })
      )
    }
  )
})

// Slet event
app.delete('/events/:id', (req, res) => {
  const { bruger_id } = req.body
  db.get('SELECT * FROM events WHERE id = ? AND bruger_id = ?',
    [req.params.id, bruger_id],
    (err, event) => {
      if (!event) return res.status(403).json({ fejl: 'Ikke tilladt' })
      db.run('DELETE FROM events WHERE id = ?', [req.params.id])
      db.run('DELETE FROM deltagere WHERE event_id = ?', [req.params.id])
      db.run('DELETE FROM event_historik WHERE event_id = ?', [req.params.id])
      res.json({ besked: 'Event slettet!' })
    }
  )
})

// Hent historik for event
app.get('/events/:id/historik', (req, res) => {
  db.all('SELECT * FROM event_historik WHERE event_id = ? ORDER BY ændret_dato DESC',
    [req.params.id],
    (err, rows) => res.json(rows)
  )
})

// Deltag i event
app.post('/events/:id/deltag', (req, res) => {
  const { bruger_id } = req.body
  db.run('INSERT INTO deltagere (event_id, bruger_id) VALUES (?, ?)',
    [req.params.id, bruger_id],
    (err) => {
      if (err) return res.status(400).json({ fejl: 'Du deltager allerede' })
      res.json({ besked: 'Tilmeldt!' })
    }
  )
})

// Forlad event
app.delete('/events/:id/deltag', (req, res) => {
  const { bruger_id } = req.body
  db.run('DELETE FROM deltagere WHERE event_id = ? AND bruger_id = ?',
    [req.params.id, bruger_id],
    () => res.json({ besked: 'Forladt!' })
  )
})

// Tjek om bruger deltager i event
app.get('/events/:id/deltager', (req, res) => {
  const { bruger_id } = req.query
  db.get('SELECT * FROM deltagere WHERE event_id = ? AND bruger_id = ?',
    [req.params.id, bruger_id],
    (err, row) => res.json({ deltager: !!row })
  )
})

// Hent antal deltagere på event
app.get('/events/:id/antal', (req, res) => {
  db.get('SELECT COUNT(*) as antal FROM deltagere WHERE event_id = ?',
    [req.params.id],
    (err, row) => res.json({ antal: row.antal })
  )
})

// Hent events jeg har oprettet
app.get('/bruger/:id/events', (req, res) => {
  db.all('SELECT * FROM events WHERE bruger_id = ?',
    [req.params.id],
    (err, rows) => res.json(rows)
  )
})

// Hent events jeg deltager i
app.get('/bruger/:id/deltager', (req, res) => {
  db.all(`SELECT events.* FROM events 
    JOIN deltagere ON events.id = deltagere.event_id 
    WHERE deltagere.bruger_id = ?`,
    [req.params.id],
    (err, rows) => res.json(rows)
  )
})

app.listen(3001, '0.0.0.0', () => console.log('Server kører på port 3001'))