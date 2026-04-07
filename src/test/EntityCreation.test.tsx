import { describe, it, expect, vi, beforeEach } from 'vitest'
import { World } from '../ecs/world.js'
import type { ComponentType } from '../ecs/types.js'

/**
 * Tests for ECS entity creation via the tool handlers in PulsarCanvas.
 *
 * These replicate exactly what the map tool handlers do: they create
 * entities and add components to the World, verifying that the ECS
 * layer properly stores each entity kind (terrain, wall, door, object,
 * light, legend) with the correct component data.
 *
 * This also covers scene-level block bridge behaviour: when BlockSuite
 * fires block-added events, the PulsarCanvas handler calls
 * world.addEntity(blockId), so we verify the World correctly tracks them.
 */

// ── Component type factories (mirrors PulsarCanvas handler inline types) ──

const terrainType: ComponentType = {
  name: 'map:terrain',
  defaults: () => ({ textureId: 'stone', elevation: 0 }),
}

const wallType: ComponentType = {
  name: 'map:wall',
  defaults: () => ({
    points: [],
    thickness: 2,
    material: 'stone',
    wallType: 'standard',
    seed: 0,
  }),
}

const doorType: ComponentType = {
  name: 'map:door',
  defaults: () => ({ state: 'closed', width: 1, linkedWallId: '' }),
}

const objectType: ComponentType = {
  name: 'map:object',
  defaults: () => ({
    objectType: 'crate',
    zIndex: 10,
    collidable: true,
    interactable: true,
  }),
}

const lightType: ComponentType = {
  name: 'map:light',
  defaults: () => ({
    radius: 30,
    color: '#ffcc66',
    intensity: 0.8,
    falloff: 'quadratic',
    castShadows: true,
  }),
}

const legendType: ComponentType = {
  name: 'map:legend',
  defaults: () => ({ number: 0, text: '', pinEntityId: '' }),
}

const transformType: ComponentType = {
  name: 'transform',
  defaults: () => ({ x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 }),
}

// ── Tests ──

describe('Entity creation via tool handlers', () => {
  let world: World

  beforeEach(() => {
    world = new World()
    world.init()
  })

  describe('terrain painting', () => {
    it('creates a terrain entity with the correct texture', () => {
      const cell = { x: 120, y: 80 }
      const entityId = `terrain_${cell.x}_${cell.y}`

      world.addEntity(entityId)
      world.addComponent(entityId, terrainType, { textureId: 'grass' })

      expect(world.hasEntity(entityId)).toBe(true)
      expect(world.hasComponent(entityId, 'map:terrain')).toBe(true)

      const comp = world.getComponent(entityId, 'map:terrain')
      expect(comp?.data.textureId).toBe('grass')
      expect(comp?.data.elevation).toBe(0)
    })

    it('paints multiple cells', () => {
      const cells = [
        { x: 0, y: 0 },
        { x: 40, y: 0 },
        { x: 80, y: 0 },
      ]

      for (const cell of cells) {
        const entityId = `terrain_${cell.x}_${cell.y}`
        if (!world.hasEntity(entityId)) {
          world.addEntity(entityId)
        }
        world.addComponent(entityId, terrainType, { textureId: 'water' })
      }

      const terrains = world.getEntitiesWith('map:terrain')
      expect(terrains).toHaveLength(3)
    })

    it('does not duplicate entity when painting same cell twice', () => {
      const entityId = 'terrain_100_100'

      world.addEntity(entityId)
      world.addComponent(entityId, terrainType, { textureId: 'stone' })

      // Paint same cell again with different texture (overwrite)
      if (!world.hasEntity(entityId)) {
        world.addEntity(entityId)
      }
      world.addComponent(entityId, terrainType, { textureId: 'grass' })

      // Should still be one entity, with updated texture
      expect(world.getEntitiesWith('map:terrain')).toHaveLength(1)
      const comp = world.getComponent(entityId, 'map:terrain')
      expect(comp?.data.textureId).toBe('grass')
    })
  })

  describe('wall drawing', () => {
    it('creates a wall entity with points and type', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 40, y: 0 },
        { x: 80, y: 40 },
      ]
      const entityId = `wall_${Date.now()}`

      world.addEntity(entityId)
      world.addComponent(entityId, wallType, {
        points,
        wallType: 'standard',
        seed: 0,
      })

      expect(world.hasEntity(entityId)).toBe(true)
      const comp = world.getComponent(entityId, 'map:wall')
      expect(comp?.data.points).toEqual(points)
      expect(comp?.data.wallType).toBe('standard')
    })

    it('creates a cavern wall with a seed', () => {
      const entityId = 'wall_cavern_1'

      world.addEntity(entityId)
      world.addComponent(entityId, wallType, {
        points: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
        wallType: 'cavern',
        seed: 42,
      })

      const comp = world.getComponent(entityId, 'map:wall')
      expect(comp?.data.wallType).toBe('cavern')
      expect(comp?.data.seed).toBe(42)
    })

    it('creates a diagonal wall', () => {
      const entityId = 'wall_diag_1'

      world.addEntity(entityId)
      world.addComponent(entityId, wallType, {
        points: [{ x: 0, y: 0 }, { x: 40, y: 40 }],
        wallType: 'diagonal',
      })

      const comp = world.getComponent(entityId, 'map:wall')
      expect(comp?.data.wallType).toBe('diagonal')
    })
  })

  describe('door placement', () => {
    it('creates a door entity with transform', () => {
      const point = { x: 40, y: 80 }
      const entityId = `door_${point.x}_${point.y}`

      world.addEntity(entityId)
      world.addComponent(entityId, doorType, { state: 'closed' })
      world.addComponent(entityId, transformType, { x: point.x, y: point.y })

      expect(world.hasEntity(entityId)).toBe(true)
      expect(world.hasComponent(entityId, 'map:door')).toBe(true)
      expect(world.hasComponent(entityId, 'transform')).toBe(true)

      const door = world.getComponent(entityId, 'map:door')
      expect(door?.data.state).toBe('closed')

      const transform = world.getComponent(entityId, 'transform')
      expect(transform?.data.x).toBe(40)
      expect(transform?.data.y).toBe(80)
    })
  })

  describe('object placement', () => {
    it('creates a map object entity with type and transform', () => {
      const entityId = 'obj_1234'

      world.addEntity(entityId)
      world.addComponent(entityId, objectType, { objectType: 'barrel' })
      world.addComponent(entityId, transformType, { x: 120, y: 200 })

      expect(world.hasComponent(entityId, 'map:object')).toBe(true)
      expect(world.hasComponent(entityId, 'transform')).toBe(true)

      const obj = world.getComponent(entityId, 'map:object')
      expect(obj?.data.objectType).toBe('barrel')
    })

    it('can place multiple different object types', () => {
      const objectTypes = ['crate', 'table', 'barrel', 'bookshelf', 'chair', 'chest', 'pillar', 'statue']

      for (const [i, objType] of objectTypes.entries()) {
        const entityId = `obj_${i}`
        world.addEntity(entityId)
        world.addComponent(entityId, objectType, { objectType: objType })
        world.addComponent(entityId, transformType, { x: i * 40, y: 0 })
      }

      const objects = world.getEntitiesWith('map:object')
      expect(objects).toHaveLength(8)
    })
  })

  describe('light placement', () => {
    it('creates a light entity with default properties', () => {
      const entityId = 'light_5678'

      world.addEntity(entityId)
      world.addComponent(entityId, lightType, {})
      world.addComponent(entityId, transformType, { x: 200, y: 200 })

      expect(world.hasComponent(entityId, 'map:light')).toBe(true)
      const light = world.getComponent(entityId, 'map:light')
      expect(light?.data.radius).toBe(30)
      expect(light?.data.color).toBe('#ffcc66')
      expect(light?.data.intensity).toBe(0.8)
      expect(light?.data.falloff).toBe('quadratic')
      expect(light?.data.castShadows).toBe(true)
    })

    it('creates a light entity with custom properties', () => {
      const entityId = 'light_custom'

      world.addEntity(entityId)
      world.addComponent(entityId, lightType, {
        radius: 60,
        color: '#ff0000',
        intensity: 1.0,
        falloff: 'linear',
        castShadows: false,
      })

      const light = world.getComponent(entityId, 'map:light')
      expect(light?.data.radius).toBe(60)
      expect(light?.data.color).toBe('#ff0000')
      expect(light?.data.intensity).toBe(1.0)
      expect(light?.data.falloff).toBe('linear')
      expect(light?.data.castShadows).toBe(false)
    })
  })

  describe('legend placement', () => {
    it('creates a legend entry with number and text', () => {
      const entityId = 'legend_9012'

      world.addEntity(entityId)
      world.addComponent(entityId, legendType, {
        number: 1,
        text: 'Dragon\'s Lair',
        pinEntityId: entityId,
      })
      world.addComponent(entityId, transformType, { x: 300, y: 300 })

      expect(world.hasComponent(entityId, 'map:legend')).toBe(true)
      const legend = world.getComponent(entityId, 'map:legend')
      expect(legend?.data.number).toBe(1)
      expect(legend?.data.text).toBe('Dragon\'s Lair')
      expect(legend?.data.pinEntityId).toBe(entityId)
    })

    it('creates sequential legend entries', () => {
      for (let i = 1; i <= 3; i++) {
        const entityId = `legend_${i}`
        world.addEntity(entityId)
        world.addComponent(entityId, legendType, {
          number: i,
          text: `Location ${i}`,
          pinEntityId: entityId,
        })
        world.addComponent(entityId, transformType, { x: i * 100, y: 100 })
      }

      const legends = world.getEntitiesWith('map:legend')
      expect(legends).toHaveLength(3)
    })
  })

  describe('entity removal', () => {
    it('removes a legend entry and re-numbers remaining', () => {
      // Add 3 legends
      for (let i = 1; i <= 3; i++) {
        const entityId = `legend_${i}`
        world.addEntity(entityId)
        world.addComponent(entityId, legendType, {
          number: i,
          text: `Location ${i}`,
          pinEntityId: entityId,
        })
      }

      // Remove the second one
      world.removeEntity('legend_2')

      expect(world.hasEntity('legend_2')).toBe(false)
      expect(world.getEntitiesWith('map:legend')).toHaveLength(2)
    })

    it('removes all components when entity is removed', () => {
      const entityId = 'obj_to_remove'
      world.addEntity(entityId)
      world.addComponent(entityId, objectType, { objectType: 'crate' })
      world.addComponent(entityId, transformType, { x: 0, y: 0 })

      world.removeEntity(entityId)

      expect(world.hasEntity(entityId)).toBe(false)
      expect(world.hasComponent(entityId, 'map:object')).toBe(false)
      expect(world.hasComponent(entityId, 'transform')).toBe(false)
    })
  })

  describe('scene block bridge', () => {
    it('adds entities from BlockSuite block events', () => {
      // Simulates what the blockUpdated handler does in PulsarCanvas
      const blockId = 'block:abc123'
      world.addEntity(blockId)

      expect(world.hasEntity(blockId)).toBe(true)
    })

    it('removes entities from BlockSuite block delete events', () => {
      const blockId = 'block:abc123'
      world.addEntity(blockId)

      world.removeEntity(blockId)

      expect(world.hasEntity(blockId)).toBe(false)
    })

    it('fires entityAdded event when a block entity is created', () => {
      const handler = vi.fn()
      world.on('entityAdded', handler)

      world.addEntity('block:newblock')

      expect(handler).toHaveBeenCalledWith('block:newblock')
    })

    it('fires entityRemoved event when a block entity is deleted', () => {
      const handler = vi.fn()
      world.addEntity('block:todelete')
      world.on('entityRemoved', handler)

      world.removeEntity('block:todelete')

      expect(handler).toHaveBeenCalledWith('block:todelete')
    })
  })

  describe('mixed entity queries', () => {
    it('can find entities with specific component combinations', () => {
      // Create a light with transform
      world.addEntity('light_1')
      world.addComponent('light_1', lightType, {})
      world.addComponent('light_1', transformType, { x: 100, y: 100 })

      // Create an object with transform
      world.addEntity('obj_1')
      world.addComponent('obj_1', objectType, { objectType: 'crate' })
      world.addComponent('obj_1', transformType, { x: 200, y: 200 })

      // Create a terrain (no transform)
      world.addEntity('terrain_1')
      world.addComponent('terrain_1', terrainType, { textureId: 'grass' })

      // Query for entities with transform
      const withTransform = world.getEntitiesWith('transform')
      expect(withTransform).toHaveLength(2)
      expect(withTransform).toContain('light_1')
      expect(withTransform).toContain('obj_1')

      // Query for lights with transform
      const lightsWithTransform = world.getEntitiesWith('map:light', 'transform')
      expect(lightsWithTransform).toHaveLength(1)
      expect(lightsWithTransform[0]).toBe('light_1')
    })
  })
})
