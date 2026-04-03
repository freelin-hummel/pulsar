/**
 * @pulsar/ecs - Entity Component System
 *
 * A lightweight, composable ECS framework designed for extending tldraw shapes
 * with modular, reusable behaviors. Components are pure data, systems process
 * entities with matching component signatures each frame or on events.
 *
 * Key concepts:
 * - Entity: A unique identifier (maps to a tldraw shape ID)
 * - Component: A typed data container attached to an entity
 * - System: Logic that processes entities matching a component query
 * - World: The container managing all entities, components, and systems
 */

export { World } from './world.js'
export { Component, defineComponent } from './component.js'
export { System, defineSystem } from './system.js'
export type {
  Entity,
  ComponentType,
  ComponentInstance,
  SystemDefinition,
  Query,
  WorldEvents,
} from './types.js'
