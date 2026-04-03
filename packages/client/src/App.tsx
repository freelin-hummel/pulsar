import { useCallback, useState } from 'react'
import { PulsarCanvas } from './components/PulsarCanvas.js'

/**
 * Pulsar - Collaborative extensible canvas.
 *
 * Entry point renders a room-based canvas with multiplayer sync
 * and ECS extension support built on BlockSuite.
 */
export default function App() {
  const [roomId] = useState(() => {
    // Use URL hash as room ID, or generate one
    const hash = window.location.hash.slice(1)
    if (hash) return hash
    const id = `room-${crypto.randomUUID().slice(0, 8)}`
    window.location.hash = id
    return id
  })

  const [userId] = useState(() => {
    // Persist user ID in session storage
    const stored = sessionStorage.getItem('pulsar-user-id')
    if (stored) return stored
    const id = `user-${crypto.randomUUID().slice(0, 8)}`
    sessionStorage.setItem('pulsar-user-id', id)
    return id
  })

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <PulsarCanvas roomId={roomId} userId={userId} />
    </div>
  )
}
