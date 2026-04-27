import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { useState, useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const KATEGORIER = ['🏃 Sport', '🎮 Gaming', '🎉 Fest', '☕ Hygge']

function KlikHandler({ aktiv, vælgPosition }) {
  useMapEvents({
    click(e) {
      if (aktiv) vælgPosition(e.latlng.lat, e.latlng.lng)
    }
  })
  return null
}

function Kort({ loggetInd, bruger }) {
  const [events, setEvents] = useState([])
  const [nytEvent, setNytEvent] = useState(null)
  const [aktivFilter, setAktivFilter] = useState(null)
  const [valgtEvent, setValgtEvent] = useState(null)
  const [vælgerPosition, setVælgerPosition] = useState(false)
  const [deltagerStatus, setDeltagerStatus] = useState({})
  const [antalDeltagere, setAntalDeltagere] = useState({})
  const SERVER = `http://${window.location.hostname}:3001`

  const hentEvents = () => {
    fetch(`${SERVER}/events`)
      .then(r => r.json())
      .then(setEvents)
  }

  useEffect(() => { hentEvents() }, [])

  // Tjek deltager status når et event vælges
  useEffect(() => {
    if (!valgtEvent || !bruger) return
    fetch(`${SERVER}/events/${valgtEvent.id}/deltager?bruger_id=${bruger.id}`)
      .then(r => r.json())
      .then(data => setDeltagerStatus(prev => ({ ...prev, [valgtEvent.id]: data.deltager })))
    fetch(`${SERVER}/events/${valgtEvent.id}/antal`)
      .then(r => r.json())
      .then(data => setAntalDeltagere(prev => ({ ...prev, [valgtEvent.id]: data.antal })))
  }, [valgtEvent, bruger])

  const startOpretEvent = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setNytEvent({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        titel: '', beskrivelse: '', kategori: '🏃 Sport',
        start_dato: '', slut_dato: ''
      }),
      () => setVælgerPosition(true)
    )
  }

  const vælgPosition = (lat, lng) => {
    setVælgerPosition(false)
    setNytEvent({ lat, lng, titel: '', beskrivelse: '', kategori: '🏃 Sport', start_dato: '', slut_dato: '' })
  }

  const opretEvent = async () => {
    if (!bruger) return alert('Du skal være logget ind!')
    if (!nytEvent.titel) return alert('Titel mangler!')
    await fetch(`${SERVER}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...nytEvent, bruger_id: bruger.id })
    })
    setNytEvent(null)
    hentEvents()
  }

  const toggleDeltag = async () => {
    if (!bruger) return alert('Du skal være logget ind for at deltage!')
    const erDeltager = deltagerStatus[valgtEvent.id]
    await fetch(`${SERVER}/events/${valgtEvent.id}/deltag`, {
      method: erDeltager ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bruger_id: bruger.id })
    })
    setDeltagerStatus(prev => ({ ...prev, [valgtEvent.id]: !erDeltager }))
    setAntalDeltagere(prev => ({ ...prev, [valgtEvent.id]: erDeltager ? prev[valgtEvent.id] - 1 : prev[valgtEvent.id] + 1 }))
  }

  const vistEvents = aktivFilter
    ? events.filter(e => e.kategori === aktivFilter)
    : events

  return (
    <div className="kort">
      <div className="filter-bar">
        {KATEGORIER.map(kat => (
          <button
            key={kat}
            className={aktivFilter === kat ? 'aktiv' : ''}
            onClick={() => setAktivFilter(aktivFilter === kat ? null : kat)}
          >
            {kat}
          </button>
        ))}
      </div>

      {vælgerPosition && (
        <div className="vælg-position-banner">
          📍 Tryk på kortet for at vælge placering
        </div>
      )}

      <MapContainer center={[55.9396, 12.3053]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <KlikHandler aktiv={vælgerPosition} vælgPosition={vælgPosition} />
        {vistEvents.map(event => (
          <Marker
            key={event.id}
            position={[event.lat, event.lng]}
            eventHandlers={{ click: () => { setValgtEvent(event); setNytEvent(null) } }}
          />
        ))}
      </MapContainer>

      {/* Event bottom sheet */}
      {valgtEvent && (
        <div className="bottom-sheet">
          <div className="bottom-sheet-bar" onClick={() => setValgtEvent(null)} />
          <div className="bottom-sheet-indhold">
            <span className="event-kategori">{valgtEvent.kategori}</span>
            <h2>{valgtEvent.titel}</h2>
            <p>{valgtEvent.beskrivelse}</p>
            {valgtEvent.start_dato && (
              <p className="event-dato">📅 {valgtEvent.start_dato} {valgtEvent.slut_dato && `→ ${valgtEvent.slut_dato}`}</p>
            )}
            <p className="event-dato">👥 {antalDeltagere[valgtEvent.id] ?? 0} deltager</p>
            <button
              className="deltag-btn"
              style={{ background: deltagerStatus[valgtEvent.id] ? '#333' : 'white', color: deltagerStatus[valgtEvent.id] ? 'white' : 'black' }}
              onClick={toggleDeltag}
            >
              {deltagerStatus[valgtEvent.id] ? 'Forlad event' : 'Deltag i event'}
            </button>
          </div>
        </div>
      )}

      {/* Opret knap */}
      {loggetInd && !valgtEvent && !nytEvent && !vælgerPosition && (
        <button className="opret-knap" onClick={startOpretEvent}>➕</button>
      )}

      {/* Opret event form */}
      {nytEvent && (
        <div className="bottom-sheet">
          <div className="bottom-sheet-bar" onClick={() => setNytEvent(null)} />
          <div className="bottom-sheet-indhold">
            <h3>Nyt event 📍</h3>
            <input placeholder="Titel" value={nytEvent.titel} onChange={e => setNytEvent({ ...nytEvent, titel: e.target.value })} />
            <input placeholder="Beskrivelse" value={nytEvent.beskrivelse} onChange={e => setNytEvent({ ...nytEvent, beskrivelse: e.target.value })} />
            <select value={nytEvent.kategori} onChange={e => setNytEvent({ ...nytEvent, kategori: e.target.value })}>
              {KATEGORIER.map(kat => <option key={kat}>{kat}</option>)}
            </select>
            <label style={{ color: '#888', fontSize: '13px' }}>Start dato</label>
            <input type="datetime-local" value={nytEvent.start_dato} onChange={e => setNytEvent({ ...nytEvent, start_dato: e.target.value })} />
            <label style={{ color: '#888', fontSize: '13px' }}>Slut dato</label>
            <input type="datetime-local" value={nytEvent.slut_dato} onChange={e => setNytEvent({ ...nytEvent, slut_dato: e.target.value })} />
            <button className="deltag-btn" onClick={opretEvent}>Opret</button>
            <button className="annuller-btn" onClick={() => setNytEvent(null)}>Annuller</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Kort