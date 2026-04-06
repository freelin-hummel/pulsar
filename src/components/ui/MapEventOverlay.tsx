import { useCallback, useRef, useState } from 'react'
import type { MapTool, TerrainTextureId, MapObjectType, GridPoint } from '../../shared/mapTypes.js'

/**
 * MapEventOverlay — Transparent pointer event layer for map editing tools.
 *
 * Sits between the BlockSuite canvas and the UI layer. Captures pointer events
 * when a map tool is active and translates screen coordinates to grid coordinates.
 * Dispatches tool-specific actions (paint terrain, draw wall, place object, etc.)
 */

interface MapEventOverlayProps {
  active: boolean
  activeMapTool: MapTool | null
  gridSize: number
  selectedTerrain: TerrainTextureId
  selectedObject: MapObjectType
  onTerrainPaint: (cells: GridPoint[]) => void
  onWallDraw: (points: GridPoint[], wallType: 'standard' | 'diagonal' | 'cavern') => void
  onDoorPlace: (point: GridPoint) => void
  onObjectPlace: (point: GridPoint, objectType: MapObjectType) => void
  onLightPlace: (point: GridPoint) => void
  onLegendPlace: (point: GridPoint) => void
}

/** Snap a screen coordinate to the nearest grid intersection */
function snapToGrid(x: number, y: number, gridSize: number): GridPoint {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
  }
}

/** Snap to the center of a grid cell */
function snapToCell(x: number, y: number, gridSize: number): GridPoint {
  return {
    x: Math.floor(x / gridSize) * gridSize + gridSize / 2,
    y: Math.floor(y / gridSize) * gridSize + gridSize / 2,
  }
}

export function MapEventOverlay({
  active,
  activeMapTool,
  gridSize,
  selectedTerrain: _selectedTerrain,
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
    (e: React.PointerEvent<HTMLDivElement>): GridPoint => {
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
          const cell = snapToCell(raw.x, raw.y, gridSize)
          drawnPoints.current = [cell]
          onTerrainPaint([cell])
          break
        }
        case 'wall':
        case 'wall-diagonal':
        case 'wall-cavern': {
          const pt = snapToGrid(raw.x, raw.y, gridSize)
          if (!isDrawing.current) {
            // Start a new wall
            isDrawing.current = true
            drawnPoints.current = [pt]
          } else {
            // Add point to current wall
            drawnPoints.current.push(pt)
          }
          break
        }
        case 'door': {
          const pt = snapToGrid(raw.x, raw.y, gridSize)
          onDoorPlace(pt)
          break
        }
        case 'object': {
          const pt = snapToCell(raw.x, raw.y, gridSize)
          onObjectPlace(pt, selectedObject)
          break
        }
        case 'light': {
          const pt = snapToCell(raw.x, raw.y, gridSize)
          onLightPlace(pt)
          break
        }
        case 'legend': {
          const pt = snapToCell(raw.x, raw.y, gridSize)
          onLegendPlace(pt)
          break
        }
      }
    },
    [
      activeMapTool,
      gridSize,
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
        setPreviewPoint(snapToCell(raw.x, raw.y, gridSize))
      } else {
        setPreviewPoint(snapToGrid(raw.x, raw.y, gridSize))
      }

      // Continue drawing for terrain
      if (activeMapTool === 'terrain' && isDrawing.current) {
        const cell = snapToCell(raw.x, raw.y, gridSize)
        const last = drawnPoints.current[drawnPoints.current.length - 1]
        if (!last || last.x !== cell.x || last.y !== cell.y) {
          drawnPoints.current.push(cell)
          onTerrainPaint([cell])
        }
      }
    },
    [activeMapTool, gridSize, getCanvasPoint, onTerrainPaint],
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
            left: previewPoint.x - gridSize / 2,
            top: previewPoint.y - gridSize / 2,
            width: gridSize,
            height: gridSize,
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
