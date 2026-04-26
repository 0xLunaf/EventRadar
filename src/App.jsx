import { useState } from 'react'
import './App.css'

function App() {
  const [side, setSide] = useState('kort')

  return (
    <div className="app">
      
      {/* Indhold */}
      <div className="indhold">
        {side === 'kort' && <div className="side"><h2>🗺️ Kort</h2></div>}
        {side === 'events' && <div className="side"><h2>📋 Events</h2></div>}
        {side === 'opret' && <div className="side"><h2>➕ Opret Event</h2></div>}
        {side === 'profil' && <div className="side"><h2>👤 Profil</h2></div>}
      </div>

      {/* Bundmenu */}
      <nav className="bundmenu">
        <button onClick={() => setSide('kort')} className={side === 'kort' ? 'aktiv' : ''}>🗺️ Kort</button>
        <button onClick={() => setSide('events')} className={side === 'events' ? 'aktiv' : ''}>📋 Events</button>
        <button onClick={() => setSide('opret')} className={side === 'opret' ? 'aktiv' : ''}>➕ Opret</button>
        <button onClick={() => setSide('profil')} className={side === 'profil' ? 'aktiv' : ''}>👤 Profil</button>
      </nav>

    </div>
  )
}

export default App