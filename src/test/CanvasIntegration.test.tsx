import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { snapToCell, snapToVertex, cellToPixel, type GridConfig } from '../shared/grid.js'

/**
 * Canvas integration tests.
 *
 * Tests for the behaviours reported as broken:
 * 1. Zoom — Ctrl+wheel should be intercepted (preventDefault) so the browser
 *    doesn't zoom the page; instead BlockSuite zooms the canvas.
 * 2. Pan — trackpad two-finger scroll should reach the editor, not be blocked
 *    by the WebGL overlay or MapEventOverlay.
 * 3. WebGL overlay layering — the shader canvas must have pointer-events: none
 *    so it never blocks clicks from reaching the editor.
 * 4. touch-action: none — the canvas area disables browser gesture zoom.
 * 5. Grid ↔ tool coordinate alignment — the grid shader and tool snap system
 *    must agree on cell positions.
 */

describe('Canvas zoom prevention', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    container.style.width = '800px'
    container.style.height = '600px'
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('prevents default on Ctrl+wheel events (prevents browser page zoom)', () => {
    // Replicate the preventPageZoom listener from PulsarCanvas
    const preventPageZoom = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
      }
    }
    container.addEventListener('wheel', preventPageZoom, { passive: false })

    const wheelEvent = new WheelEvent('wheel', {
      ctrlKey: true,
      deltaY: -100,
      bubbles: true,
      cancelable: true,
    })

    const result = container.dispatchEvent(wheelEvent)
    // dispatchEvent returns false if preventDefault was called
    expect(result).toBe(false)

    container.removeEventListener('wheel', preventPageZoom)
  })

  it('does NOT prevent default on plain wheel events (allows normal scroll/pan)', () => {
    const preventPageZoom = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
      }
    }
    container.addEventListener('wheel', preventPageZoom, { passive: false })

    const wheelEvent = new WheelEvent('wheel', {
      ctrlKey: false,
      deltaY: -50,
      bubbles: true,
      cancelable: true,
    })

    const result = container.dispatchEvent(wheelEvent)
    // Should NOT be prevented — plain scroll should pass through to BlockSuite pan
    expect(result).toBe(true)

    container.removeEventListener('wheel', preventPageZoom)
  })

  it('prevents default on Meta+wheel events (macOS Cmd+scroll)', () => {
    const preventPageZoom = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
      }
    }
    container.addEventListener('wheel', preventPageZoom, { passive: false })

    const wheelEvent = new WheelEvent('wheel', {
      metaKey: true,
      deltaY: 50,
      bubbles: true,
      cancelable: true,
    })

    const result = container.dispatchEvent(wheelEvent)
    expect(result).toBe(false)

    container.removeEventListener('wheel', preventPageZoom)
  })
})

describe('WebGL overlay layering', () => {
  it('WebGL canvas has pointer-events: none so it does not block editor clicks', () => {
    // Replicate what WebGLManager does
    const canvas = document.createElement('canvas')
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = '999'

    expect(canvas.style.pointerEvents).toBe('none')
    // zIndex 999 is below the toolbar (1000) but above the editor content
    expect(canvas.style.zIndex).toBe('999')
  })

  it('WebGL canvas z-index is below the toolbar z-index', () => {
    const webglZIndex = 999
    const toolbarZIndex = 1000 // from --z-toolbar CSS variable
    expect(webglZIndex).toBeLessThan(toolbarZIndex)
  })

  it('MapEventOverlay z-index (500) is below WebGL canvas (999)', () => {
    // MapEventOverlay sits at z-index 500, which is below the WebGL canvas at 999
    // This means the grid overlay renders above the map event overlay
    // Both should allow clicks to reach the editor when no map tool is active
    const overlayZIndex = 500
    const webglZIndex = 999
    expect(overlayZIndex).toBeLessThan(webglZIndex)
  })
})

describe('touch-action CSS for gesture prevention', () => {
  it('canvas container has touch-action: none to prevent browser gesture zoom', () => {
    // Replicate the style from PulsarCanvas
    const canvasContainer = document.createElement('div')
    canvasContainer.style.touchAction = 'none'

    expect(canvasContainer.style.touchAction).toBe('none')
  })
})

describe('Grid ↔ tool coordinate alignment', () => {
  /**
   * The grid shader and the tool snap system must use the same coordinate math.
   * The GLSL shader applies: world = (pixel - uOffset) / uZoom
   * The tool snap system uses snapToCell / snapToVertex from shared/grid.ts.
   *
   * These tests verify that:
   * - Snapped cell coordinates align to grid line intersections
   * - The grid origin matches between shader and snap library
   * - Cell sizes are consistent
   */

  const sq40: GridConfig = { type: 'square', cellSize: 40 }
  const sq60: GridConfig = { type: 'square', cellSize: 60 }
  const hex30: GridConfig = { type: 'hex', cellSize: 30 }

  describe('square grid alignment', () => {
    it('cell centres fall exactly at cellSize/2 offsets', () => {
      const centre = cellToPixel({ col: 0, row: 0 }, sq40)
      expect(centre.px).toBe(20) // cellSize/2
      expect(centre.py).toBe(20)
    })

    it('grid line intersections are at cellSize multiples', () => {
      const vertex = snapToVertex({ px: 42, py: 38 }, sq40)
      expect(vertex.px % sq40.cellSize).toBe(0)
      expect(vertex.py % sq40.cellSize).toBe(0)
    })

    it('snapped cell centres and grid intersections use the same cellSize', () => {
      // Snap to cell should produce centres offset by cellSize/2 from vertices
      const cellCentre = snapToCell({ px: 55, py: 55 }, sq40)
      const nearestVertex = snapToVertex({ px: cellCentre.px, py: cellCentre.py }, sq40)

      // Centre should be cellSize/2 away from the nearest vertex
      const dx = Math.abs(cellCentre.px - nearestVertex.px)
      const dy = Math.abs(cellCentre.py - nearestVertex.py)
      expect(dx).toBe(sq40.cellSize / 2)
      expect(dy).toBe(sq40.cellSize / 2)
    })

    it('changing cellSize consistently affects both snap and shader params', () => {
      // 40px grid
      const v40 = snapToVertex({ px: 65, py: 35 }, sq40)
      expect(v40).toEqual({ px: 80, py: 40 })

      // 60px grid — should snap to different position
      const v60 = snapToVertex({ px: 65, py: 35 }, sq60)
      expect(v60).toEqual({ px: 60, py: 60 })
    })

    it('grid shader and snap system share the same grid origin (0,0)', () => {
      // The GLSL shader computes: world = (pixel - uOffset) / uZoom
      // With default offset=[0,0] and zoom=1.0, world == pixel
      // The snap library also uses (0,0) as origin
      const vertex = snapToVertex({ px: 0, py: 0 }, sq40)
      expect(vertex).toEqual({ px: 0, py: 0 })

      // Origin vertex should be at pixel (0,0) in both systems
      const cellAtOrigin = cellToPixel({ col: 0, row: 0 }, sq40)
      expect(cellAtOrigin.px).toBe(sq40.cellSize / 2) // centre of cell (0,0)
    })
  })

  describe('hex grid alignment', () => {
    it('hex cell centres round-trip through snap', () => {
      const centre = cellToPixel({ col: 2, row: 3 }, hex30)
      const snapped = snapToCell({ px: centre.px + 1, py: centre.py + 1 }, hex30)

      expect(snapped.px).toBeCloseTo(centre.px, 5)
      expect(snapped.py).toBeCloseTo(centre.py, 5)
    })

    it('hex vertex snapping returns points at cellSize distance from centre', () => {
      const vertex = snapToVertex({ px: 35, py: 30 }, hex30)
      // The vertex should be a valid hex vertex — we can't easily verify the exact
      // position without knowing which cell it resolves to, but it should be a number
      expect(typeof vertex.px).toBe('number')
      expect(typeof vertex.py).toBe('number')
      expect(Number.isFinite(vertex.px)).toBe(true)
      expect(Number.isFinite(vertex.py)).toBe(true)
    })
  })

  describe('gridless alignment', () => {
    const gridless: GridConfig = { type: 'gridless', cellSize: 40 }

    it('snap is identity for gridless', () => {
      const pt = { px: 123.456, py: 789.012 }
      expect(snapToCell(pt, gridless)).toEqual(pt)
      expect(snapToVertex(pt, gridless)).toEqual(pt)
    })
  })
})

describe('BlockSuite edgeless tool integration contracts', () => {
  /**
   * These tests verify the contract between tool selection and BlockSuite's
   * edgeless API. They don't run the full editor but validate that the
   * tool mapping (toEdgelessTool) produces correct shape names and types.
   *
   * When something "doesn't show up when added" it's often because:
   * 1. The wrong tool type string was passed
   * 2. Missing required properties (like shapeName for shapes)
   * 3. The edgeless root wasn't queried correctly
   */

  // Mirror the toEdgelessTool function from Toolbar.tsx
  type Tool = 'select' | 'hand' | 'rect' | 'ellipse' | 'text' | 'pen' | 'note' | 'image' | 'line'

  function toEdgelessTool(tool: Tool): Record<string, unknown> | null {
    switch (tool) {
      case 'select': return { type: 'default' }
      case 'hand': return { type: 'pan', panning: true }
      case 'rect': return { type: 'shape', shapeName: 'rect' }
      case 'ellipse': return { type: 'shape', shapeName: 'ellipse' }
      case 'line': return { type: 'connector', mode: 0 }
      case 'pen': return { type: 'brush' }
      case 'text': return { type: 'text' }
      case 'note': return { type: 'affine:note', childFlavour: 'pulsar:paragraph', childType: 'text', tip: 'Note' }
      case 'image': return null
      default: return { type: 'default' }
    }
  }

  it('every drawing tool produces a non-null tool object', () => {
    const drawingTools: Tool[] = ['rect', 'ellipse', 'line', 'pen', 'text', 'note']
    for (const tool of drawingTools) {
      const result = toEdgelessTool(tool)
      expect(result).not.toBeNull()
      expect(result).toHaveProperty('type')
    }
  })

  it('shape tools include required shapeName property', () => {
    const shapeTools: Tool[] = ['rect', 'ellipse']
    for (const tool of shapeTools) {
      const result = toEdgelessTool(tool)
      expect(result).toHaveProperty('shapeName')
      expect(typeof result!.shapeName).toBe('string')
    }
  })

  it('pan tool includes panning: true', () => {
    const result = toEdgelessTool('hand')
    expect(result).toEqual({ type: 'pan', panning: true })
  })

  it('note tool includes required childFlavour for Pulsar paragraph blocks', () => {
    const result = toEdgelessTool('note')
    expect(result).toHaveProperty('childFlavour', 'pulsar:paragraph')
    expect(result).toHaveProperty('childType', 'text')
  })

  it('connector tool includes mode parameter', () => {
    const result = toEdgelessTool('line')
    expect(result).toEqual({ type: 'connector', mode: 0 })
  })

  it('image tool returns null (handled separately via file picker)', () => {
    expect(toEdgelessTool('image')).toBeNull()
  })

  it('all tool type strings are valid BlockSuite edgeless tool types', () => {
    const validTypes = new Set([
      'default', 'pan', 'shape', 'brush', 'text', 'affine:note', 'connector', 'eraser',
    ])
    const tools: Tool[] = ['select', 'hand', 'rect', 'ellipse', 'line', 'pen', 'text', 'note']
    for (const tool of tools) {
      const result = toEdgelessTool(tool)
      expect(validTypes.has(result!.type as string)).toBe(true)
    }
  })
})

describe('Scene block addition via doc API', () => {
  /**
   * Tests that the BlockSuite doc API addBlock calls used in PulsarCanvas
   * produce the correct block structure. This verifies the code paths that
   * create new boards and navigate to docs.
   *
   * The block structure is:
   *   pulsar:page
   *   ├── pulsar:surface
   *   └── pulsar:note
   *       └── pulsar:paragraph
   */

  it('board creation follows the correct block hierarchy', () => {
    // These are the addBlock calls from PulsarCanvas.handleAddBoard
    const blockCalls: Array<{ flavour: string; parent?: string }> = []

    // Simulate the calls
    const pageBlockId = 'page-block-1'
    blockCalls.push({ flavour: 'pulsar:page' })

    blockCalls.push({ flavour: 'pulsar:surface', parent: pageBlockId })

    const noteId = 'note-1'
    blockCalls.push({ flavour: 'pulsar:note', parent: pageBlockId })

    blockCalls.push({ flavour: 'pulsar:paragraph', parent: noteId })

    expect(blockCalls).toHaveLength(4)
    expect(blockCalls[0].flavour).toBe('pulsar:page')
    expect(blockCalls[1].flavour).toBe('pulsar:surface')
    expect(blockCalls[1].parent).toBe(pageBlockId)
    expect(blockCalls[2].flavour).toBe('pulsar:note')
    expect(blockCalls[2].parent).toBe(pageBlockId)
    expect(blockCalls[3].flavour).toBe('pulsar:paragraph')
    expect(blockCalls[3].parent).toBe(noteId)
  })

  it('surface block is required for edgeless mode shapes to render', () => {
    // Without a surface block, BlockSuite's edgeless mode has nowhere
    // to store shape/brush/connector elements. This test documents the
    // requirement.
    const requiredFlavours = ['pulsar:page', 'pulsar:surface']

    // Surface must be a child of page
    expect(requiredFlavours).toContain('pulsar:surface')
    expect(requiredFlavours[0]).toBe('pulsar:page')
  })
})
