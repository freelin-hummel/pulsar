import type { SystemDefinition, Query, WorldAPI, Entity, ComponentInstance } from './types.js'

/**
 * System class - wraps a SystemDefinition and manages matched entities.
 */
export class System {
  readonly name: string
  readonly query: Query
  readonly priority: number
  private readonly _definition: SystemDefinition
  private _matchedEntities: Set<Entity> = new Set()

  constructor(definition: SystemDefinition) {
    this.name = definition.name
    this.query = definition.query
    this.priority = definition.priority ?? 0
    this._definition = definition
  }

  /** Check if an entity matches this system's query */
  matches(entityComponents: Set<string>): boolean {
    const required = this.query.required
    for (const comp of required) {
      if (!entityComponents.has(comp)) return false
    }
    const excluded = this.query.excluded
    if (excluded) {
      for (const comp of excluded) {
        if (entityComponents.has(comp)) return false
      }
    }
    return true
  }

  /** Track entity entering the match set */
  addEntity(entity: Entity, components: Map<string, ComponentInstance>, world: WorldAPI): void {
    if (this._matchedEntities.has(entity)) return
    this._matchedEntities.add(entity)
    this._definition.onEntityEnter?.(entity, components, world)
  }

  /** Track entity leaving the match set */
  removeEntity(entity: Entity, world: WorldAPI): void {
    if (!this._matchedEntities.has(entity)) return
    this._matchedEntities.delete(entity)
    this._definition.onEntityExit?.(entity, world)
  }

  /** Get all currently matched entities */
  getMatchedEntities(): ReadonlySet<Entity> {
    return this._matchedEntities
  }

  /** Run the update callback for a single entity */
  update(entity: Entity, components: Map<string, ComponentInstance>, dt: number, world: WorldAPI): void {
    this._definition.onUpdate?.(entity, components, dt, world)
  }

  /** Initialize the system */
  init(world: WorldAPI): void {
    this._definition.onInit?.(world)
  }

  /** Destroy the system */
  destroy(world: WorldAPI): void {
    this._definition.onDestroy?.(world)
  }
}

/**
 * Define a system that processes entities matching a component query.
 *
 * @example
 * ```ts
 * const MovementSystem = defineSystem({
 *   name: 'movement',
 *   query: { required: ['position', 'velocity'] },
 *   onUpdate: (entity, components, dt, world) => {
 *     const pos = components.get('position')!
 *     const vel = components.get('velocity')!
 *     pos.data.x += vel.data.dx * dt
 *     pos.data.y += vel.data.dy * dt
 *   },
 * })
 * ```
 */
export function defineSystem(definition: SystemDefinition): System {
  return new System(definition)
}
