function Profil({ loggetInd, setLoggetInd, setSide }) {
  return (
    <div className="profil">
      {loggetInd ? (
        <>
          <h2>👤 Min Profil</h2>
          <button onClick={() => { setLoggetInd(false); setSide('velkomst') }}>
            Log ud
          </button>
        </>
      ) : (
        <>
          <h2>Du er ikke logget ind</h2>
          <button onClick={() => setSide('login')}>Log ind</button>
        </>
      )}
    </div>
  )
}

export default Profil