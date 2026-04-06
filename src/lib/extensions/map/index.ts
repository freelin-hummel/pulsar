/**
 * Map Extension — Entry point
 *
 * The MapExtension bundles all map-specific ECS components and systems
 * into a single installable extension. When a board of type "map" is
 * active and in edit mode, these components and systems become available.
 *
 * All components are namespaced with "map:" prefix (e.g., "map:terrain",
 * "map:wall") to avoid collisions with core or other extension components.
 *
 * @example
 * ```ts
 * import { MapExtension } from './lib/extensions/map/index.js'
 *
 * // Install into the ECS world when a map board is activated
 * MapExtension.install(world)
 *
 * // Add terrain to a grid cell entity
 * world.addComponent(cellEntity, { name: 'map:terrain' }, { textureId: 'grass' })
 * ```
 */

import { defineExtension } from '../Extension.js'
import { mapComponents } from './components.js'
import { mapSystems } from './systems.js'

export const MapExtension = defineExtension({
  name: 'map',
  description: 'Map editing tools — terrain, walls, doors, objects, lighting, and legends',
  version: '0.1.0',
  components: mapComponents,
  systems: mapSystems,

  onInstall: (_world) => {
    // Map extension installed — map editing tools are now available
    console.info('[pulsar:map] Map extension installed')
  },

  onUninstall: (_world) => {
    console.info('[pulsar:map] Map extension uninstalled')
  },
})
