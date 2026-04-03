import { System } from './system.js'
import { Component } from './component.js'
import type {
  Entity,
  ComponentType,
  ComponentInstance,
  WorldAPI,
} from './types.js'

type EventHandler = (...args: unknown[]) => void

/**
 * World - the central ECS container.
 *
 * Manages entities, their components, and systems that process them.
 * Integrates with tldraw by using shape IDs as entity identifiers.
 */
export class World implements WorldAPI {
  private _entities: Map<Entity, Map<string, ComponentInstance>> = new Map()
  private _componentTypes: Map<string, Component> = new Map()
  private _systems: System[] = []
  private _systemsByName: Map<string, System> = new Map()
  private _events: Map<string, Set<EventHandler>> = new Map()
  private _initialized = false

  // ── Entity Management ──

  addEntity(entity: Entity): void {
    if (this._entities.has(entity)) return
    this._entities.set(entity, new Map())
    this.emit('entityAdded', entity)
  }

  removeEntity(entity: Entity): void {
    const components = this._entities.get(entity)
    if (!components) return

    // Notify systems of entity removal
    for (const system of this._systems) {
      system.removeEntity(entity, this)
    }

    this._entities.delete(entity)
    this.emit('entityRemoved', entity)
  }

  hasEntity(entity: Entity): boolean {
    return this._entities.has(entity)
  }

  getEntities(): Entity[] {
    return Array.from(this._entities.keys())
  }

  // ── Component Management ──

  registerComponent<T extends Record<string, unknown>>(component: Component<T>): void {
    this._componentTypes.set(component.name, component as Component<Record<string, unknown>>)
  }

  addComponent<T extends Record<string, unknown>>(
    entity: Entity,
    type: ComponentType<T>,
    data?: Partial<T>
  ): void {
    let components = this._entities.get(entity)
    if (!components) {
      this.addEntity(entity)
      components = this._entities.get(entity)!
    }

    // Register the component type if not already registered
    if (!this._componentTypes.has(type.name)) {
      this._componentTypes.set(type.name, new Component(type))
    }

    const comp = this._componentTypes.get(type.name)!
    components.set(type.name, comp.create(data as Partial<Record<string, unknown>>))
    this.emit('componentAdded', entity, type.name)

    // Re-evaluate system matches
    this._updateEntitySystems(entity)
  }

  removeComponent(entity: Entity, typeName: string): void {
    const components = this._entities.get(entity)
    if (!components) return

    components.delete(typeName)
    this.emit('componentRemoved', entity, typeName)

    // Re-evaluate system matches
    this._updateEntitySystems(entity)
  }

  getComponent<T extends Record<string, unknown>>(
    entity: Entity,
    typeName: string
  ): ComponentInstance<T> | undefined {
    return this._entities.get(entity)?.get(typeName) as ComponentInstance<T> | undefined
  }

  hasComponent(entity: Entity, typeName: string): boolean {
    return this._entities.get(entity)?.has(typeName) ?? false
  }

  getEntitiesWith(...componentNames: string[]): Entity[] {
    const result: Entity[] = []
    for (const [entity, components] of this._entities) {
      let match = true
      for (const name of componentNames) {
        if (!components.has(name)) {
          match = false
          break
        }
      }
      if (match) result.push(entity)
    }
    return result
  }

  /** Get all components for an entity */
  getComponents(entity: Entity): Map<string, ComponentInstance> | undefined {
    return this._entities.get(entity)
  }

  // ── System Management ──

  addSystem(system: System): void {
    if (this._systemsByName.has(system.name)) {
      throw new Error(`System "${system.name}" is already registered`)
    }

    this._systems.push(system)
    this._systemsByName.set(system.name, system)

    // Sort by priority
    this._systems.sort((a, b) => a.priority - b.priority)

    // Initialize system if world is already running
    if (this._initialized) {
      system.init(this)
      // Check existing entities against the new system
      for (const [entity, components] of this._entities) {
        const componentNames = new Set(components.keys())
        if (system.matches(componentNames)) {
          system.addEntity(entity, components, this)
        }
      }
    }
  }

  removeSystem(name: string): void {
    const system = this._systemsByName.get(name)
    if (!system) return

    system.destroy(this)
    this._systemsByName.delete(name)
    this._systems = this._systems.filter((s) => s.name !== name)
  }

  getSystem(name: string): System | undefined {
    return this._systemsByName.get(name)
  }

  // ── Lifecycle ──

  /** Initialize all systems. Call once after setup. */
  init(): void {
    if (this._initialized) return
    this._initialized = true

    for (const system of this._systems) {
      system.init(this)
    }

    // Evaluate all existing entities against all systems
    for (const [entity, components] of this._entities) {
      this._updateEntitySystems(entity, components)
    }
  }

  /** Run one update tick across all systems */
  update(dt: number): void {
    for (const system of this._systems) {
      for (const entity of system.getMatchedEntities()) {
        const components = this._entities.get(entity)
        if (components) {
          system.update(entity, components, dt, this)
        }
      }
    }
  }

  /** Clean up all systems and entities */
  destroy(): void {
    for (const system of this._systems) {
      system.destroy(this)
    }
    this._systems = []
    this._systemsByName.clear()
    this._entities.clear()
    this._componentTypes.clear()
    this._events.clear()
    this._initialized = false
  }

  // ── Events ──

  emit(event: string, ...args: unknown[]): void {
    const handlers = this._events.get(event)
    if (!handlers) return
    for (const handler of handlers) {
      handler(...args)
    }
  }

  on(event: string, handler: EventHandler): () => void {
    let handlers = this._events.get(event)
    if (!handlers) {
      handlers = new Set()
      this._events.set(event, handlers)
    }
    handlers.add(handler)
    return () => {
      handlers.delete(handler)
    }
  }

  // ── Serialization ──

  /** Serialize the world state to a plain object */
  serialize(): Record<string, Record<string, unknown>> {
    const result: Record<string, Record<string, unknown>> = {}
    for (const [entity, components] of this._entities) {
      const entityData: Record<string, unknown> = {}
      for (const [name, comp] of components) {
        entityData[name] = comp.data
      }
      result[entity] = entityData
    }
    return result
  }

  /** Load entities and components from serialized state */
  deserialize(state: Record<string, Record<string, Record<string, unknown>>>): void {
    for (const [entity, components] of Object.entries(state)) {
      this.addEntity(entity)
      for (const [typeName, data] of Object.entries(components)) {
        const compType = this._componentTypes.get(typeName)
        if (compType) {
          const entityComponents = this._entities.get(entity)!
          entityComponents.set(typeName, compType.create(data))
          this.emit('componentAdded', entity, typeName)
        }
      }
      this._updateEntitySystems(entity)
    }
  }

  // ── Internal ──

  private _updateEntitySystems(
    entity: Entity,
    components?: Map<string, ComponentInstance>
  ): void {
    const entityComponents = components ?? this._entities.get(entity)
    if (!entityComponents) return

    const componentNames = new Set(entityComponents.keys())

    for (const system of this._systems) {
      if (system.matches(componentNames)) {
        system.addEntity(entity, entityComponents, this)
      } else {
        system.removeEntity(entity, this)
      }
    }
  }
}
