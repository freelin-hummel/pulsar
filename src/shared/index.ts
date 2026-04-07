/**
 * Pulsar Shared - Types, protocols, and built-in components
 *
 * Defines the common data types exchanged between client and server,
 * and provides built-in ECS components for the canvas system.
 */

export type { SyncMessage, ShapeChange, RoomState, UserPresence } from './protocol.js'
export { BuiltInComponents } from './components.js'
export type {
  BoardKind,
  BoardMode,
  BoardRole,
  BoardDescriptor,
  BoardGraph,
} from './board.js'
export { createBoard, linkBoards, unlinkBoards } from './board.js'
export type {
  TerrainTextureId,
  TerrainData,
  TerrainSwatch,
  WallType,
  GridPoint,
  WallData,
  DoorState,
  DoorData,
  MapObjectType,
  MapObjectSwatch,
  LightFalloff,
  LightData,
  LegendEntryData,
  MapTool,
} from './mapTypes.js'
export { TERRAIN_SWATCHES, MAP_OBJECT_SWATCHES } from './mapTypes.js'
