/**
 * Map-specific type definitions.
 *
 * These types are used by the map extension components and systems,
 * as well as the map editing UI tools.
 */

// ── Terrain ──

/** Identifier for a terrain texture */
export type TerrainTextureId =
  | 'stone'
  | 'grass'
  | 'wood'
  | 'water'
  | 'sand'
  | 'dirt'
  | 'snow'
  | 'lava'
  | 'void'

/** Terrain cell data */
export interface TerrainData {
  textureId: TerrainTextureId
  elevation: number
}

/** Human-readable terrain info for palettes */
export interface TerrainSwatch {
  id: TerrainTextureId
  label: string
  color: string
}

/** Available terrain types with their display colors */
export const TERRAIN_SWATCHES: TerrainSwatch[] = [
  { id: 'stone', label: 'Stone', color: '#6b6b6b' },
  { id: 'grass', label: 'Grass', color: '#4a7c3f' },
  { id: 'wood', label: 'Wood', color: '#8b6914' },
  { id: 'water', label: 'Water', color: '#2d6a9f' },
  { id: 'sand', label: 'Sand', color: '#c2b280' },
  { id: 'dirt', label: 'Dirt', color: '#6b4423' },
  { id: 'snow', label: 'Snow', color: '#dce8ef' },
  { id: 'lava', label: 'Lava', color: '#cf3a24' },
  { id: 'void', label: 'Void', color: '#1a1a2e' },
]

// ── Walls ──

/** Wall type variants */
export type WallType = 'standard' | 'diagonal' | 'cavern'

/** A 2D point on the grid */
export interface GridPoint {
  x: number
  y: number
}

/** Wall segment data */
export interface WallData {
  points: GridPoint[]
  thickness: number
  material: string
  wallType: WallType
  /** Noise seed for cavern walls (deterministic across clients) */
  seed?: number
}

// ── Doors & Windows ──

/** Door state */
export type DoorState = 'open' | 'closed' | 'locked'

/** Door data */
export interface DoorData {
  state: DoorState
  width: number
  linkedWallId: string
}

// ── Objects ──

/** Placeable map object types */
export type MapObjectType =
  | 'crate'
  | 'table'
  | 'barrel'
  | 'bookshelf'
  | 'chair'
  | 'chest'
  | 'pillar'
  | 'statue'

/** Map object info for the palette */
export interface MapObjectSwatch {
  id: MapObjectType
  label: string
  icon: string
  width: number
  height: number
}

/** Available map objects */
export const MAP_OBJECT_SWATCHES: MapObjectSwatch[] = [
  { id: 'crate', label: 'Crate', icon: '▦', width: 1, height: 1 },
  { id: 'table', label: 'Table', icon: '▬', width: 2, height: 1 },
  { id: 'barrel', label: 'Barrel', icon: '◎', width: 1, height: 1 },
  { id: 'bookshelf', label: 'Bookshelf', icon: '▥', width: 3, height: 1 },
  { id: 'chair', label: 'Chair', icon: '⊡', width: 1, height: 1 },
  { id: 'chest', label: 'Chest', icon: '⊞', width: 1, height: 1 },
  { id: 'pillar', label: 'Pillar', icon: '◉', width: 1, height: 1 },
  { id: 'statue', label: 'Statue', icon: '♜', width: 1, height: 1 },
]

// ── Lighting ──

/** Light falloff curves */
export type LightFalloff = 'linear' | 'quadratic' | 'none'

/** Light node data */
export interface LightData {
  radius: number
  color: string
  intensity: number
  falloff: LightFalloff
  castShadows: boolean
}

// ── Legend ──

/** Legend entry data */
export interface LegendEntryData {
  number: number
  text: string
  pinEntityId: string
}

// ── Map Tool IDs ──

/** All map-specific tools */
export type MapTool =
  | 'terrain'
  | 'wall'
  | 'wall-diagonal'
  | 'wall-cavern'
  | 'door'
  | 'object'
  | 'light'
  | 'legend'
