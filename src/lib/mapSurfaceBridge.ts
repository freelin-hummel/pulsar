/**
 * mapSurfaceBridge — Bridges map tool actions to BlockSuite surface elements.
 *
 * When map tools (terrain, wall, door, object, light, legend) are used,
 * this module creates BlockSuite surface elements (shapes, lines, text)
 * that are rendered on the edgeless canvas. This makes placeables visible.
 *
 * Elements are created via the EdgelessRootService accessed through the
 * editor's BlockStdScope DI container (`editor.std`), bypassing the Lit
 * component tree entirely.
 */

import type { PulsarEditorContainer } from '@pulsar/presets'
import { getEdgelessService } from '../editor/edgelessService.js'
import type { GridPoint } from '../shared/mapTypes.js'
import type { TerrainTextureId, MapObjectType } from '../shared/mapTypes.js'

/** Terrain texture → fill color mapping */
const TERRAIN_COLORS: Record<TerrainTextureId, string> = {
  stone: '#6b7280',
  dirt: '#92702a',
  grass: '#4a7c3f',
  water: '#2563eb',
  sand: '#d4a843',
  wood: '#8b6914',
  lava: '#dc2626',
  ice: '#93c5fd',
  void: '#1a1a2e',
}

/** Object type → fill color mapping */
const OBJECT_COLORS: Record<MapObjectType, string> = {
  crate: '#a0845c',
  barrel: '#7a5c3a',
  chest: '#c9a84c',
  trap: '#dc2626',
  pillar: '#6b7280',
  statue: '#9ca3af',
  table: '#8b6914',
  chair: '#7a5c3a',
}

/**
 * Create a terrain shape element on the BlockSuite surface.
 */
export function createTerrainElement(
  editor: PulsarEditorContainer,
  cell: GridPoint,
  textureId: TerrainTextureId,
  cellSize: number,
): string | null {
  const svc = getEdgelessService(editor)
  if (!svc) return null

  const color = TERRAIN_COLORS[textureId] ?? '#6b7280'
  try {
    return svc.addElement('shape', {
      shapeType: 'rect',
      xywh: `[${cell.x - cellSize / 2},${cell.y - cellSize / 2},${cellSize},${cellSize}]`,
      fillColor: color,
      strokeColor: 'transparent',
      strokeWidth: 0,
      filled: true,
      radius: 0,
    })
  } catch {
    return null
  }
}

/**
 * Create wall line elements on the BlockSuite surface.
 */
export function createWallElement(
  editor: PulsarEditorContainer,
  points: GridPoint[],
  wallType: 'standard' | 'diagonal' | 'cavern',
): string | null {
  if (points.length < 2) return null
  const svc = getEdgelessService(editor)
  if (!svc) return null

  const strokeColor = wallType === 'cavern' ? '#8b6914' : '#4b5563'
  const strokeWidth = wallType === 'standard' ? 4 : 3

  // Create a path from the points — use connector for simplicity
  // For a single segment, create a line shape
  try {
    // Create a shape that represents the wall as a rectangle along the path
    const minX = Math.min(...points.map((p) => p.x))
    const minY = Math.min(...points.map((p) => p.y))
    const maxX = Math.max(...points.map((p) => p.x))
    const maxY = Math.max(...points.map((p) => p.y))
    const w = Math.max(maxX - minX, strokeWidth)
    const h = Math.max(maxY - minY, strokeWidth)

    return svc.addElement('shape', {
      shapeType: 'rect',
      xywh: `[${minX},${minY},${w},${h}]`,
      fillColor: strokeColor,
      strokeColor: strokeColor,
      strokeWidth: strokeWidth,
      filled: true,
      radius: 0,
    })
  } catch {
    return null
  }
}

/**
 * Create a door element on the BlockSuite surface.
 */
export function createDoorElement(
  editor: PulsarEditorContainer,
  point: GridPoint,
): string | null {
  const svc = getEdgelessService(editor)
  if (!svc) return null

  const size = 16
  try {
    return svc.addElement('shape', {
      shapeType: 'rect',
      xywh: `[${point.x - size / 2},${point.y - size / 2},${size},${size}]`,
      fillColor: '#f59e0b',
      strokeColor: '#92400e',
      strokeWidth: 2,
      filled: true,
      radius: 2,
    })
  } catch {
    return null
  }
}

/**
 * Create an object element on the BlockSuite surface.
 */
export function createObjectElement(
  editor: PulsarEditorContainer,
  point: GridPoint,
  objectType: MapObjectType,
): string | null {
  const svc = getEdgelessService(editor)
  if (!svc) return null

  const color = OBJECT_COLORS[objectType] ?? '#6b7280'
  const size = 20
  try {
    return svc.addElement('shape', {
      shapeType: 'rect',
      xywh: `[${point.x - size / 2},${point.y - size / 2},${size},${size}]`,
      fillColor: color,
      strokeColor: '#374151',
      strokeWidth: 1,
      filled: true,
      radius: 3,
    })
  } catch {
    return null
  }
}

/**
 * Create a light element on the BlockSuite surface (rendered as a circle).
 */
export function createLightElement(
  editor: PulsarEditorContainer,
  point: GridPoint,
  radius: number,
  color: string,
): string | null {
  const svc = getEdgelessService(editor)
  if (!svc) return null

  const displaySize = Math.min(radius, 40)
  try {
    return svc.addElement('shape', {
      shapeType: 'ellipse',
      xywh: `[${point.x - displaySize / 2},${point.y - displaySize / 2},${displaySize},${displaySize}]`,
      fillColor: color,
      strokeColor: color,
      strokeWidth: 1,
      filled: true,
      radius: 0,
    })
  } catch {
    return null
  }
}

/**
 * Create a legend pin element on the BlockSuite surface.
 */
export function createLegendElement(
  editor: PulsarEditorContainer,
  point: GridPoint,
  number: number,
): string | null {
  const svc = getEdgelessService(editor)
  if (!svc) return null

  const size = 24
  try {
    // Create a circle shape as the legend pin
    return svc.addElement('shape', {
      shapeType: 'ellipse',
      xywh: `[${point.x - size / 2},${point.y - size / 2},${size},${size}]`,
      fillColor: '#dc2626',
      strokeColor: '#ffffff',
      strokeWidth: 2,
      filled: true,
      radius: 0,
      text: {
        'pulsar:surface:text': true,
        delta: [{ insert: String(number) }],
      },
      color: '#ffffff',
      fontSize: 12,
      textAlign: 'center',
      textVerticalAlign: 'center',
    })
  } catch {
    return null
  }
}
