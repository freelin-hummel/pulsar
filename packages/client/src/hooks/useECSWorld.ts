import { useRef, useMemo, useCallback } from 'react'
import { World, Component } from '@pulsar/ecs'
import { BuiltInComponents } from '@pulsar/shared'
import type { Editor } from 'tldraw'

/**
 * React hook that creates and manages an ECS World instance.
 *
 * The World bridges tldraw shapes and ECS entities/components,
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
   * Sync ECS component data back to tldraw editor shapes.
   * This is the ECS → tldraw direction of the bridge.
   */
  const syncWorldToEditor = useCallback(
    (editor: Editor) => {
      const entities = world.getEntities()
      for (const entity of entities) {
        const transform = world.getComponent<{
          x: number
          y: number
          rotation: number
        }>(entity, 'transform')

        if (transform) {
          const shape = editor.getShape(entity as Parameters<typeof editor.getShape>[0])
          if (shape) {
            editor.updateShape({
              id: shape.id,
              type: shape.type,
              x: transform.data.x,
              y: transform.data.y,
              rotation: transform.data.rotation,
            })
          }
        }
      }
    },
    [world]
  )

  return { world, syncWorldToEditor }
}
