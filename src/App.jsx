import { useState, useEffect } from 'react'
import './App.css'
import Velkomst from './sider/Velkomst'
import Login from './sider/Login'
import Kort from './sider/Kort'
import Profil from './sider/Profil'

function App() {
  const [side, setSide] = useState(() => {
    return localStorage.getItem('side') || 'velkomst'
  })
  const [loggetInd, setLoggetInd] = useState(() => {
    return localStorage.getItem('loggetInd') === 'true'
  })
  const [bruger, setBruger] = useState(() => {
    try {
     const gemt = localStorage.getItem('bruger')
     return gemt && gemt !== 'undefined' ? JSON.parse(gemt) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    localStorage.setItem('side', side)
  }, [side])

  useEffect(() => {
    localStorage.setItem('loggetInd', loggetInd)
  }, [loggetInd])

  useEffect(() => {
    localStorage.setItem('bruger', JSON.stringify(bruger))
  }, [bruger])

  return (
    <div className="app">
      {side === 'velkomst' && <Velkomst setSide={setSide} />}
      {side === 'login' && <Login setSide={setSide} setLoggetInd={setLoggetInd} setBruger={setBruger} />}
      {side === 'kort' && (
        <>
          <div className="indhold">
            <Kort loggetInd={loggetInd} bruger={bruger} />
          </div>
          <nav className="bundmenu">
            <button onClick={() => setSide('kort')} className="aktiv">🗺️ Kort</button>
            <button onClick={() => setSide('profil')}>👤 Profil</button>
          </nav>
        </>
      )}
      {side === 'profil' && (
        <>
          <div className="indhold">
            <Profil loggetInd={loggetInd} setLoggetInd={setLoggetInd} setSide={setSide} bruger={bruger} />
          </div>
          <nav className="bundmenu">
            <button onClick={() => setSide('kort')}>🗺️ Kort</button>
            <button onClick={() => setSide('profil')} className="aktiv">👤 Profil</button>
          </nav>
        </>
      )}
    </div>
  )
}

export default App