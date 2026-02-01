import React from 'react'
import { createRoot } from 'react-dom/client'

function App() {
  const [user, setUser] = React.useState(null)

  React.useEffect(() => {
    fetch('/api/test-user')
      .then(r => r.json())
      .then(data => setUser(data))
      .catch(() => setUser(null))
  }, [])

  return (
    <div style={{fontFamily: 'sans-serif', padding: 20}}>
      <h1>React + Laravel</h1>
      <p>Fetch /api/test-user and show the first user from the DB.</p>
      {user ? (
        <div>
          <div><strong>Name:</strong> {user.name}</div>
          <div><strong>Email:</strong> {user.email}</div>
        </div>
      ) : (
        <div>No user loaded (check backend seed/migrations)</div>
      )}
    </div>
  )
}

const rootEl = document.getElementById('react-root')
if (rootEl) createRoot(rootEl).render(<App />)

export default App
