/**
 * Core ECS type definitions.
 */

/** An entity is a unique string identifier, mapped to tldraw shape IDs. */
export type Entity = string

/**
 * Defines the shape of a component type.
 * Components are pure data containers - no logic.
 */
export interface ComponentType<T extends Record<string, unknown> = Record<string, unknown>> {
  /** Unique name identifying this component type */
  name: string
  /** Factory returning default values for the component */
  defaults: () => T
  /** Optional JSON schema for validation and editor generation */
  schema?: Record<string, unknown>
}

/** An instance of a component attached to an entity */
export interface ComponentInstance<T extends Record<string, unknown> = Record<string, unknown>> {
  type: string
  data: T
}

/** Defines which components a system requires */
export interface Query {
  /** Components that must be present */
  required: string[]
  /** Components that must not be present */
  excluded?: string[]
}

/** Events emitted by the World */
export interface WorldEvents {
  entityAdded: (entity: Entity) => void
  entityRemoved: (entity: Entity) => void
  componentAdded: (entity: Entity, componentType: string) => void
  componentRemoved: (entity: Entity, componentType: string) => void
}

/** Defines a system that processes matching entities */
export interface SystemDefinition {
  /** Unique name for this system */
  name: string
  /** Component query - which entities does this system process */
  query: Query
  /** Priority for execution ordering (lower = earlier). Default: 0 */
  priority?: number
  /** Called once when the system is added to the world */
  onInit?: (world: WorldAPI) => void
  /** Called each update tick for each matching entity */
  onUpdate?: (entity: Entity, components: Map<string, ComponentInstance>, dt: number, world: WorldAPI) => void
  /** Called when an entity enters the query match set */
  onEntityEnter?: (entity: Entity, components: Map<string, ComponentInstance>, world: WorldAPI) => void
  /** Called when an entity leaves the query match set */
  onEntityExit?: (entity: Entity, world: WorldAPI) => void
  /** Called once when the system is removed from the world */
  onDestroy?: (world: WorldAPI) => void
}

/** Public API available to systems for interacting with the world */
export interface WorldAPI {
  addEntity(entity: Entity): void
  removeEntity(entity: Entity): void
  addComponent<T extends Record<string, unknown>>(entity: Entity, type: ComponentType<T>, data?: Partial<T>): void
  removeComponent(entity: Entity, typeName: string): void
  getComponent<T extends Record<string, unknown>>(entity: Entity, typeName: string): ComponentInstance<T> | undefined
  hasComponent(entity: Entity, typeName: string): boolean
  getEntitiesWith(...componentNames: string[]): Entity[]
  emit(event: string, ...args: unknown[]): void
  on(event: string, handler: (...args: unknown[]) => void): () => void
}
