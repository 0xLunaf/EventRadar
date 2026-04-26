import { useState } from 'react'

function Login({ setSide, setLoggetInd, setBruger }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fejl, setFejl] = useState('')
  const [erSignup, setErSignup] = useState(false)

  const handleSubmit = async () => {
    const url = erSignup ? 'http://192.168.86.36:3001/signup' : 'http://192.168.86.36:3001/login'
    
    const svar = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await svar.json()

    if (!svar.ok) return setFejl(data.fejl)
    
    setLoggetInd(true)
    setBruger(data.bruger)
    setSide('kort')
  }

  return (
    <div className="login">
      <h2>{erSignup ? 'Opret bruger' : 'Log ind'}</h2>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Adgangskode" value={password} onChange={e => setPassword(e.target.value)} />
      {fejl && <p className="fejl">{fejl}</p>}
      <button onClick={handleSubmit}>{erSignup ? 'Opret' : 'Log ind'}</button>
      <p onClick={() => setErSignup(!erSignup)}>
        {erSignup ? 'Har du allerede en konto? Log ind' : 'Ingen konto? Opret en'}
      </p>
      <p onClick={() => setSide('velkomst')}>← Tilbage</p>
    </div>
  )
}

export default Login