import type { World } from '@pulsar/ecs'
import { Extension, loadExtensionFromSource } from './Extension.js'

/**
 * ExtensionRegistry - Manages loaded extensions.
 *
 * Provides a central place to discover, load, enable, and
 * disable extensions at runtime.
 */
export class ExtensionRegistry {
  private _extensions: Map<string, Extension> = new Map()
  private _world: World

  constructor(world: World) {
    this._world = world
  }

  /** Register an extension */
  register(extension: Extension): void {
    if (this._extensions.has(extension.name)) {
      console.warn(`[pulsar] Extension "${extension.name}" already registered`)
      return
    }
    this._extensions.set(extension.name, extension)
  }

  /** Register and immediately install an extension */
  install(extension: Extension): void {
    this.register(extension)
    extension.install(this._world)
  }

  /** Uninstall and remove an extension */
  uninstall(name: string): void {
    const extension = this._extensions.get(name)
    if (!extension) return
    extension.uninstall(this._world)
    this._extensions.delete(name)
  }

  /** Load an extension from source code and install it */
  loadFromSource(source: string): Extension {
    const extension = loadExtensionFromSource(source)
    this.install(extension)
    return extension
  }

  /** Get all registered extensions */
  getAll(): Extension[] {
    return Array.from(this._extensions.values())
  }

  /** Get a specific extension by name */
  get(name: string): Extension | undefined {
    return this._extensions.get(name)
  }

  /** Check if an extension is installed */
  has(name: string): boolean {
    return this._extensions.has(name)
  }
}
