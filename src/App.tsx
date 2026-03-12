import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

interface Workspace {
  id: number;
  name: string;
  resource_type: string;
  capacity: number;
  is_active: boolean;
  image_url?: string | null;
}

function App() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    axios.get<Workspace[]>('http://127.0.0.1:8000/api/workspaces/')
      .then(response => {
        setWorkspaces(response.data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Error fetching data:", err)
        setError("Could not connect to the backend.")
        setLoading(false)
      })
  }, [])

  if (loading) return <h2>Loading enterprise resources...</h2>
  if (error) return <h2 style={{ color: 'red' }}>{error}</h2>

  return (
    <div>
      <h1>DeskReserve</h1>
      <h2>Available Workspaces</h2>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {workspaces.map(workspace => (
          <div
            key={workspace.id}
            style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', width: '250px' }}
          >
            <h3>{workspace.name}</h3>
            <p><strong>Type:</strong> {workspace.resource_type}</p>
            <p><strong>Capacity:</strong> {workspace.capacity}</p>
            {!workspace.is_active && <p style={{ color: 'red' }}>Currently Unavailable</p>}
            <button disabled>Book Now (Coming Soon)</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App