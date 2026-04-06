/**
 * Sync protocol types for client-server communication.
 * Adapted for BlockSuite + RivetKit actors.
 */

/** A message exchanged between client and server for state sync */
export type SyncMessage =
  | { type: 'connect'; roomId: string; userId: string }
  | { type: 'disconnect'; userId: string }
  | { type: 'update'; changes: ShapeChange[] }
  | { type: 'presence'; userId: string; cursor: { x: number; y: number }; selection: string[] }
  | { type: 'snapshot'; state: RoomState }
  | { type: 'ecs:component-add'; entityId: string; component: string; data: Record<string, unknown> }
  | { type: 'ecs:component-remove'; entityId: string; component: string }
  | { type: 'ecs:component-update'; entityId: string; component: string; data: Record<string, unknown> }

/** Represents a change to a shape on the canvas */
export interface ShapeChange {
  id: string
  type: 'create' | 'update' | 'delete'
  data?: Record<string, unknown>
}

/** The full state of a room */
export interface RoomState {
  roomId: string
  shapes: Record<string, Record<string, unknown>>
  ecsState: Record<string, Record<string, Record<string, unknown>>>
  users: UserPresence[]
}

/** A user's presence in a room */
export interface UserPresence {
  userId: string
  name: string
  color: string
  cursor: { x: number; y: number }
  selection: string[]
  lastSeen: number
}
