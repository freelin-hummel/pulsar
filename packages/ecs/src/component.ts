import type { ComponentType, ComponentInstance } from './types.js'

/**
 * Component class - wraps a ComponentType definition and provides
 * factory methods for creating instances.
 */
export class Component<T extends Record<string, unknown> = Record<string, unknown>> {
  readonly name: string
  private readonly _defaults: () => T
  readonly schema?: Record<string, unknown>

  constructor(definition: ComponentType<T>) {
    this.name = definition.name
    this._defaults = definition.defaults
    this.schema = definition.schema
  }

  /** Create a new component instance with defaults merged with overrides */
  create(overrides?: Partial<T>): ComponentInstance<T> {
    const defaults = this._defaults()
    return {
      type: this.name,
      data: overrides ? { ...defaults, ...overrides } : defaults,
    }
  }

  /** Get default values */
  defaults(): T {
    return this._defaults()
  }
}

/**
 * Define a component type. Returns a Component that can create instances.
 *
 * @example
 * ```ts
 * const Position = defineComponent({
 *   name: 'position',
 *   defaults: () => ({ x: 0, y: 0 }),
 * })
 *
 * // Create an instance
 * const pos = Position.create({ x: 10, y: 20 })
 * ```
 */
export function defineComponent<T extends Record<string, unknown>>(
  definition: ComponentType<T>
): Component<T> {
  return new Component(definition)
}
