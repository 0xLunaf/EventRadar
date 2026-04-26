function Velkomst({ setSide }) {
  return (
    <div className="velkomst">
      <h1>EventRadar 📍</h1>
      <p>Find events i din by og mød nye mennesker</p>
      <button onClick={() => setSide('login')}>Kom i gang</button>
    </div>
  )
}

export default Velkomst