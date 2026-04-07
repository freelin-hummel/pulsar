/**
 * Map Extension — Components
 *
 * Defines the ECS components used by the map board type.
 * These are registered under the "map:" namespace when the extension is installed.
 */

import type {
  TerrainTextureId,
  WallType,
  GridPoint,
  DoorState,
  MapObjectType,
  LightFalloff,
} from '../../../shared/mapTypes.js'

/**
 * Component defaults for the map extension.
 * Keys become the component name (prefixed with "map:" on install).
 */
export const mapComponents = {
  /** Terrain cell — painted per-grid-cell */
  terrain: {
    defaults: () => ({
      textureId: 'stone' as TerrainTextureId,
      elevation: 0,
    }),
  },

  /** Wall segment — snapped to grid lines */
  wall: {
    defaults: () => ({
      points: [] as GridPoint[],
      thickness: 2,
      material: 'stone',
      wallType: 'standard' as WallType,
      seed: 0,
    }),
  },

  /** Door — breaks wall collision geometry */
  door: {
    defaults: () => ({
      state: 'closed' as DoorState,
      width: 1,
      linkedWallId: '',
    }),
  },

  /** Placeable object — furniture, props */
  object: {
    defaults: () => ({
      objectType: 'crate' as MapObjectType,
      zIndex: 10,
      collidable: true,
      interactable: true,
    }),
  },

  /** Light node — raycasted shadows */
  light: {
    defaults: () => ({
      radius: 30,
      color: '#ffcc66',
      intensity: 0.8,
      falloff: 'quadratic' as LightFalloff,
      castShadows: true,
    }),
  },

  /** Legend entry — numbered pin + text */
  legend: {
    defaults: () => ({
      number: 0,
      text: '',
      pinEntityId: '',
    }),
  },
} as const
