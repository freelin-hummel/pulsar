import { actor, type ActorContext } from 'rivetkit'
import { World } from '@pulsar/ecs'
import { BuiltInComponents } from '@pulsar/shared'
import type { SyncMessage, RoomState, UserPresence, ShapeChange } from '@pulsar/shared'

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
export const roomActor = actor({
  state: {
    roomId: '',
    shapes: {},
    ecsState: {},
    users: {},
  } as RoomActorState,

  actions: {
    /** Initialize a room with a given ID */
    initialize(ctx: ActorContext<RoomActorState>, roomId: string) {
      ctx.state.roomId = roomId
      return { roomId }
    },

    /** Get the full room snapshot */
    getSnapshot(ctx: ActorContext<RoomActorState>): RoomState {
      return {
        roomId: ctx.state.roomId,
        shapes: ctx.state.shapes,
        ecsState: ctx.state.ecsState,
        users: Object.values(ctx.state.users),
      }
    },

    /** Handle a sync message from a client */
    handleMessage(ctx: ActorContext<RoomActorState>, message: SyncMessage) {
      switch (message.type) {
        case 'connect': {
          ctx.state.users[message.userId] = {
            userId: message.userId,
            name: `User ${Object.keys(ctx.state.users).length + 1}`,
            color: generateUserColor(message.userId),
            cursor: { x: 0, y: 0 },
            selection: [],
            lastSeen: Date.now(),
          }
          // Broadcast join to other clients
          ctx.broadcast('user:join', ctx.state.users[message.userId])
          break
        }

        case 'disconnect': {
          const user = ctx.state.users[message.userId]
          delete ctx.state.users[message.userId]
          if (user) {
            ctx.broadcast('user:leave', { userId: message.userId })
          }
          break
        }

        case 'update': {
          applyShapeChanges(ctx.state, message.changes)
          ctx.broadcast('shapes:update', message.changes)
          break
        }

        case 'presence': {
          const presenceUser = ctx.state.users[message.userId]
          if (presenceUser) {
            presenceUser.cursor = message.cursor
            presenceUser.selection = message.selection
            presenceUser.lastSeen = Date.now()
            ctx.broadcast('presence:update', {
              userId: message.userId,
              cursor: message.cursor,
              selection: message.selection,
            })
          }
          break
        }

        case 'ecs:component-add': {
          if (!ctx.state.ecsState[message.entityId]) {
            ctx.state.ecsState[message.entityId] = {}
          }
          ctx.state.ecsState[message.entityId][message.component] = message.data
          ctx.broadcast('ecs:component-add', {
            entityId: message.entityId,
            component: message.component,
            data: message.data,
          })
          break
        }

        case 'ecs:component-remove': {
          if (ctx.state.ecsState[message.entityId]) {
            delete ctx.state.ecsState[message.entityId][message.component]
          }
          ctx.broadcast('ecs:component-remove', {
            entityId: message.entityId,
            component: message.component,
          })
          break
        }

        case 'ecs:component-update': {
          if (ctx.state.ecsState[message.entityId]) {
            ctx.state.ecsState[message.entityId][message.component] = {
              ...ctx.state.ecsState[message.entityId][message.component],
              ...message.data,
            }
          }
          ctx.broadcast('ecs:component-update', {
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
