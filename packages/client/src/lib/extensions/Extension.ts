import type { World } from '@pulsar/ecs'
import { defineComponent, defineSystem } from '@pulsar/ecs'
import type { SystemDefinition } from '@pulsar/ecs'

/**
 * Extension - A composable, reusable behavior module.
 *
 * Extensions bundle components and systems together into a
 * self-contained behavior that can be attached to the ECS world.
 * They can be defined in simple TypeScript/JavaScript and loaded
 * at runtime without requiring a build step.
 *
 * @example
 * ```ts
 * const HealthExtension = defineExtension({
 *   name: 'health',
 *   components: {
 *     health: { defaults: () => ({ current: 100, max: 100 }) },
 *   },
 *   systems: [{
 *     name: 'health-regen',
 *     query: { required: ['health'] },
 *     onUpdate: (entity, components, dt) => {
 *       const health = components.get('health')!
 *       if (health.data.current < health.data.max) {
 *         health.data.current = Math.min(
 *           health.data.current + dt * 5,
 *           health.data.max
 *         )
 *       }
 *     },
 *   }],
 * })
 *
 * // Load into world
 * HealthExtension.install(world)
 * ```
 */
export interface ExtensionDefinition {
  /** Unique name for this extension */
  name: string
  /** Description of what this extension does */
  description?: string
  /** Version string */
  version?: string
  /** Components provided by this extension */
  components?: Record<
    string,
    {
      defaults: () => Record<string, unknown>
      schema?: Record<string, unknown>
    }
  >
  /** Systems provided by this extension */
  systems?: Array<Omit<SystemDefinition, 'name'> & { name?: string }>
  /** Called when the extension is installed */
  onInstall?: (world: World) => void
  /** Called when the extension is uninstalled */
  onUninstall?: (world: World) => void
}

export class Extension {
  readonly name: string
  readonly description: string
  readonly version: string
  private _definition: ExtensionDefinition
  private _installed = false

  constructor(definition: ExtensionDefinition) {
    this.name = definition.name
    this.description = definition.description ?? ''
    this.version = definition.version ?? '0.0.0'
    this._definition = definition
  }

  /** Install this extension into an ECS World */
  install(world: World): void {
    if (this._installed) {
      console.warn(`[pulsar] Extension "${this.name}" is already installed`)
      return
    }

    // Register components
    if (this._definition.components) {
      for (const [name, def] of Object.entries(this._definition.components)) {
        const fullName = `${this.name}:${name}`
        const component = defineComponent({
          name: fullName,
          defaults: def.defaults,
          schema: def.schema,
        })
        world.registerComponent(component)
      }
    }

    // Register systems
    if (this._definition.systems) {
      for (let i = 0; i < this._definition.systems.length; i++) {
        const sysDef = this._definition.systems[i]
        const systemName = sysDef.name ?? `${this.name}:system-${i}`

        // Prefix component names in the query with extension name
        const query = {
          required: sysDef.query.required.map((c) =>
            c.includes(':') ? c : `${this.name}:${c}`
          ),
          excluded: sysDef.query.excluded?.map((c) =>
            c.includes(':') ? c : `${this.name}:${c}`
          ),
        }

        const system = defineSystem({
          ...sysDef,
          name: systemName,
          query,
        })
        world.addSystem(system)
      }
    }

    // Call install hook
    this._definition.onInstall?.(world)
    this._installed = true
  }

  /** Uninstall this extension from the World */
  uninstall(world: World): void {
    if (!this._installed) return

    // Remove systems
    if (this._definition.systems) {
      for (let i = 0; i < this._definition.systems.length; i++) {
        const sysDef = this._definition.systems[i]
        const systemName = sysDef.name ?? `${this.name}:system-${i}`
        world.removeSystem(systemName)
      }
    }

    this._definition.onUninstall?.(world)
    this._installed = false
  }

  get isInstalled(): boolean {
    return this._installed
  }
}

/**
 * Define a new extension. Returns an Extension instance
 * that can be installed into any ECS World.
 */
export function defineExtension(definition: ExtensionDefinition): Extension {
  return new Extension(definition)
}

/**
 * Load an extension from a JavaScript/TypeScript source string.
 *
 * This enables live editing of extensions - users can write extension
 * code directly and have it loaded without a build step.
 *
 * SECURITY: Only load code from trusted sources. This uses Function()
 * constructor which has similar implications to eval().
 */
export function loadExtensionFromSource(source: string): Extension {
  // The source should export an extension definition
  // We wrap it in a function that provides the API
  const wrappedSource = `
    const module = { exports: {} };
    const exports = module.exports;
    ${source}
    return module.exports.default || module.exports;
  `

  const factory = new Function('defineExtension', 'defineComponent', 'defineSystem', wrappedSource)
  const definition = factory(defineExtension, defineComponent, defineSystem)

  if (definition instanceof Extension) {
    return definition
  }

  // If they returned a plain object definition, wrap it
  return defineExtension(definition)
}
