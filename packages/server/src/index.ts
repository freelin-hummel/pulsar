import { setup } from 'rivetkit'
import { createHandler } from '@rivetkit/cloudflare-workers'
import { roomActor } from './actors/room.js'

const registry = setup({
  use: {
    room: roomActor,
  },
})

const { handler, ActorHandler } = createHandler(registry)

export default handler
export { ActorHandler }
