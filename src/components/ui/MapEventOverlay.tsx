import { useCallback, useRef, useState } from 'react'
import type { MapTool, MapObjectType, GridPoint } from '../../shared/mapTypes.js'
import type { GridConfig } from '../../shared/grid.js'
import { snapToCell, snapToVertex, cellPixelSize } from '../../shared/grid.js'

/**
 * MapEventOverlay — Transparent pointer event layer for map editing tools.
 *
 * Sits between the BlockSuite canvas and the UI layer. Captures pointer events
 * when a map tool is active and translates screen coordinates to grid coordinates.
 * Dispatches tool-specific actions (paint terrain, draw wall, place object, etc.)
 *
 * Supports square, hex, and gridless grids via the shared grid coordinate library.
 */

interface MapEventOverlayProps {
  active: boolean
  activeMapTool: MapTool | null
  gridConfig: GridConfig
  snapEnabled: boolean
  selectedObject: MapObjectType
  onTerrainPaint: (cells: GridPoint[]) => void
  onWallDraw: (points: GridPoint[], wallType: 'standard' | 'diagonal' | 'cavern') => void
  onDoorPlace: (point: GridPoint) => void
  onObjectPlace: (point: GridPoint, objectType: MapObjectType) => void
  onLightPlace: (point: GridPoint) => void
  onLegendPlace: (point: GridPoint) => void
}

/** Convert a PixelPoint to the GridPoint format used by entity handlers. */
function toGridPoint(px: number, py: number): GridPoint {
  return { x: px, y: py }
}

/** Snap a raw pointer position for cell-based tools (terrain, object, light, legend). */
function snapCellTool(
  rawX: number,
  rawY: number,
  cfg: GridConfig,
  snap: boolean,
): GridPoint {
  if (!snap || cfg.type === 'gridless') return toGridPoint(rawX, rawY)
  const snapped = snapToCell({ px: rawX, py: rawY }, cfg)
  return toGridPoint(snapped.px, snapped.py)
}

/** Snap a raw pointer position for vertex-based tools (wall, door). */
function snapVertexTool(
  rawX: number,
  rawY: number,
  cfg: GridConfig,
  snap: boolean,
): GridPoint {
  if (!snap || cfg.type === 'gridless') return toGridPoint(rawX, rawY)
  const snapped = snapToVertex({ px: rawX, py: rawY }, cfg)
  return toGridPoint(snapped.px, snapped.py)
}

export function MapEventOverlay({
  active,
  activeMapTool,
  gridConfig,
  snapEnabled,
  selectedObject,
  onTerrainPaint,
  onWallDraw,
  onDoorPlace,
  onObjectPlace,
  onLightPlace,
  onLegendPlace,
}: MapEventOverlayProps) {
  const isDrawing = useRef(false)
  const drawnPoints = useRef<GridPoint[]>([])
  const [previewPoint, setPreviewPoint] = useState<GridPoint | null>(null)

  const getCanvasPoint = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): { x: number; y: number } => {
      const rect = e.currentTarget.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    },
    [],
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!activeMapTool) return
      e.stopPropagation()

      const raw = getCanvasPoint(e)

      switch (activeMapTool) {
        case 'terrain': {
          isDrawing.current = true
          const cell = snapCellTool(raw.x, raw.y, gridConfig, snapEnabled)
          drawnPoints.current = [cell]
          onTerrainPaint([cell])
          break
        }
        case 'wall':
        case 'wall-diagonal':
        case 'wall-cavern': {
          const pt = snapVertexTool(raw.x, raw.y, gridConfig, snapEnabled)
          if (!isDrawing.current) {
            isDrawing.current = true
            drawnPoints.current = [pt]
          } else {
            drawnPoints.current.push(pt)
          }
          break
        }
        case 'door': {
          const pt = snapVertexTool(raw.x, raw.y, gridConfig, snapEnabled)
          onDoorPlace(pt)
          break
        }
        case 'object': {
          const pt = snapCellTool(raw.x, raw.y, gridConfig, snapEnabled)
          onObjectPlace(pt, selectedObject)
          break
        }
        case 'light': {
          const pt = snapCellTool(raw.x, raw.y, gridConfig, snapEnabled)
          onLightPlace(pt)
          break
        }
        case 'legend': {
          const pt = snapCellTool(raw.x, raw.y, gridConfig, snapEnabled)
          onLegendPlace(pt)
          break
        }
      }
    },
    [
      activeMapTool,
      gridConfig,
      snapEnabled,
      selectedObject,
      getCanvasPoint,
      onTerrainPaint,
      onDoorPlace,
      onObjectPlace,
      onLightPlace,
      onLegendPlace,
    ],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!activeMapTool) return

      const raw = getCanvasPoint(e)

      // Show preview cursor
      if (activeMapTool === 'terrain' || activeMapTool === 'object' || activeMapTool === 'light' || activeMapTool === 'legend') {
        const snapped = snapCellTool(raw.x, raw.y, gridConfig, snapEnabled)
        setPreviewPoint(snapped)
      } else {
        const snapped = snapVertexTool(raw.x, raw.y, gridConfig, snapEnabled)
        setPreviewPoint(snapped)
      }

      // Continue drawing for terrain
      if (activeMapTool === 'terrain' && isDrawing.current) {
        const cell = snapCellTool(raw.x, raw.y, gridConfig, snapEnabled)
        const last = drawnPoints.current[drawnPoints.current.length - 1]
        if (!last || last.x !== cell.x || last.y !== cell.y) {
          drawnPoints.current.push(cell)
          onTerrainPaint([cell])
        }
      }
    },
    [activeMapTool, gridConfig, snapEnabled, getCanvasPoint, onTerrainPaint],
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!activeMapTool) return
      e.stopPropagation()

      if (activeMapTool === 'terrain') {
        isDrawing.current = false
        drawnPoints.current = []
      }
    },
    [activeMapTool],
  )

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!activeMapTool) return
      e.stopPropagation()

      // Finish wall drawing on double-click
      if (
        (activeMapTool === 'wall' || activeMapTool === 'wall-diagonal' || activeMapTool === 'wall-cavern') &&
        isDrawing.current
      ) {
        const wallType =
          activeMapTool === 'wall-diagonal'
            ? 'diagonal'
            : activeMapTool === 'wall-cavern'
              ? 'cavern'
              : 'standard'
        onWallDraw(drawnPoints.current, wallType)
        isDrawing.current = false
        drawnPoints.current = []
      }
    },
    [activeMapTool, onWallDraw],
  )

  if (!active || !activeMapTool) return null

  // Determine cursor preview size based on grid type
  const cursorSize = cellPixelSize(gridConfig)
  // For hex grids, use a square dimension (the larger axis) so border-radius: 50% makes a circle
  const cursorDim = gridConfig.type === 'hex'
    ? Math.max(cursorSize.width, cursorSize.height)
    : 0 // unused for non-hex

  return (
    <div
      style={styles.overlay}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDoubleClick}
    >
      {/* Preview cursor indicator */}
      {previewPoint && (
        <div
          style={{
            ...styles.cursor,
            left: gridConfig.type === 'hex'
              ? previewPoint.x - cursorDim / 2
              : previewPoint.x - cursorSize.width / 2,
            top: gridConfig.type === 'hex'
              ? previewPoint.y - cursorDim / 2
              : previewPoint.y - cursorSize.height / 2,
            width: gridConfig.type === 'hex' ? cursorDim : cursorSize.width,
            height: gridConfig.type === 'hex' ? cursorDim : cursorSize.height,
            borderRadius: gridConfig.type === 'hex' ? '50%' : 'var(--radius-sm)',
          }}
        />
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 500,
    cursor: 'crosshair',
  },
  cursor: {
    position: 'absolute',
    border: '2px solid var(--color-accent)',
    borderRadius: 'var(--radius-sm)',
    pointerEvents: 'none',
    opacity: 0.4,
  },
}
