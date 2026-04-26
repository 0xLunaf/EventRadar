import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import { useState, useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const SERVER = 'http://10.0.0.18:3001'

function KlikHandler({ loggetInd, setNytEvent }) {
  useMapEvents({
    click(e) {
      if (!loggetInd) return alert('Du skal være logget ind for at oprette et event!')
      setNytEvent({ lat: e.latlng.lat, lng: e.latlng.lng, titel: '', beskrivelse: '', kategori: '🏃 Sport' })
    }
  })
  return null
}

function Kort({ loggetInd, bruger }) {
  const [events, setEvents] = useState([])
  const [nytEvent, setNytEvent] = useState(null)

  useEffect(() => {
    fetch(`${SERVER}/events`)
      .then(r => r.json())
      .then(setEvents)
  }, [])

  const opretEvent = async () => {
    await fetch(`${SERVER}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...nytEvent, bruger_id: bruger?.id })
    })
    setNytEvent(null)
    fetch(`${SERVER}/events`).then(r => r.json()).then(setEvents)
  }

  return (
    <div className="kort">
      <div className="filter-bar">
        <button>🏃 Sport</button>
        <button>🎮 Gaming</button>
        <button>🎉 Fest</button>
        <button>☕ Hygge</button>
      </div>

      <MapContainer center={[55.9396, 12.3053]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <KlikHandler loggetInd={loggetInd} setNytEvent={setNytEvent} />

        {events.map(event => (
          <Marker key={event.id} position={[event.lat, event.lng]}>
            <Popup>
              <strong>{event.titel}</strong><br />
              {event.beskrivelse}<br />
              {event.kategori}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {nytEvent && (
        <div className="event-form">
          <h3>Nyt event</h3>
          <input placeholder="Titel" value={nytEvent.titel} onChange={e => setNytEvent({ ...nytEvent, titel: e.target.value })} />
          <input placeholder="Beskrivelse" value={nytEvent.beskrivelse} onChange={e => setNytEvent({ ...nytEvent, beskrivelse: e.target.value })} />
          <select value={nytEvent.kategori} onChange={e => setNytEvent({ ...nytEvent, kategori: e.target.value })}>
            <option>🏃 Sport</option>
            <option>🎮 Gaming</option>
            <option>🎉 Fest</option>
            <option>☕ Hygge</option>
          </select>
          <button onClick={opretEvent}>Opret</button>
          <button onClick={() => setNytEvent(null)}>Annuller</button>
        </div>
      )}
    </div>
  )
}

export default Kort