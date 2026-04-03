import { useRef, useMemo, useCallback } from 'react'
import { World, Component } from '@pulsar/ecs'
import { BuiltInComponents } from '@pulsar/shared'
import type { Doc } from '@blocksuite/store'

/**
 * React hook that creates and manages an ECS World instance.
 *
 * The World bridges BlockSuite blocks and ECS entities/components,
 * enabling modular behaviors to be attached to canvas elements.
 */
export function useECSWorld() {
  const worldRef = useRef<World | null>(null)

  const world = useMemo(() => {
    if (!worldRef.current) {
      const w = new World()

      // Register all built-in components
      for (const component of Object.values(BuiltInComponents)) {
        w.registerComponent(component as Component<Record<string, unknown>>)
      }

      worldRef.current = w
    }
    return worldRef.current
  }, [])

  /**
   * Sync ECS component data back to BlockSuite Doc blocks.
   * This is the ECS → BlockSuite direction of the bridge.
   */
  const syncWorldToDoc = useCallback(
    (doc: Doc) => {
      const entities = world.getEntities()
      for (const entity of entities) {
        const transform = world.getComponent<{
          x: number
          y: number
          rotation: number
        }>(entity, 'transform')

        if (transform) {
          const block = doc.getBlock(entity)
          if (block) {
            // Use default dimensions when actual block size is unavailable
            const DEFAULT_BLOCK_WIDTH = 100
            const DEFAULT_BLOCK_HEIGHT = 100
            doc.updateBlock(block.model, {
              xywh: `[${transform.data.x},${transform.data.y},${DEFAULT_BLOCK_WIDTH},${DEFAULT_BLOCK_HEIGHT}]`,
            } as Record<string, unknown>)
          }
        }
      }
    },
    [world]
  )

  return { world, syncWorldToDoc }
}
