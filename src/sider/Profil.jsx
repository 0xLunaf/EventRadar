import { useState, useEffect } from 'react'

function Profil({ loggetInd, setLoggetInd, setSide, bruger }) {
  const [mineEvents, setMineEvents] = useState([])
  const [deltagerEvents, setDeltagerEvents] = useState([])
  const [redigerEvent, setRedigerEvent] = useState(null)
  const [historik, setHistorik] = useState([])
  const [visHistorik, setVisHistorik] = useState(null)
  const [aktivFane, setAktivFane] = useState('oprettet')
  const [sletConfirm, setSletConfirm] = useState(null)
  const [sletNavn, setSletNavn] = useState('')
  const SERVER = `http://${window.location.hostname}:3001`

  const hentEvents = () => {
    if (!bruger) return
    fetch(`${SERVER}/bruger/${bruger.id}/events`).then(r => r.json()).then(setMineEvents)
    fetch(`${SERVER}/bruger/${bruger.id}/deltager`).then(r => r.json()).then(setDeltagerEvents)
  }

  useEffect(() => { hentEvents() }, [bruger])

  const gemRedigering = async () => {
    await fetch(`${SERVER}/events/${redigerEvent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...redigerEvent, bruger_id: bruger.id })
    })
    setRedigerEvent(null)
    hentEvents()
  }

  const sletEvent = async () => {
    if (sletNavn !== sletConfirm.titel) return alert('Navnet matcher ikke!')
    await fetch(`${SERVER}/events/${sletConfirm.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bruger_id: bruger.id })
    })
    setSletConfirm(null)
    setSletNavn('')
    hentEvents()
  }

  const hentHistorik = async (eventId) => {
    const svar = await fetch(`${SERVER}/events/${eventId}/historik`)
    const data = await svar.json()
    setHistorik(data)
    setVisHistorik(visHistorik === eventId ? null : eventId)
  }

  const forlad = async (eventId) => {
    await fetch(`${SERVER}/events/${eventId}/deltag`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bruger_id: bruger.id })
    })
    hentEvents()
  }

  if (!loggetInd) return (
    <div className="profil-ikke-logget">
      <h2>Du er ikke logget ind</h2>
      <button onClick={() => setSide('login')}>Log ind</button>
    </div>
  )

  return (
    <div className="profil">
      <div className="profil-header">
        <h2>👤 {bruger?.email}</h2>
        <button className="log-ud-btn" onClick={() => { setLoggetInd(false); setSide('velkomst') }}>
          Log ud
        </button>
      </div>

      <div className="faner">
        <button className={aktivFane === 'oprettet' ? 'aktiv' : ''} onClick={() => setAktivFane('oprettet')}>
          Mine events
        </button>
        <button className={aktivFane === 'deltager' ? 'aktiv' : ''} onClick={() => setAktivFane('deltager')}>
          Deltager i
        </button>
      </div>

      <div className="event-liste">
        {aktivFane === 'oprettet' && (
          mineEvents.length === 0
            ? <p className="ingen">Du har ikke oprettet nogen events endnu</p>
            : mineEvents.map(event => (
              <div key={event.id} className="event-kort">
                <div className="event-kort-top">
                  <span className="event-kategori">{event.kategori}</span>
                  <span className="event-titel">{event.titel}</span>
                </div>
                <p className="event-beskrivelse">{event.beskrivelse}</p>
                {event.start_dato && (
                  <p className="event-dato">📅 {event.start_dato} {event.slut_dato && `→ ${event.slut_dato}`}</p>
                )}
                <div className="event-knapper">
                  <button onClick={() => setRedigerEvent(event)}>✏️ Rediger</button>
                  <button onClick={() => hentHistorik(event.id)}>📜 Historik</button>
                  <button className="slet-btn" onClick={() => { setSletConfirm(event); setSletNavn('') }}>🗑️ Slet</button>
                </div>

                {visHistorik === event.id && (
                  <div className="historik">
                    <h4>Tidligere versioner</h4>
                    {historik.length === 0
                      ? <p>Ingen ændringer endnu</p>
                      : historik.map(h => (
                        <div key={h.id} className="historik-item">
                          <span className="historik-dato">{h.ændret_dato}</span>
                          <p><strong>{h.titel}</strong> — {h.beskrivelse}</p>
                          {h.start_dato && <p className="event-dato">📅 {h.start_dato} {h.slut_dato && `→ ${h.slut_dato}`}</p>}
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            ))
        )}

        {aktivFane === 'deltager' && (
          deltagerEvents.length === 0
            ? <p className="ingen">Du deltager ikke i nogen events endnu</p>
            : deltagerEvents.map(event => (
              <div key={event.id} className="event-kort">
                <div className="event-kort-top">
                  <span className="event-kategori">{event.kategori}</span>
                  <span className="event-titel">{event.titel}</span>
                </div>
                <p className="event-beskrivelse">{event.beskrivelse}</p>
                {event.start_dato && (
                  <p className="event-dato">📅 {event.start_dato} {event.slut_dato && `→ ${event.slut_dato}`}</p>
                )}
                <button className="annuller-btn" onClick={() => forlad(event.id)}>Forlad event</button>
              </div>
            ))
        )}
      </div>

      {/* Rediger bottom sheet */}
      {redigerEvent && (
        <div className="bottom-sheet">
          <div className="bottom-sheet-bar" onClick={() => setRedigerEvent(null)} />
          <div className="bottom-sheet-indhold">
            <h3>Rediger event ✏️</h3>
            <input
              value={redigerEvent.titel}
              onChange={e => setRedigerEvent({ ...redigerEvent, titel: e.target.value })}
              placeholder="Titel"
            />
            <input
              value={redigerEvent.beskrivelse || ''}
              onChange={e => setRedigerEvent({ ...redigerEvent, beskrivelse: e.target.value })}
              placeholder="Beskrivelse"
            />
            <select
              value={redigerEvent.kategori}
              onChange={e => setRedigerEvent({ ...redigerEvent, kategori: e.target.value })}
            >
              {['🏃 Sport', '🎮 Gaming', '🎉 Fest', '☕ Hygge'].map(k => <option key={k}>{k}</option>)}
            </select>
            <label>Start dato</label>
            <input
              type="datetime-local"
              value={redigerEvent.start_dato || ''}
              onChange={e => setRedigerEvent({ ...redigerEvent, start_dato: e.target.value })}
            />
            <label>Slut dato</label>
            <input
              type="datetime-local"
              value={redigerEvent.slut_dato || ''}
              onChange={e => setRedigerEvent({ ...redigerEvent, slut_dato: e.target.value })}
            />
            <button className="deltag-btn" onClick={gemRedigering}>Gem</button>
            <button className="annuller-btn" onClick={() => setRedigerEvent(null)}>Annuller</button>
          </div>
        </div>
      )}

      {/* Slet confirm bottom sheet */}
      {sletConfirm && (
        <div className="bottom-sheet">
          <div className="bottom-sheet-bar" onClick={() => setSletConfirm(null)} />
          <div className="bottom-sheet-indhold">
            <h3>🗑️ Slet event</h3>
            <p style={{ color: '#aaa', fontSize: '14px' }}>
              Skriv <strong style={{ color: 'white' }}>{sletConfirm.titel}</strong> for at bekræfte sletning
            </p>
            <input
              placeholder={sletConfirm.titel}
              value={sletNavn}
              onChange={e => setSletNavn(e.target.value)}
            />
            <button
              className="deltag-btn"
              style={{ background: sletNavn === sletConfirm.titel ? '#ff4444' : '#333', color: 'white' }}
              onClick={sletEvent}
            >
              Slet permanent
            </button>
            <button className="annuller-btn" onClick={() => setSletConfirm(null)}>Annuller</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profil