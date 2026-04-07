/**
 * edgelessService — Access BlockSuite's EdgelessRootService from React.
 *
 * Instead of going through querySelector('pulsar-edgeless-root') which
 * requires the Lit `@consume` context to be injected, we access the
 * service directly from the editor's BlockStdScope DI container via
 * `editor.std.getService('pulsar:page')`.
 *
 * This works because:
 * 1. `editor.std` returns the BlockStdScope (created when the doc is set)
 * 2. The DI container lazily constructs services on first access
 * 3. EdgelessRootService is registered via the edgeless block specs
 * 4. The service constructor only needs the doc (for surface block) and
 *    the DI container (for GfxController), not the Lit component tree
 */

import type { PulsarEditorContainer } from '@pulsar/presets'

/** Minimal interface for the edgeless root service */
export interface EdgelessService {
  addElement: <T extends Record<string, unknown>>(type: string, props: T) => string
  tool: {
    setEdgelessTool: (tool: Record<string, unknown>) => void
    edgelessTool: { type: string }
  }
  viewport: {
    zoom: number
    setZoom: (zoom: number, center?: [number, number]) => void
    setViewport: (zoom: number, center: [number, number], smooth?: boolean) => void
    center: [number, number]
  }
  surface: {
    getElementById: (id: string) => unknown
    removeElement: (id: string) => void
  }
  generateIndex: (type: string) => string
}

/**
 * Get the EdgelessRootService from the editor's DI container.
 *
 * Returns null if the service can't be constructed (e.g. missing surface block).
 */
export function getEdgelessService(editor: PulsarEditorContainer): EdgelessService | null {
  try {
    const std = editor.std
    if (!std) return null
    const service = std.getService('pulsar:page')
    return service as unknown as EdgelessService
  } catch {
    return null
  }
}

/**
 * Get the viewport from the EdgelessRootService.
 *
 * The viewport is backed by the GfxController's Viewport instance,
 * available as soon as the BlockStdScope is constructed.
 */
export function getViewport(editor: PulsarEditorContainer): EdgelessService['viewport'] | null {
  const svc = getEdgelessService(editor)
  return svc?.viewport ?? null
}
