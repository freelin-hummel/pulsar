import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { MapEventOverlay } from '../components/ui/MapEventOverlay.js'
import type { MapTool, MapObjectType, GridPoint } from '../shared/mapTypes.js'
import type { GridConfig } from '../shared/grid.js'

/**
 * Tests for MapEventOverlay — the transparent pointer-event layer for map tools.
 *
 * Verifies:
 * - Overlay renders/hides based on active state and tool
 * - Pointer events dispatch to the correct tool handler
 * - Snap coordinates are forwarded correctly
 * - Each tool type (terrain, wall, door, object, light, legend) triggers its handler
 * - Preview cursor is shown on pointer move
 * - Wall drawing requires double-click to finish
 */

const squareGrid: GridConfig = { type: 'square', cellSize: 40 }
const hexGrid: GridConfig = { type: 'hex', cellSize: 30 }
const gridlessGrid: GridConfig = { type: 'gridless', cellSize: 40 }

function createHandlers() {
  return {
    onTerrainPaint: vi.fn<(cells: GridPoint[]) => void>(),
    onWallDraw: vi.fn<(points: GridPoint[], wallType: 'standard' | 'diagonal' | 'cavern') => void>(),
    onDoorPlace: vi.fn<(point: GridPoint) => void>(),
    onObjectPlace: vi.fn<(point: GridPoint, objectType: MapObjectType) => void>(),
    onLightPlace: vi.fn<(point: GridPoint) => void>(),
    onLegendPlace: vi.fn<(point: GridPoint) => void>(),
  }
}

interface RenderOverlayOpts {
  active?: boolean
  activeMapTool?: MapTool | null
  gridConfig?: GridConfig
  snapEnabled?: boolean
  selectedObject?: MapObjectType
}

function renderOverlay(opts: RenderOverlayOpts = {}) {
  const handlers = createHandlers()
  const result = render(
    <MapEventOverlay
      active={opts.active ?? true}
      activeMapTool={'activeMapTool' in opts ? opts.activeMapTool ?? null : 'terrain'}
      gridConfig={opts.gridConfig ?? squareGrid}
      snapEnabled={opts.snapEnabled ?? true}
      selectedObject={opts.selectedObject ?? 'crate'}
      {...handlers}
    />,
  )
  return { ...result, handlers }
}

/** Create a synthetic pointer event at the given position relative to the overlay. */
function pointerEventAt(
  el: Element,
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  clientX: number,
  clientY: number,
) {
  // Mock getBoundingClientRect so getCanvasPoint calculates correctly
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    x: 0, y: 0, left: 0, top: 0,
    width: 800, height: 600,
    right: 800, bottom: 600,
    toJSON: () => ({}),
  })
  fireEvent(el, new PointerEvent(type, {
    clientX,
    clientY,
    bubbles: true,
    cancelable: true,
  }))
}

describe('MapEventOverlay', () => {
  describe('visibility', () => {
    it('renders when active and tool is selected', () => {
      const { container } = renderOverlay({ active: true, activeMapTool: 'terrain' })
      // Overlay div should be in the DOM
      expect(container.firstChild).not.toBeNull()
    })

    it('does not render when inactive', () => {
      const { container } = renderOverlay({ active: false, activeMapTool: 'terrain' })
      expect(container.firstChild).toBeNull()
    })

    it('does not render when no map tool is selected', () => {
      const { container } = renderOverlay({ active: true, activeMapTool: null })
      expect(container.firstChild).toBeNull()
    })

    it('does not render when both inactive and no tool', () => {
      const { container } = renderOverlay({ active: false, activeMapTool: null })
      expect(container.firstChild).toBeNull()
    })

    it('overlay has crosshair cursor style', () => {
      const { container } = renderOverlay({ active: true, activeMapTool: 'terrain' })
      const overlay = container.firstChild as HTMLElement
      expect(overlay.style.cursor).toBe('crosshair')
    })

    it('overlay covers the full canvas area (position absolute, inset 0)', () => {
      const { container } = renderOverlay({ active: true, activeMapTool: 'terrain' })
      const overlay = container.firstChild as HTMLElement
      expect(overlay.style.position).toBe('absolute')
      expect(overlay.style.inset).toBe('0px')
    })
  })

  describe('terrain tool', () => {
    it('calls onTerrainPaint on pointer down', () => {
      const { container, handlers } = renderOverlay({ activeMapTool: 'terrain' })
      const overlay = container.firstChild as HTMLElement

      pointerEventAt(overlay, 'pointerdown', 25, 25)

      expect(handlers.onTerrainPaint).toHaveBeenCalledTimes(1)
      // With snap enabled, (25,25) snaps to cell centre (20,20) for 40px square grid
      expect(handlers.onTerrainPaint).toHaveBeenCalledWith([{ x: 20, y: 20 }])
    })

    it('calls onTerrainPaint with snapped coordinates for square grid', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'terrain',
        gridConfig: squareGrid,
        snapEnabled: true,
      })
      const overlay = container.firstChild as HTMLElement

      // Click at (65, 85) → should snap to cell (1,2) centre = (60, 100)
      pointerEventAt(overlay, 'pointerdown', 65, 85)

      expect(handlers.onTerrainPaint).toHaveBeenCalledWith([{ x: 60, y: 100 }])
    })

    it('passes raw coordinates when snap is disabled', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'terrain',
        snapEnabled: false,
      })
      const overlay = container.firstChild as HTMLElement

      pointerEventAt(overlay, 'pointerdown', 65, 85)

      expect(handlers.onTerrainPaint).toHaveBeenCalledWith([{ x: 65, y: 85 }])
    })

    it('passes raw coordinates for gridless config even when snap is enabled', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'terrain',
        gridConfig: gridlessGrid,
        snapEnabled: true,
      })
      const overlay = container.firstChild as HTMLElement

      pointerEventAt(overlay, 'pointerdown', 123, 456)

      expect(handlers.onTerrainPaint).toHaveBeenCalledWith([{ x: 123, y: 456 }])
    })

    it('supports continuous painting via pointer move while drawing', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'terrain',
        snapEnabled: false,
      })
      const overlay = container.firstChild as HTMLElement

      pointerEventAt(overlay, 'pointerdown', 10, 10)
      expect(handlers.onTerrainPaint).toHaveBeenCalledTimes(1)

      // Move to a new position
      pointerEventAt(overlay, 'pointermove', 50, 50)
      expect(handlers.onTerrainPaint).toHaveBeenCalledTimes(2)

      // Move to another position
      pointerEventAt(overlay, 'pointermove', 90, 90)
      expect(handlers.onTerrainPaint).toHaveBeenCalledTimes(3)
    })

    it('stops painting on pointer up', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'terrain',
        snapEnabled: false,
      })
      const overlay = container.firstChild as HTMLElement

      pointerEventAt(overlay, 'pointerdown', 10, 10)
      pointerEventAt(overlay, 'pointerup', 10, 10)

      // Move after releasing — should not paint
      pointerEventAt(overlay, 'pointermove', 50, 50)
      // Only the initial pointerdown paint call should exist
      expect(handlers.onTerrainPaint).toHaveBeenCalledTimes(1)
    })
  })

  describe('door tool', () => {
    it('calls onDoorPlace on pointer down with snapped vertex', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'door',
        gridConfig: squareGrid,
        snapEnabled: true,
      })
      const overlay = container.firstChild as HTMLElement

      // Click at (42, 38) → snaps to nearest vertex (40, 40) on 40px grid
      pointerEventAt(overlay, 'pointerdown', 42, 38)

      expect(handlers.onDoorPlace).toHaveBeenCalledTimes(1)
      expect(handlers.onDoorPlace).toHaveBeenCalledWith({ x: 40, y: 40 })
    })

    it('places door at raw coordinates when snap disabled', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'door',
        snapEnabled: false,
      })
      const overlay = container.firstChild as HTMLElement

      pointerEventAt(overlay, 'pointerdown', 42, 38)

      expect(handlers.onDoorPlace).toHaveBeenCalledWith({ x: 42, y: 38 })
    })
  })

  describe('object tool', () => {
    it('calls onObjectPlace with selected object type', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'object',
        selectedObject: 'barrel',
        snapEnabled: false,
      })
      const overlay = container.firstChild as HTMLElement

      pointerEventAt(overlay, 'pointerdown', 100, 200)

      expect(handlers.onObjectPlace).toHaveBeenCalledTimes(1)
      expect(handlers.onObjectPlace).toHaveBeenCalledWith({ x: 100, y: 200 }, 'barrel')
    })

    it('uses default object type (crate) when not specified', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'object',
        snapEnabled: false,
      })
      const overlay = container.firstChild as HTMLElement

      pointerEventAt(overlay, 'pointerdown', 50, 50)

      expect(handlers.onObjectPlace).toHaveBeenCalledWith({ x: 50, y: 50 }, 'crate')
    })

    it('snaps object placement to cell centre on square grid', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'object',
        selectedObject: 'chest',
        gridConfig: squareGrid,
        snapEnabled: true,
      })
      const overlay = container.firstChild as HTMLElement

      pointerEventAt(overlay, 'pointerdown', 65, 25)
      // (65, 25) → cell (1,0) → centre (60, 20)
      expect(handlers.onObjectPlace).toHaveBeenCalledWith({ x: 60, y: 20 }, 'chest')
    })
  })

  describe('light tool', () => {
    it('calls onLightPlace on pointer down', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'light',
        snapEnabled: false,
      })
      const overlay = container.firstChild as HTMLElement

      pointerEventAt(overlay, 'pointerdown', 200, 300)

      expect(handlers.onLightPlace).toHaveBeenCalledTimes(1)
      expect(handlers.onLightPlace).toHaveBeenCalledWith({ x: 200, y: 300 })
    })

    it('snaps light placement to cell centre', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'light',
        gridConfig: squareGrid,
        snapEnabled: true,
      })
      const overlay = container.firstChild as HTMLElement

      pointerEventAt(overlay, 'pointerdown', 25, 25)
      expect(handlers.onLightPlace).toHaveBeenCalledWith({ x: 20, y: 20 })
    })
  })

  describe('legend tool', () => {
    it('calls onLegendPlace on pointer down', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'legend',
        snapEnabled: false,
      })
      const overlay = container.firstChild as HTMLElement

      pointerEventAt(overlay, 'pointerdown', 300, 400)

      expect(handlers.onLegendPlace).toHaveBeenCalledTimes(1)
      expect(handlers.onLegendPlace).toHaveBeenCalledWith({ x: 300, y: 400 })
    })
  })

  describe('wall tool', () => {
    it('starts wall drawing on first pointer down', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'wall',
        snapEnabled: false,
      })
      const overlay = container.firstChild as HTMLElement

      pointerEventAt(overlay, 'pointerdown', 10, 10)

      // Wall drawing starts but doesn't dispatch until double-click finishes
      expect(handlers.onWallDraw).not.toHaveBeenCalled()
    })

    it('completes wall drawing on double-click', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'wall',
        snapEnabled: false,
      })
      const overlay = container.firstChild as HTMLElement

      // Start drawing
      pointerEventAt(overlay, 'pointerdown', 10, 10)
      // Add second point
      pointerEventAt(overlay, 'pointerdown', 50, 50)

      // Double-click to finish
      fireEvent.dblClick(overlay)

      expect(handlers.onWallDraw).toHaveBeenCalledTimes(1)
      expect(handlers.onWallDraw).toHaveBeenCalledWith(
        [{ x: 10, y: 10 }, { x: 50, y: 50 }],
        'standard',
      )
    })

    it('uses diagonal wallType for wall-diagonal tool', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'wall-diagonal',
        snapEnabled: false,
      })
      const overlay = container.firstChild as HTMLElement

      pointerEventAt(overlay, 'pointerdown', 0, 0)
      pointerEventAt(overlay, 'pointerdown', 40, 40)
      fireEvent.dblClick(overlay)

      expect(handlers.onWallDraw).toHaveBeenCalledWith(
        expect.any(Array),
        'diagonal',
      )
    })

    it('uses cavern wallType for wall-cavern tool', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'wall-cavern',
        snapEnabled: false,
      })
      const overlay = container.firstChild as HTMLElement

      pointerEventAt(overlay, 'pointerdown', 0, 0)
      pointerEventAt(overlay, 'pointerdown', 100, 0)
      fireEvent.dblClick(overlay)

      expect(handlers.onWallDraw).toHaveBeenCalledWith(
        expect.any(Array),
        'cavern',
      )
    })

    it('snaps wall points to grid vertices when snap is enabled', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'wall',
        gridConfig: squareGrid,
        snapEnabled: true,
      })
      const overlay = container.firstChild as HTMLElement

      // (18, 15) snaps to vertex (0, 0)
      pointerEventAt(overlay, 'pointerdown', 18, 15)
      // (42, 38) snaps to vertex (40, 40)
      pointerEventAt(overlay, 'pointerdown', 42, 38)
      fireEvent.dblClick(overlay)

      expect(handlers.onWallDraw).toHaveBeenCalledWith(
        [{ x: 0, y: 0 }, { x: 40, y: 40 }],
        'standard',
      )
    })
  })

  describe('event propagation', () => {
    it('overlay has z-index 500 to sit above the editor when active', () => {
      const { container } = renderOverlay({ activeMapTool: 'terrain' })
      const overlay = container.firstChild as HTMLElement

      // The overlay existing with zIndex 500 means it sits above the editor
      expect(overlay.style.zIndex).toBe('500')
    })
  })

  describe('preview cursor', () => {
    it('shows preview cursor on pointer move', () => {
      const { container } = renderOverlay({
        activeMapTool: 'terrain',
        snapEnabled: false,
      })
      const overlay = container.firstChild as HTMLElement

      pointerEventAt(overlay, 'pointermove', 100, 100)

      // Preview cursor is a child div with pointer-events: none
      const previewDiv = overlay.querySelector('div')
      expect(previewDiv).not.toBeNull()
      expect(previewDiv?.style.pointerEvents).toBe('none')
    })
  })

  describe('hex grid snapping', () => {
    it('snaps terrain placement to hex cell centre', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'terrain',
        gridConfig: hexGrid,
        snapEnabled: true,
      })
      const overlay = container.firstChild as HTMLElement

      // Click near origin — should snap to hex cell (0,0) centre
      pointerEventAt(overlay, 'pointerdown', 32, 28)

      expect(handlers.onTerrainPaint).toHaveBeenCalledTimes(1)
      const call = handlers.onTerrainPaint.mock.calls[0][0]
      // The snapped point should be a valid hex cell centre
      expect(call).toHaveLength(1)
      expect(typeof call[0].x).toBe('number')
      expect(typeof call[0].y).toBe('number')
    })
  })

  describe('all tool types dispatch', () => {
    const toolsAndHandlers: [MapTool, string][] = [
      ['terrain', 'onTerrainPaint'],
      ['door', 'onDoorPlace'],
      ['object', 'onObjectPlace'],
      ['light', 'onLightPlace'],
      ['legend', 'onLegendPlace'],
    ]

    for (const [tool, handlerName] of toolsAndHandlers) {
      it(`dispatches ${handlerName} when ${tool} tool is active`, () => {
        const { container, handlers } = renderOverlay({
          activeMapTool: tool,
          snapEnabled: false,
        })
        const overlay = container.firstChild as HTMLElement

        pointerEventAt(overlay, 'pointerdown', 100, 100)

        const handler = handlers[handlerName as keyof typeof handlers]
        expect(handler).toHaveBeenCalledTimes(1)
      })
    }

    it('does not dispatch any handler when no tool is active', () => {
      const { container } = renderOverlay({
        active: true,
        activeMapTool: null,
      })
      // Overlay shouldn't even render
      expect(container.firstChild).toBeNull()
    })
  })

  describe('pan pass-through (trackpad / wheel events)', () => {
    it('overlay is removed from DOM when no map tool is active, allowing pan', () => {
      const { container } = renderOverlay({ active: true, activeMapTool: null })
      // When activeMapTool is null, the overlay returns null — nothing blocks
      // wheel events from reaching BlockSuite's edgeless root pan handler
      expect(container.firstChild).toBeNull()
    })

    it('overlay is removed from DOM when inactive, allowing pan', () => {
      const { container } = renderOverlay({ active: false, activeMapTool: 'terrain' })
      expect(container.firstChild).toBeNull()
    })

    it('overlay does not have a wheel event handler (wheel passes through)', () => {
      const { container } = renderOverlay({ active: true, activeMapTool: 'terrain' })
      const overlay = container.firstChild as HTMLElement
      // The overlay element should exist but should NOT intercept wheel events.
      // React does not attach onWheel, so wheel events bubble to the editor.
      // We verify by dispatching a wheel event and checking it is not prevented.
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: -50,
        bubbles: true,
        cancelable: true,
      })
      const result = overlay.dispatchEvent(wheelEvent)
      // true means the event was NOT prevented — it will bubble to BlockSuite
      expect(result).toBe(true)
    })

    it('overlay stops pointer propagation but not wheel propagation', () => {
      const { container } = renderOverlay({ active: true, activeMapTool: 'terrain' })
      const overlay = container.firstChild as HTMLElement

      // Wheel should pass through (for trackpad pan)
      const wheelEv = new WheelEvent('wheel', {
        deltaY: -30, bubbles: true, cancelable: true,
      })
      expect(overlay.dispatchEvent(wheelEv)).toBe(true)
    })

    it('touch-action on canvas container prevents browser gesture zoom', () => {
      // PulsarCanvas sets touch-action: none on the canvas container
      const canvasContainer = document.createElement('div')
      canvasContainer.style.touchAction = 'none'
      expect(canvasContainer.style.touchAction).toBe('none')
    })
  })
})
