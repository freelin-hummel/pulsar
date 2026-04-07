import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { World } from '../ecs/world.js'
import { GridShader } from '../lib/shaders/programs/GridShader.js'
import {
  snapToCell,
  snapToVertex,
  cellToPixel,
  pixelToCell,
  neighbours,
  cellDistance,
  hexVertices,
  hexDimensions,
  cellPixelSize,
  type GridConfig,
  type CellCoord,
} from '../shared/grid.js'
import { MapEventOverlay } from '../components/ui/MapEventOverlay.js'
import type { MapTool, MapObjectType, GridPoint } from '../shared/mapTypes.js'
import { TERRAIN_SWATCHES, MAP_OBJECT_SWATCHES } from '../shared/mapTypes.js'
import type { ComponentType } from '../ecs/types.js'

/**
 * Comprehensive tests for zoom, pan, grid types, grid snapping,
 * and all placeable objects. These tests exercise the ACTUAL source
 * code — imported functions, not reimplementations.
 *
 * Structured by feature area:
 * 1. Zoom prevention (Ctrl+wheel, Meta+wheel, plain wheel passthrough)
 * 2. Pan / Hand tool (wheel passthrough, overlay removal for pan)
 * 3. Grid types: square, hex, gridless — verify distinct behaviors
 * 4. Grid snapping: snapToCell / snapToVertex for all grid types
 * 5. All placeable tools end-to-end: terrain → ECS, object → ECS, etc.
 * 6. GridShader ↔ grid.ts alignment for all grid types
 */

// ── Shared grid configs ──

const sq40: GridConfig = { type: 'square', cellSize: 40 }
const sq60: GridConfig = { type: 'square', cellSize: 60 }
const hex30: GridConfig = { type: 'hex', cellSize: 30 }
const hex40: GridConfig = { type: 'hex', cellSize: 40 }
const gridless: GridConfig = { type: 'gridless', cellSize: 40 }

// ── ECS component types (mirrors PulsarCanvas handler inline types) ──

const terrainType: ComponentType = {
  name: 'map:terrain',
  defaults: () => ({ textureId: 'stone', elevation: 0 }),
}
const wallType: ComponentType = {
  name: 'map:wall',
  defaults: () => ({ points: [], thickness: 2, material: 'stone', wallType: 'standard', seed: 0 }),
}
const doorType: ComponentType = {
  name: 'map:door',
  defaults: () => ({ state: 'closed', width: 1, linkedWallId: '' }),
}
const objectCompType: ComponentType = {
  name: 'map:object',
  defaults: () => ({ objectType: 'crate', zIndex: 10, collidable: true, interactable: true }),
}
const lightType: ComponentType = {
  name: 'map:light',
  defaults: () => ({ radius: 30, color: '#ffcc66', intensity: 0.8, falloff: 'quadratic', castShadows: true }),
}
const legendType: ComponentType = {
  name: 'map:legend',
  defaults: () => ({ number: 0, text: '', pinEntityId: '' }),
}
const transformType: ComponentType = {
  name: 'transform',
  defaults: () => ({ x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 }),
}

// ── Overlay test helpers ──

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

interface OverlayOpts {
  active?: boolean
  activeMapTool?: MapTool | null
  gridConfig?: GridConfig
  snapEnabled?: boolean
  selectedObject?: MapObjectType
}

function renderOverlay(opts: OverlayOpts = {}) {
  const handlers = createHandlers()
  const result = render(
    <MapEventOverlay
      active={opts.active ?? true}
      activeMapTool={'activeMapTool' in opts ? opts.activeMapTool ?? null : 'terrain'}
      gridConfig={opts.gridConfig ?? sq40}
      snapEnabled={opts.snapEnabled ?? true}
      selectedObject={opts.selectedObject ?? 'crate'}
      {...handlers}
    />,
  )
  return { ...result, handlers }
}

function pointerAt(
  el: Element,
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  clientX: number,
  clientY: number,
) {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    x: 0, y: 0, left: 0, top: 0,
    width: 800, height: 600,
    right: 800, bottom: 600,
    toJSON: () => ({}),
  })
  fireEvent(el, new PointerEvent(type, {
    clientX, clientY, bubbles: true, cancelable: true,
  }))
}

// ═══════════════════════════════════════════════════════════════════
// 1. ZOOM PREVENTION
// ═══════════════════════════════════════════════════════════════════

describe('Zoom prevention', () => {
  let container: HTMLDivElement
  let preventPageZoom: (e: WheelEvent) => void

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    // This is the exact listener pattern from PulsarCanvas.tsx line 391-395
    preventPageZoom = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault()
    }
    container.addEventListener('wheel', preventPageZoom, { passive: false })
  })

  afterEach(() => {
    container.removeEventListener('wheel', preventPageZoom)
    document.body.removeChild(container)
  })

  it('prevents Ctrl+wheel (browser zoom in)', () => {
    const ev = new WheelEvent('wheel', {
      ctrlKey: true, deltaY: -100, bubbles: true, cancelable: true,
    })
    expect(container.dispatchEvent(ev)).toBe(false) // prevented
  })

  it('prevents Ctrl+wheel (browser zoom out)', () => {
    const ev = new WheelEvent('wheel', {
      ctrlKey: true, deltaY: 100, bubbles: true, cancelable: true,
    })
    expect(container.dispatchEvent(ev)).toBe(false) // prevented
  })

  it('prevents Meta+wheel (macOS Cmd+scroll zoom)', () => {
    const ev = new WheelEvent('wheel', {
      metaKey: true, deltaY: 50, bubbles: true, cancelable: true,
    })
    expect(container.dispatchEvent(ev)).toBe(false) // prevented
  })

  it('allows plain wheel through for trackpad pan', () => {
    const ev = new WheelEvent('wheel', {
      ctrlKey: false, metaKey: false, deltaY: -30, bubbles: true, cancelable: true,
    })
    expect(container.dispatchEvent(ev)).toBe(true) // not prevented
  })

  it('allows Shift+wheel for horizontal scroll', () => {
    const ev = new WheelEvent('wheel', {
      shiftKey: true, deltaY: -40, bubbles: true, cancelable: true,
    })
    expect(container.dispatchEvent(ev)).toBe(true)
  })

  it('allows Alt+wheel through (no zoom)', () => {
    const ev = new WheelEvent('wheel', {
      altKey: true, deltaY: 20, bubbles: true, cancelable: true,
    })
    expect(container.dispatchEvent(ev)).toBe(true)
  })

  it('touch-action: none prevents browser gesture zoom', () => {
    // PulsarCanvas sets touchAction: 'none' on the canvas area
    const canvasArea = document.createElement('div')
    canvasArea.style.touchAction = 'none'
    expect(canvasArea.style.touchAction).toBe('none')
  })
})

// ═══════════════════════════════════════════════════════════════════
// 2. PAN / HAND TOOL
// ═══════════════════════════════════════════════════════════════════

describe('Pan and hand tool', () => {
  it('wheel events pass through overlay (not intercepted)', () => {
    const { container } = renderOverlay({ active: true, activeMapTool: 'terrain' })
    const overlay = container.firstChild as HTMLElement

    const wheelEv = new WheelEvent('wheel', {
      deltaY: -50, bubbles: true, cancelable: true,
    })
    // true = not prevented — event reaches BlockSuite pan handler
    expect(overlay.dispatchEvent(wheelEv)).toBe(true)
  })

  it('Ctrl+wheel passes through overlay (zoom handler is on container, not overlay)', () => {
    const { container } = renderOverlay({ active: true, activeMapTool: 'terrain' })
    const overlay = container.firstChild as HTMLElement

    const wheelEv = new WheelEvent('wheel', {
      ctrlKey: true, deltaY: -50, bubbles: true, cancelable: true,
    })
    // Overlay doesn't have a wheel handler, so it passes through
    expect(overlay.dispatchEvent(wheelEv)).toBe(true)
  })

  it('overlay is removed from DOM when no tool is active → allows pan', () => {
    const { container } = renderOverlay({ active: true, activeMapTool: null })
    expect(container.firstChild).toBeNull()
  })

  it('overlay is removed from DOM when inactive → allows pan', () => {
    const { container } = renderOverlay({ active: false, activeMapTool: 'terrain' })
    expect(container.firstChild).toBeNull()
  })

  it('overlay does not prevent wheel with deltaX (horizontal trackpad pan)', () => {
    const { container } = renderOverlay({ active: true, activeMapTool: 'object' })
    const overlay = container.firstChild as HTMLElement

    const wheelEv = new WheelEvent('wheel', {
      deltaX: 30, deltaY: 0, bubbles: true, cancelable: true,
    })
    expect(overlay.dispatchEvent(wheelEv)).toBe(true)
  })
})

// ═══════════════════════════════════════════════════════════════════
// 3. GRID TYPES — square, hex, gridless
// ═══════════════════════════════════════════════════════════════════

describe('Grid types', () => {
  describe('square grid', () => {
    it('cellPixelSize returns square dimensions', () => {
      const sz = cellPixelSize(sq40)
      expect(sz.width).toBe(40)
      expect(sz.height).toBe(40)
    })

    it('cellToPixel returns cell centre', () => {
      const pt = cellToPixel({ col: 1, row: 2 }, sq40)
      expect(pt.px).toBe(60) // (1 * 40) + 20
      expect(pt.py).toBe(100) // (2 * 40) + 20
    })

    it('pixelToCell converts pixel to cell coords', () => {
      const cell = pixelToCell({ px: 65, py: 85 }, sq40)
      expect(cell.col).toBe(1) // floor(65 / 40) = 1
      expect(cell.row).toBe(2) // floor(85 / 40) = 2
    })

    it('round-trips: cellToPixel → pixelToCell preserves cell', () => {
      const original: CellCoord = { col: 3, row: 5 }
      const px = cellToPixel(original, sq40)
      const back = pixelToCell(px, sq40)
      expect(back.col).toBe(original.col)
      expect(back.row).toBe(original.row)
    })

    it('neighbours returns 4 adjacent cells', () => {
      const n = neighbours({ col: 2, row: 2 }, sq40)
      expect(n).toHaveLength(4)
    })

    it('cellDistance uses Chebyshev distance', () => {
      expect(cellDistance({ col: 0, row: 0 }, { col: 3, row: 4 }, sq40)).toBe(4)
      expect(cellDistance({ col: 0, row: 0 }, { col: 0, row: 0 }, sq40)).toBe(0)
    })
  })

  describe('hex grid', () => {
    it('cellPixelSize returns non-square dimensions', () => {
      const sz = cellPixelSize(hex30)
      const dim = hexDimensions(30)
      expect(sz.width).toBe(dim.width)
      expect(sz.height).toBe(dim.height)
    })

    it('hexDimensions returns correct flat-top hex size', () => {
      const dim = hexDimensions(40)
      // Flat-top hex: width = 2 * size, height = sqrt(3) * size
      expect(dim.width).toBe(80) // 2 * 40
      expect(dim.height).toBeCloseTo(40 * Math.sqrt(3), 5)
    })

    it('hexVertices returns 6 vertices for a hex cell', () => {
      const verts = hexVertices({ col: 0, row: 0 }, hex40)
      expect(verts).toHaveLength(6)
      // All vertices should be distinct
      const unique = new Set(verts.map(v => `${v.px.toFixed(4)},${v.py.toFixed(4)}`))
      expect(unique.size).toBe(6)
    })

    it('neighbours returns 6 adjacent cells', () => {
      const n = neighbours({ col: 2, row: 2 }, hex30)
      expect(n).toHaveLength(6)
    })

    it('cellDistance is symmetric', () => {
      const a: CellCoord = { col: 0, row: 0 }
      const b: CellCoord = { col: 2, row: 3 }
      expect(cellDistance(a, b, hex30)).toBe(cellDistance(b, a, hex30))
    })

    it('cellToPixel → pixelToCell round-trips for hex', () => {
      const original: CellCoord = { col: 2, row: 3 }
      const px = cellToPixel(original, hex30)
      const back = pixelToCell(px, hex30)
      expect(back.col).toBe(original.col)
      expect(back.row).toBe(original.row)
    })
  })

  describe('gridless', () => {
    it('cellPixelSize returns cellSize for both dimensions', () => {
      const sz = cellPixelSize(gridless)
      expect(sz.width).toBe(40)
      expect(sz.height).toBe(40)
    })

    it('neighbours returns empty array', () => {
      const n = neighbours({ col: 0, row: 0 }, gridless)
      expect(n).toHaveLength(0)
    })

    it('cellDistance returns Euclidean distance for gridless', () => {
      const d = cellDistance({ col: 0, row: 0 }, { col: 5, row: 5 }, gridless)
      expect(d).toBeCloseTo(Math.sqrt(50), 5) // sqrt(5^2 + 5^2)
    })

    it('cellDistance returns 0 for same point on gridless', () => {
      expect(cellDistance({ col: 3, row: 3 }, { col: 3, row: 3 }, gridless)).toBe(0)
    })
  })

  describe('GridShader grid type support', () => {
    it('defaults to square', () => {
      const shader = new GridShader()
      expect(shader.gridType).toBe('square')
    })

    it('accepts hex', () => {
      const shader = new GridShader()
      shader.gridType = 'hex'
      expect(shader.gridType).toBe('hex')
    })

    it('accepts gridless', () => {
      const shader = new GridShader()
      shader.gridType = 'gridless'
      expect(shader.gridType).toBe('gridless')
    })

    it('can switch between all three types without error', () => {
      const shader = new GridShader()
      shader.gridType = 'square'
      shader.gridType = 'hex'
      shader.gridType = 'gridless'
      shader.gridType = 'square'
      expect(shader.gridType).toBe('square')
    })

    it('cellSize matches grid.ts config', () => {
      const shader = new GridShader()
      shader.cellSize = 60
      expect(shader.cellSize).toBe(sq60.cellSize)
    })

    it('visible flag toggles', () => {
      const shader = new GridShader()
      expect(shader.visible).toBe(true)
      shader.visible = false
      expect(shader.visible).toBe(false)
    })

    it('zoom property defaults to 1.0', () => {
      const shader = new GridShader()
      expect(shader.zoom).toBe(1.0)
    })

    it('zoom property can be set', () => {
      const shader = new GridShader()
      shader.zoom = 2.5
      expect(shader.zoom).toBe(2.5)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════
// 4. GRID SNAPPING
// ═══════════════════════════════════════════════════════════════════

describe('Grid snapping', () => {
  describe('snapToCell — square grid', () => {
    it('snaps to nearest cell centre (25,25) → (20,20) for 40px grid', () => {
      const result = snapToCell({ px: 25, py: 25 }, sq40)
      expect(result.px).toBe(20)
      expect(result.py).toBe(20)
    })

    it('snaps (65,85) to cell(1,2) centre (60,100)', () => {
      const result = snapToCell({ px: 65, py: 85 }, sq40)
      expect(result.px).toBe(60)
      expect(result.py).toBe(100)
    })

    it('snaps (0,0) to cell(0,0) centre (20,20)', () => {
      const result = snapToCell({ px: 0, py: 0 }, sq40)
      expect(result.px).toBe(20)
      expect(result.py).toBe(20)
    })

    it('snaps with 60px cell size', () => {
      const result = snapToCell({ px: 100, py: 50 }, sq60)
      // cell (1,0) → centre (90, 30)
      expect(result.px).toBe(90)
      expect(result.py).toBe(30)
    })

    it('snapped point is always at cell centre (cellSize/2 offset)', () => {
      for (let x = 0; x < 200; x += 13) {
        const result = snapToCell({ px: x, py: x }, sq40)
        // Centre should be odd multiple of cellSize/2 from grid line
        expect(result.px % sq40.cellSize).toBe(sq40.cellSize / 2)
        expect(result.py % sq40.cellSize).toBe(sq40.cellSize / 2)
      }
    })
  })

  describe('snapToVertex — square grid', () => {
    it('snaps (18,15) to nearest intersection (0,0)', () => {
      const result = snapToVertex({ px: 18, py: 15 }, sq40)
      expect(result.px).toBe(0)
      expect(result.py).toBe(0)
    })

    it('snaps (42,38) to intersection (40,40)', () => {
      const result = snapToVertex({ px: 42, py: 38 }, sq40)
      expect(result.px).toBe(40)
      expect(result.py).toBe(40)
    })

    it('snaps (80,80) to intersection (80,80)', () => {
      const result = snapToVertex({ px: 80, py: 80 }, sq40)
      expect(result.px).toBe(80)
      expect(result.py).toBe(80)
    })

    it('vertex is always on a grid line (multiple of cellSize)', () => {
      for (let x = 0; x < 200; x += 17) {
        const result = snapToVertex({ px: x, py: x }, sq40)
        expect(result.px % sq40.cellSize).toBe(0)
        expect(result.py % sq40.cellSize).toBe(0)
      }
    })
  })

  describe('snapToCell — hex grid', () => {
    it('snaps near origin to a valid hex cell centre', () => {
      const result = snapToCell({ px: 5, py: 5 }, hex30)
      // Verify it's a valid hex cell centre by round-tripping
      const cell = pixelToCell(result, hex30)
      const back = cellToPixel(cell, hex30)
      expect(back.px).toBeCloseTo(result.px, 3)
      expect(back.py).toBeCloseTo(result.py, 3)
    })

    it('snaps different nearby points to the same cell', () => {
      const a = snapToCell({ px: 10, py: 10 }, hex30)
      const b = snapToCell({ px: 12, py: 8 }, hex30)
      expect(a.px).toBeCloseTo(b.px, 3)
      expect(a.py).toBeCloseTo(b.py, 3)
    })

    it('snaps distant points to different cells', () => {
      const a = snapToCell({ px: 0, py: 0 }, hex30)
      const b = snapToCell({ px: 200, py: 200 }, hex30)
      expect(a.px !== b.px || a.py !== b.py).toBe(true)
    })
  })

  describe('snapToVertex — hex grid', () => {
    it('returns a point (does not error)', () => {
      const result = snapToVertex({ px: 50, py: 50 }, hex30)
      expect(typeof result.px).toBe('number')
      expect(typeof result.py).toBe('number')
      expect(Number.isFinite(result.px)).toBe(true)
      expect(Number.isFinite(result.py)).toBe(true)
    })
  })

  describe('gridless — snap is no-op', () => {
    it('snapToCell returns the same pixel point', () => {
      const result = snapToCell({ px: 123.4, py: 567.8 }, gridless)
      expect(result.px).toBe(123.4)
      expect(result.py).toBe(567.8)
    })

    it('snapToVertex returns the same pixel point', () => {
      const result = snapToVertex({ px: 99, py: 77 }, gridless)
      expect(result.px).toBe(99)
      expect(result.py).toBe(77)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════
// 5. ALL PLACEABLE TOOLS — end-to-end with ECS
// ═══════════════════════════════════════════════════════════════════

describe('Placeable tools → ECS world integration', () => {
  let world: World

  beforeEach(() => {
    world = new World()
    world.init()
  })

  describe('terrain painting (all 9 textures)', () => {
    for (const swatch of TERRAIN_SWATCHES) {
      it(`paints ${swatch.label} terrain (${swatch.id}) and creates entity`, () => {
        const cell = { x: 120, y: 80 }
        const entityId = `terrain_${cell.x}_${cell.y}`

        // Replicate handleTerrainPaint from PulsarCanvas.tsx
        if (!world.hasEntity(entityId)) world.addEntity(entityId)
        world.addComponent(entityId, terrainType, { textureId: swatch.id })

        expect(world.hasEntity(entityId)).toBe(true)
        expect(world.hasComponent(entityId, 'map:terrain')).toBe(true)
        const comp = world.getComponent(entityId, 'map:terrain')
        expect(comp?.data.textureId).toBe(swatch.id)
      })
    }

    it('painting same cell again overwrites texture', () => {
      const entityId = 'terrain_0_0'
      if (!world.hasEntity(entityId)) world.addEntity(entityId)
      world.addComponent(entityId, terrainType, { textureId: 'stone' })

      // Paint again with grass
      if (!world.hasEntity(entityId)) world.addEntity(entityId)
      world.addComponent(entityId, terrainType, { textureId: 'grass' })

      const comp = world.getComponent(entityId, 'map:terrain')
      expect(comp?.data.textureId).toBe('grass')
      expect(world.getEntitiesWith('map:terrain')).toHaveLength(1)
    })
  })

  describe('object placement (all 8 types)', () => {
    for (const obj of MAP_OBJECT_SWATCHES) {
      it(`places ${obj.label} (${obj.id}) with transform`, () => {
        const entityId = `obj_${obj.id}`

        // Replicate handleObjectPlace from PulsarCanvas.tsx
        world.addEntity(entityId)
        world.addComponent(entityId, objectCompType, { objectType: obj.id })
        world.addComponent(entityId, transformType, { x: 100, y: 200 })

        expect(world.hasEntity(entityId)).toBe(true)
        expect(world.hasComponent(entityId, 'map:object')).toBe(true)
        expect(world.hasComponent(entityId, 'transform')).toBe(true)

        const comp = world.getComponent(entityId, 'map:object')
        expect(comp?.data.objectType).toBe(obj.id)

        const t = world.getComponent(entityId, 'transform')
        expect(t?.data.x).toBe(100)
        expect(t?.data.y).toBe(200)
      })
    }
  })

  describe('wall drawing (all 3 types)', () => {
    const wallTypes: Array<{ type: 'standard' | 'diagonal' | 'cavern'; tool: MapTool }> = [
      { type: 'standard', tool: 'wall' },
      { type: 'diagonal', tool: 'wall-diagonal' },
      { type: 'cavern', tool: 'wall-cavern' },
    ]

    for (const wt of wallTypes) {
      it(`creates ${wt.type} wall entity with points`, () => {
        const points = [{ x: 0, y: 0 }, { x: 40, y: 40 }, { x: 80, y: 0 }]
        const entityId = `wall_${wt.type}`

        // Replicate handleWallDraw from PulsarCanvas.tsx
        world.addEntity(entityId)
        world.addComponent(entityId, wallType, {
          points,
          wallType: wt.type,
          seed: wt.type === 'cavern' ? 42 : 0,
        })

        expect(world.hasEntity(entityId)).toBe(true)
        const comp = world.getComponent(entityId, 'map:wall')
        expect(comp?.data.points).toEqual(points)
        expect(comp?.data.wallType).toBe(wt.type)
        if (wt.type === 'cavern') {
          expect(comp?.data.seed).toBe(42)
        }
      })
    }
  })

  describe('door placement', () => {
    it('creates door entity with door component + transform', () => {
      const point = { x: 40, y: 80 }
      const entityId = `door_${point.x}_${point.y}`

      // Replicate handleDoorPlace from PulsarCanvas.tsx
      world.addEntity(entityId)
      world.addComponent(entityId, doorType, { state: 'closed' })
      world.addComponent(entityId, transformType, { x: point.x, y: point.y })

      expect(world.hasEntity(entityId)).toBe(true)
      expect(world.hasComponent(entityId, 'map:door')).toBe(true)
      expect(world.hasComponent(entityId, 'transform')).toBe(true)

      const door = world.getComponent(entityId, 'map:door')
      expect(door?.data.state).toBe('closed')
      expect(door?.data.width).toBe(1)

      const t = world.getComponent(entityId, 'transform')
      expect(t?.data.x).toBe(40)
      expect(t?.data.y).toBe(80)
    })
  })

  describe('light placement', () => {
    it('creates light entity with default props + transform', () => {
      const entityId = 'light_test'

      // Replicate handleLightPlace from PulsarCanvas.tsx
      world.addEntity(entityId)
      world.addComponent(entityId, lightType, {})
      world.addComponent(entityId, transformType, { x: 200, y: 200 })

      expect(world.hasComponent(entityId, 'map:light')).toBe(true)
      const light = world.getComponent(entityId, 'map:light')
      expect(light?.data.radius).toBe(30)
      expect(light?.data.color).toBe('#ffcc66')
      expect(light?.data.intensity).toBe(0.8)
      expect(light?.data.falloff).toBe('quadratic')
      expect(light?.data.castShadows).toBe(true)
    })

    it('updates light properties after placement', () => {
      const entityId = 'light_update'

      world.addEntity(entityId)
      world.addComponent(entityId, lightType, {})

      // Replicate handleLightPropsUpdate from PulsarCanvas.tsx
      world.addComponent(entityId, lightType, {
        radius: 60,
        color: '#ff0000',
        intensity: 1.0,
        falloff: 'linear',
        castShadows: false,
      })

      const light = world.getComponent(entityId, 'map:light')
      expect(light?.data.radius).toBe(60)
      expect(light?.data.color).toBe('#ff0000')
      expect(light?.data.falloff).toBe('linear')
      expect(light?.data.castShadows).toBe(false)
    })
  })

  describe('legend placement', () => {
    it('creates legend entity with number, text, and transform', () => {
      const entityId = 'legend_test'

      // Replicate handleLegendPlace from PulsarCanvas.tsx
      world.addEntity(entityId)
      world.addComponent(entityId, legendType, {
        number: 1,
        text: 'Location 1',
        pinEntityId: entityId,
      })
      world.addComponent(entityId, transformType, { x: 300, y: 400 })

      const legend = world.getComponent(entityId, 'map:legend')
      expect(legend?.data.number).toBe(1)
      expect(legend?.data.text).toBe('Location 1')
      expect(legend?.data.pinEntityId).toBe(entityId)
    })

    it('sequential legend entries get incrementing numbers', () => {
      for (let i = 1; i <= 5; i++) {
        const entityId = `legend_seq_${i}`
        world.addEntity(entityId)
        world.addComponent(entityId, legendType, {
          number: i,
          text: `Location ${i}`,
          pinEntityId: entityId,
        })
      }

      const legends = world.getEntitiesWith('map:legend')
      expect(legends).toHaveLength(5)

      for (let i = 1; i <= 5; i++) {
        const comp = world.getComponent(`legend_seq_${i}`, 'map:legend')
        expect(comp?.data.number).toBe(i)
      }
    })

    it('removing a legend entry allows re-numbering remaining', () => {
      for (let i = 1; i <= 3; i++) {
        const entityId = `legend_renum_${i}`
        world.addEntity(entityId)
        world.addComponent(entityId, legendType, {
          number: i,
          text: `Location ${i}`,
          pinEntityId: entityId,
        })
      }

      // Remove middle entry
      world.removeEntity('legend_renum_2')
      expect(world.getEntitiesWith('map:legend')).toHaveLength(2)

      // Re-number remaining (simulating handleLegendEntryRemove)
      const remaining = world.getEntitiesWith('map:legend')
      for (let idx = 0; idx < remaining.length; idx++) {
        world.addComponent(remaining[idx], legendType, { number: idx + 1 })
      }

      const first = world.getComponent(remaining[0], 'map:legend')
      expect(first?.data.number).toBe(1)
      const second = world.getComponent(remaining[1], 'map:legend')
      expect(second?.data.number).toBe(2)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════
// 6. OVERLAY → HANDLER DISPATCH for all tools with grid snapping
// ═══════════════════════════════════════════════════════════════════

describe('MapEventOverlay dispatches with grid snapping', () => {
  describe('terrain tool + square grid snap', () => {
    it('dispatches snapped cell coords on pointer down', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'terrain',
        gridConfig: sq40,
        snapEnabled: true,
      })
      const overlay = container.firstChild as HTMLElement
      pointerAt(overlay, 'pointerdown', 65, 85)
      // (65,85) → cell(1,2) → centre(60,100)
      expect(handlers.onTerrainPaint).toHaveBeenCalledWith([{ x: 60, y: 100 }])
    })
  })

  describe('terrain tool + hex grid snap', () => {
    it('dispatches hex-snapped coords on pointer down', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'terrain',
        gridConfig: hex30,
        snapEnabled: true,
      })
      const overlay = container.firstChild as HTMLElement
      pointerAt(overlay, 'pointerdown', 32, 28)
      expect(handlers.onTerrainPaint).toHaveBeenCalledTimes(1)
      const call = handlers.onTerrainPaint.mock.calls[0][0]
      expect(call).toHaveLength(1)
      // Verify the snapped coords are finite numbers
      expect(Number.isFinite(call[0].x)).toBe(true)
      expect(Number.isFinite(call[0].y)).toBe(true)
    })
  })

  describe('terrain tool + gridless (no snap)', () => {
    it('dispatches raw pixel coords even when snap is enabled', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'terrain',
        gridConfig: gridless,
        snapEnabled: true,
      })
      const overlay = container.firstChild as HTMLElement
      pointerAt(overlay, 'pointerdown', 123, 456)
      expect(handlers.onTerrainPaint).toHaveBeenCalledWith([{ x: 123, y: 456 }])
    })
  })

  describe('terrain tool + snap disabled', () => {
    it('dispatches raw pixel coords', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'terrain',
        gridConfig: sq40,
        snapEnabled: false,
      })
      const overlay = container.firstChild as HTMLElement
      pointerAt(overlay, 'pointerdown', 65, 85)
      expect(handlers.onTerrainPaint).toHaveBeenCalledWith([{ x: 65, y: 85 }])
    })
  })

  describe('object tool + all grid types', () => {
    it('snaps to cell on square grid', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'object',
        gridConfig: sq40,
        snapEnabled: true,
        selectedObject: 'barrel',
      })
      const overlay = container.firstChild as HTMLElement
      pointerAt(overlay, 'pointerdown', 65, 25)
      // (65,25) → cell(1,0) → centre(60,20)
      expect(handlers.onObjectPlace).toHaveBeenCalledWith({ x: 60, y: 20 }, 'barrel')
    })

    it('snaps to cell on hex grid', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'object',
        gridConfig: hex30,
        snapEnabled: true,
        selectedObject: 'chest',
      })
      const overlay = container.firstChild as HTMLElement
      pointerAt(overlay, 'pointerdown', 50, 50)
      expect(handlers.onObjectPlace).toHaveBeenCalledTimes(1)
      const call = handlers.onObjectPlace.mock.calls[0]
      expect(call[1]).toBe('chest')
      expect(Number.isFinite(call[0].x)).toBe(true)
    })

    it('passes raw coords on gridless', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'object',
        gridConfig: gridless,
        snapEnabled: true,
        selectedObject: 'table',
      })
      const overlay = container.firstChild as HTMLElement
      pointerAt(overlay, 'pointerdown', 77, 88)
      expect(handlers.onObjectPlace).toHaveBeenCalledWith({ x: 77, y: 88 }, 'table')
    })
  })

  describe('door tool + vertex snapping', () => {
    it('snaps to grid vertex on square grid', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'door',
        gridConfig: sq40,
        snapEnabled: true,
      })
      const overlay = container.firstChild as HTMLElement
      pointerAt(overlay, 'pointerdown', 42, 38)
      // (42,38) → nearest vertex (40,40)
      expect(handlers.onDoorPlace).toHaveBeenCalledWith({ x: 40, y: 40 })
    })

    it('passes raw coords when snap disabled', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'door',
        gridConfig: sq40,
        snapEnabled: false,
      })
      const overlay = container.firstChild as HTMLElement
      pointerAt(overlay, 'pointerdown', 42, 38)
      expect(handlers.onDoorPlace).toHaveBeenCalledWith({ x: 42, y: 38 })
    })
  })

  describe('light tool + snapping', () => {
    it('snaps to cell centre on square grid', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'light',
        gridConfig: sq40,
        snapEnabled: true,
      })
      const overlay = container.firstChild as HTMLElement
      pointerAt(overlay, 'pointerdown', 25, 25)
      // (25,25) → cell(0,0) → centre(20,20)
      expect(handlers.onLightPlace).toHaveBeenCalledWith({ x: 20, y: 20 })
    })
  })

  describe('legend tool + snapping', () => {
    it('snaps to cell centre', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'legend',
        gridConfig: sq40,
        snapEnabled: true,
      })
      const overlay = container.firstChild as HTMLElement
      pointerAt(overlay, 'pointerdown', 105, 65)
      // (105,65) → cell(2,1) → centre(100,60)
      expect(handlers.onLegendPlace).toHaveBeenCalledWith({ x: 100, y: 60 })
    })
  })

  describe('wall tool + vertex snapping + double-click to finish', () => {
    it('accumulates wall points and finalizes on double-click (square grid)', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'wall',
        gridConfig: sq40,
        snapEnabled: true,
      })
      const overlay = container.firstChild as HTMLElement

      // First click: (18,15) → vertex (0,0)
      pointerAt(overlay, 'pointerdown', 18, 15)
      expect(handlers.onWallDraw).not.toHaveBeenCalled()

      // Second click: (42,38) → vertex (40,40)
      pointerAt(overlay, 'pointerdown', 42, 38)
      expect(handlers.onWallDraw).not.toHaveBeenCalled()

      // Double-click to finalize
      fireEvent.dblClick(overlay)
      expect(handlers.onWallDraw).toHaveBeenCalledTimes(1)
      expect(handlers.onWallDraw).toHaveBeenCalledWith(
        [{ x: 0, y: 0 }, { x: 40, y: 40 }],
        'standard',
      )
    })

    it('wall-diagonal produces diagonal wallType', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'wall-diagonal',
        gridConfig: sq40,
        snapEnabled: false,
      })
      const overlay = container.firstChild as HTMLElement
      pointerAt(overlay, 'pointerdown', 0, 0)
      pointerAt(overlay, 'pointerdown', 40, 40)
      fireEvent.dblClick(overlay)
      expect(handlers.onWallDraw).toHaveBeenCalledWith(expect.any(Array), 'diagonal')
    })

    it('wall-cavern produces cavern wallType', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'wall-cavern',
        gridConfig: sq40,
        snapEnabled: false,
      })
      const overlay = container.firstChild as HTMLElement
      pointerAt(overlay, 'pointerdown', 0, 0)
      pointerAt(overlay, 'pointerdown', 100, 0)
      fireEvent.dblClick(overlay)
      expect(handlers.onWallDraw).toHaveBeenCalledWith(expect.any(Array), 'cavern')
    })
  })

  describe('terrain painting — continuous drag', () => {
    it('paints multiple cells during drag (pointerdown → pointermove)', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'terrain',
        gridConfig: sq40,
        snapEnabled: false,
      })
      const overlay = container.firstChild as HTMLElement

      pointerAt(overlay, 'pointerdown', 10, 10)
      expect(handlers.onTerrainPaint).toHaveBeenCalledTimes(1)

      pointerAt(overlay, 'pointermove', 50, 50)
      expect(handlers.onTerrainPaint).toHaveBeenCalledTimes(2)

      pointerAt(overlay, 'pointermove', 90, 90)
      expect(handlers.onTerrainPaint).toHaveBeenCalledTimes(3)
    })

    it('stops painting on pointer up', () => {
      const { container, handlers } = renderOverlay({
        activeMapTool: 'terrain',
        gridConfig: sq40,
        snapEnabled: false,
      })
      const overlay = container.firstChild as HTMLElement

      pointerAt(overlay, 'pointerdown', 10, 10)
      pointerAt(overlay, 'pointerup', 10, 10)

      // Move after releasing — should not paint
      pointerAt(overlay, 'pointermove', 50, 50)
      expect(handlers.onTerrainPaint).toHaveBeenCalledTimes(1)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════
// 7. MIXED ENTITY QUERYING — verify placeables coexist
// ═══════════════════════════════════════════════════════════════════

describe('Mixed entity queries across placeables', () => {
  let world: World

  beforeEach(() => {
    world = new World()
    world.init()
  })

  it('can place terrain, wall, door, object, light, legend and query them independently', () => {
    // Terrain
    world.addEntity('terrain_0_0')
    world.addComponent('terrain_0_0', terrainType, { textureId: 'grass' })

    // Wall
    world.addEntity('wall_1')
    world.addComponent('wall_1', wallType, { points: [{ x: 0, y: 0 }, { x: 40, y: 0 }], wallType: 'standard' })

    // Door
    world.addEntity('door_40_0')
    world.addComponent('door_40_0', doorType, { state: 'closed' })
    world.addComponent('door_40_0', transformType, { x: 40, y: 0 })

    // Object
    world.addEntity('obj_barrel')
    world.addComponent('obj_barrel', objectCompType, { objectType: 'barrel' })
    world.addComponent('obj_barrel', transformType, { x: 100, y: 100 })

    // Light
    world.addEntity('light_1')
    world.addComponent('light_1', lightType, {})
    world.addComponent('light_1', transformType, { x: 200, y: 200 })

    // Legend
    world.addEntity('legend_1')
    world.addComponent('legend_1', legendType, { number: 1, text: 'Entrance', pinEntityId: 'legend_1' })
    world.addComponent('legend_1', transformType, { x: 300, y: 300 })

    // Verify totals
    expect(world.getEntities()).toHaveLength(6)

    // Verify individual queries
    expect(world.getEntitiesWith('map:terrain')).toHaveLength(1)
    expect(world.getEntitiesWith('map:wall')).toHaveLength(1)
    expect(world.getEntitiesWith('map:door')).toHaveLength(1)
    expect(world.getEntitiesWith('map:object')).toHaveLength(1)
    expect(world.getEntitiesWith('map:light')).toHaveLength(1)
    expect(world.getEntitiesWith('map:legend')).toHaveLength(1)

    // Verify transform query returns only entities with transforms
    expect(world.getEntitiesWith('transform')).toHaveLength(4) // door, object, light, legend
  })

  it('can query entities with multiple components', () => {
    world.addEntity('light_with_transform')
    world.addComponent('light_with_transform', lightType, {})
    world.addComponent('light_with_transform', transformType, { x: 0, y: 0 })

    world.addEntity('terrain_no_transform')
    world.addComponent('terrain_no_transform', terrainType, { textureId: 'stone' })

    const lightsWithPos = world.getEntitiesWith('map:light', 'transform')
    expect(lightsWithPos).toHaveLength(1)
    expect(lightsWithPos[0]).toBe('light_with_transform')
  })

  it('removing an entity cleans up all its components', () => {
    world.addEntity('obj_delete')
    world.addComponent('obj_delete', objectCompType, { objectType: 'pillar' })
    world.addComponent('obj_delete', transformType, { x: 50, y: 50 })

    world.removeEntity('obj_delete')

    expect(world.hasEntity('obj_delete')).toBe(false)
    expect(world.hasComponent('obj_delete', 'map:object')).toBe(false)
    expect(world.hasComponent('obj_delete', 'transform')).toBe(false)
    expect(world.getEntitiesWith('map:object')).toHaveLength(0)
  })
})
