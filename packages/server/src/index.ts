import { actor, setup } from 'rivetkit'
import { roomActor } from './actors/room.js'

/**
 * Pulsar Server - RivetKit actor-based multiplayer backend.
 *
 * Uses RivetKit's actor model to manage room state. Each room
 * is a separate actor instance with its own durable state,
 * handling real-time sync between connected clients.
 */

const app = setup({
  use: {
    room: roomActor,
  },
})

// Start the server
app.start()

console.log('[pulsar] Server started')
