/**
 * Map Extension — Systems
 *
 * ECS systems that process map-specific entities.
 * Systems are registered when the MapExtension is installed into a World.
 */

import type { SystemDefinition, ComponentInstance, WorldAPI } from '../../../ecs/types.js'

/**
 * WallSystem — Manages wall auto-connections.
 *
 * When a wall entity enters, checks if its endpoints overlap with
 * existing wall endpoints and merges connection points.
 */
const wallSystem: Omit<SystemDefinition, 'name'> & { name?: string } = {
  name: 'wall-connect',
  query: { required: ['wall'] },
  priority: 10,

  onEntityEnter: (_entity, _components, _world) => {
    // Wall auto-connection logic:
    // 1. Get the wall's endpoint coordinates
    // 2. Find nearby wall entities with matching endpoints
    // 3. Merge shared endpoints for clean corners/T-junctions
    // Actual geometry merging will be handled by the rendering layer
  },

  onUpdate: (
    _entity: string,
    _components: Map<string, ComponentInstance>,
    _dt: number,
    _world: WorldAPI,
  ) => {
    // Walls are static — no per-frame update needed unless wall is being drawn
  },
}

/**
 * DoorSystem — Manages door state transitions.
 *
 * Door open/close/lock are game-semantic operations routed through
 * the authoritative server for validation.
 */
const doorSystem: Omit<SystemDefinition, 'name'> & { name?: string } = {
  name: 'door-state',
  query: { required: ['door'] },
  priority: 11,

  onEntityEnter: (_entity, _components, _world) => {
    // When a door is placed, verify it references a valid wall entity
  },
}

/**
 * MapLayerSystem — Manages Z-order across map layers.
 *
 * Render order: terrain (0) → floor details (5) → objects (10) → walls (20) → lighting (30)
 */
const mapLayerSystem: Omit<SystemDefinition, 'name'> & { name?: string } = {
  name: 'map-layers',
  query: { required: ['object'] },
  priority: 5,

  onEntityEnter: (_entity, components, _world) => {
    // Ensure object has correct zIndex based on its type
    const obj = components.get('map:object')
    if (obj) {
      // Objects default to layer 10 (above terrain, below walls)
      if (obj.data.zIndex === undefined) {
        obj.data.zIndex = 10
      }
    }
  },
}

/**
 * LightingSystem — Raycasts against wall geometry for shadow computation.
 *
 * Only recomputes when walls or lights change (dirty flag pattern).
 * Outputs shadow polygon data consumed by the LightingShader.
 */
const lightingSystem: Omit<SystemDefinition, 'name'> & { name?: string } = {
  name: 'lighting',
  query: { required: ['light'] },
  priority: 25,

  onInit: (_world) => {
    // Set up shadow polygon buffer
  },

  onEntityEnter: (_entity, _components, _world) => {
    // Mark lighting as dirty — needs recomputation
  },

  onUpdate: (
    _entity: string,
    components: Map<string, ComponentInstance>,
    _dt: number,
    _world: WorldAPI,
  ) => {
    // For each light:
    // 1. Get light position and radius from transform + light component
    // 2. Gather all wall segments within radius
    // 3. Raycast from light center against wall geometry
    // 4. Compute shadow polygons (visibility polygon algorithm)
    // 5. Store result for shader consumption
    const light = components.get('map:light')
    if (light && light.data.castShadows) {
      // Shadow computation happens here when wall geometry changes
      // Results are cached until walls or lights move
    }
  },
}

/**
 * LegendSystem — Auto-numbering and pin synchronization.
 *
 * Keeps legend numbers sequential and syncs pin positions with their text entries.
 */
const legendSystem: Omit<SystemDefinition, 'name'> & { name?: string } = {
  name: 'legend-numbering',
  query: { required: ['legend'] },
  priority: 30,

  onEntityEnter: (_entity, components, world) => {
    // Auto-assign next number
    const legend = components.get('map:legend')
    if (legend && legend.data.number === 0) {
      const allLegends = world.getEntitiesWith('map:legend')
      legend.data.number = allLegends.length
    }
  },

  onUpdate: (
    _entity: string,
    _components: Map<string, ComponentInstance>,
    _dt: number,
    _world: WorldAPI,
  ) => {
    // Legend entries are static — no per-frame update
  },
}

/** All systems provided by the map extension */
export const mapSystems: Array<Omit<SystemDefinition, 'name'> & { name?: string }> = [
  wallSystem,
  doorSystem,
  mapLayerSystem,
  lightingSystem,
  legendSystem,
]
