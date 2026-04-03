import { actor } from 'rivetkit'
import type { SyncMessage, RoomState, UserPresence } from '@pulsar/shared'

/**
 * Room state persisted by the actor.
 */
interface RoomActorState {
  roomId: string
  shapes: Record<string, Record<string, unknown>>
  ecsState: Record<string, Record<string, Record<string, unknown>>>
  users: Record<string, UserPresence>
}

/**
 * Shape change from the sync protocol.
 */
interface ShapeChange {
  id: string
  type: 'create' | 'update' | 'delete'
  data?: Record<string, unknown>
}

/**
 * Room Actor - manages a single collaborative canvas room.
 *
 * Each room actor maintains:
 * - The canonical shape state (tldraw document)
 * - An ECS World with component state for all entities
 * - Connected user presence information
 *
 * Clients connect via WebSocket and receive real-time updates.
 * The actor persists state durably across connections.
 */
// Type annotation uses `any` due to rivetkit's complex internal generic types
// that cannot be portably referenced across package boundaries
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const roomActor: any = actor({
  types: {} as {
    state: RoomActorState
    input: string
  },

  createState: (c, input: string) => ({
    roomId: input,
    shapes: {},
    ecsState: {},
    users: {},
  }),

  actions: {
    /** Get the full room snapshot */
    getSnapshot(c): RoomState {
      return {
        roomId: c.state.roomId,
        shapes: c.state.shapes,
        ecsState: c.state.ecsState,
        users: Object.values(c.state.users),
      }
    },

    /** Handle a sync message from a client */
    handleMessage(c, message: SyncMessage) {
      switch (message.type) {
        case 'connect': {
          c.state.users[message.userId] = {
            userId: message.userId,
            name: `User ${Object.keys(c.state.users).length + 1}`,
            color: generateUserColor(message.userId),
            cursor: { x: 0, y: 0 },
            selection: [],
            lastSeen: Date.now(),
          }
          c.broadcast('user:join', c.state.users[message.userId])
          break
        }

        case 'disconnect': {
          const user = c.state.users[message.userId]
          delete c.state.users[message.userId]
          if (user) {
            c.broadcast('user:leave', { userId: message.userId })
          }
          break
        }

        case 'update': {
          applyShapeChanges(c.state, message.changes)
          c.broadcast('shapes:update', message.changes)
          break
        }

        case 'presence': {
          const presenceUser = c.state.users[message.userId]
          if (presenceUser) {
            presenceUser.cursor = message.cursor
            presenceUser.selection = message.selection
            presenceUser.lastSeen = Date.now()
            c.broadcast('presence:update', {
              userId: message.userId,
              cursor: message.cursor,
              selection: message.selection,
            })
          }
          break
        }

        case 'ecs:component-add': {
          if (!c.state.ecsState[message.entityId]) {
            c.state.ecsState[message.entityId] = {}
          }
          c.state.ecsState[message.entityId][message.component] = message.data
          c.broadcast('ecs:component-add', {
            entityId: message.entityId,
            component: message.component,
            data: message.data,
          })
          break
        }

        case 'ecs:component-remove': {
          if (c.state.ecsState[message.entityId]) {
            delete c.state.ecsState[message.entityId][message.component]
          }
          c.broadcast('ecs:component-remove', {
            entityId: message.entityId,
            component: message.component,
          })
          break
        }

        case 'ecs:component-update': {
          if (c.state.ecsState[message.entityId]) {
            c.state.ecsState[message.entityId][message.component] = {
              ...c.state.ecsState[message.entityId][message.component],
              ...message.data,
            }
          }
          c.broadcast('ecs:component-update', {
            entityId: message.entityId,
            component: message.component,
            data: message.data,
          })
          break
        }
      }
    },
  },
})

/** Apply shape changes to the canonical state */
function applyShapeChanges(
  state: RoomActorState,
  changes: ShapeChange[]
): void {
  for (const change of changes) {
    switch (change.type) {
      case 'create':
        if (change.data) {
          state.shapes[change.id] = change.data
        }
        break
      case 'update':
        if (state.shapes[change.id] && change.data) {
          state.shapes[change.id] = {
            ...state.shapes[change.id],
            ...change.data,
          }
        }
        break
      case 'delete':
        delete state.shapes[change.id]
        delete state.ecsState[change.id]
        break
    }
  }
}

/** Generate a deterministic color for a user */
function generateUserColor(userId: string): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F0B27A', '#82E0AA',
  ]
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0
  }
  return colors[Math.abs(hash) % colors.length]
}
