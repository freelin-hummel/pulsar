import { useEffect, useRef, type RefObject } from 'react'
import { WebGLManager } from '../lib/shaders/WebGLManager.js'
import { MinimalShader } from '../lib/shaders/programs/MinimalShader.js'

/**
 * React hook for managing the WebGL shader overlay system.
 *
 * Creates a WebGL canvas overlay on top of the BlockSuite canvas
 * that can render shader effects per-element or globally.
 */
export function useShaderManager(containerRef: RefObject<HTMLDivElement | null>) {
  const managerRef = useRef<WebGLManager | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const manager = new WebGLManager(container)
    managerRef.current = manager

    // Register the built-in minimal shader
    manager.registerProgram('minimal', new MinimalShader(manager))

    manager.start()

    return () => {
      manager.dispose()
      managerRef.current = null
    }
  }, [containerRef])

  return { shaderManager: managerRef }
}
