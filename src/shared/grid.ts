/**
 * Grid coordinate system.
 *
 * Supports square, hex (flat-top), and gridless layouts.
 * All public helpers are pure functions — no global state.
 *
 * Coordinate conventions:
 * - Pixel coordinates: `{ px, py }` — raw screen/canvas positions.
 * - Cell coordinates:  `{ col, row }` — integer grid indices.
 *   For hex grids these are offset (even-q) coordinates.
 */

// ── Grid types ──

/** Supported grid layouts */
export type GridType = 'square' | 'hex' | 'gridless'

/** A position in pixel space */
export interface PixelPoint {
  px: number
  py: number
}

/** A cell address in grid space */
export interface CellCoord {
  col: number
  row: number
}

/** Options that fully describe a grid */
export interface GridConfig {
  type: GridType
  /** Side length in pixels.  For square grids this is the cell width/height.
   *  For hex grids this is the distance from centre to vertex (circumradius). */
  cellSize: number
}

// ── Constants for hex math ──

const SQRT3 = Math.sqrt(3)

// ── Pixel ↔ Cell conversion ──

/** Convert a cell address to the pixel position of its centre. */
export function cellToPixel(cell: CellCoord, cfg: GridConfig): PixelPoint {
  switch (cfg.type) {
    case 'square':
      return {
        px: cell.col * cfg.cellSize + cfg.cellSize / 2,
        py: cell.row * cfg.cellSize + cfg.cellSize / 2,
      }

    case 'hex': {
      // Flat-top, even-q offset
      const size = cfg.cellSize
      const px = size * 1.5 * cell.col + size
      const py =
        size * SQRT3 * (cell.row + (cell.col % 2 === 0 ? 0 : 0.5)) +
        (size * SQRT3) / 2
      return { px, py }
    }

    case 'gridless':
      // gridless: cells are just arbitrary pixel positions
      return { px: cell.col, py: cell.row }
  }
}

/** Convert a pixel position to the cell it falls inside. */
export function pixelToCell(pt: PixelPoint, cfg: GridConfig): CellCoord {
  switch (cfg.type) {
    case 'square':
      return {
        col: Math.floor(pt.px / cfg.cellSize),
        row: Math.floor(pt.py / cfg.cellSize),
      }

    case 'hex': {
      // Flat-top hex → axial → offset (even-q)
      const size = cfg.cellSize
      const q = ((2 / 3) * pt.px) / size - 2 / 3
      const r = ((-1 / 3) * pt.px + (SQRT3 / 3) * pt.py) / size - SQRT3 / 6

      // Cube round
      const { col, row } = axialRound(q, r)
      return { col, row: row + Math.floor(col / 2) }
    }

    case 'gridless':
      return { col: Math.round(pt.px), row: Math.round(pt.py) }
  }
}

/** Snap a pixel point to the nearest cell centre. */
export function snapToCell(pt: PixelPoint, cfg: GridConfig): PixelPoint {
  if (cfg.type === 'gridless') return pt
  return cellToPixel(pixelToCell(pt, cfg), cfg)
}

/**
 * Snap a pixel point to the nearest grid intersection (vertex).
 * For square grids this is where grid lines cross.
 * For hex grids this is the nearest vertex of the enclosing hex.
 * For gridless this is the identity function.
 */
export function snapToVertex(pt: PixelPoint, cfg: GridConfig): PixelPoint {
  switch (cfg.type) {
    case 'square':
      return {
        px: Math.round(pt.px / cfg.cellSize) * cfg.cellSize,
        py: Math.round(pt.py / cfg.cellSize) * cfg.cellSize,
      }

    case 'hex': {
      // Snap to the nearest hex vertex
      const cell = pixelToCell(pt, cfg)
      const verts = hexVertices(cell, cfg)
      let best = verts[0]
      let bestDist = Infinity
      for (const v of verts) {
        const d = (v.px - pt.px) ** 2 + (v.py - pt.py) ** 2
        if (d < bestDist) {
          bestDist = d
          best = v
        }
      }
      return best
    }

    case 'gridless':
      return pt
  }
}

// ── Neighbours ──

/** Get the cell coordinates of all face-adjacent neighbours. */
export function neighbours(cell: CellCoord, cfg: GridConfig): CellCoord[] {
  switch (cfg.type) {
    case 'square':
      return [
        { col: cell.col - 1, row: cell.row },
        { col: cell.col + 1, row: cell.row },
        { col: cell.col, row: cell.row - 1 },
        { col: cell.col, row: cell.row + 1 },
      ]

    case 'hex': {
      const even = cell.col % 2 === 0
      return [
        { col: cell.col + 1, row: even ? cell.row - 1 : cell.row },
        { col: cell.col + 1, row: even ? cell.row : cell.row + 1 },
        { col: cell.col - 1, row: even ? cell.row - 1 : cell.row },
        { col: cell.col - 1, row: even ? cell.row : cell.row + 1 },
        { col: cell.col, row: cell.row - 1 },
        { col: cell.col, row: cell.row + 1 },
      ]
    }

    case 'gridless':
      return [] // No grid topology
  }
}

// ── Distance ──

/** Grid distance between two cells (Chebyshev for square, hex distance for hex). */
export function cellDistance(a: CellCoord, b: CellCoord, cfg: GridConfig): number {
  switch (cfg.type) {
    case 'square':
      return Math.max(Math.abs(a.col - b.col), Math.abs(a.row - b.row))

    case 'hex': {
      // Convert to cube and use cube distance
      const aCube = offsetToCube(a)
      const bCube = offsetToCube(b)
      return Math.max(
        Math.abs(aCube.x - bCube.x),
        Math.abs(aCube.y - bCube.y),
        Math.abs(aCube.z - bCube.z)
      )
    }

    case 'gridless': {
      const dx = a.col - b.col
      const dy = a.row - b.row
      return Math.sqrt(dx * dx + dy * dy)
    }
  }
}

// ── Hex geometry helpers ──

/** Pixel positions of the 6 vertices of a flat-top hex. */
export function hexVertices(cell: CellCoord, cfg: GridConfig): PixelPoint[] {
  const centre = cellToPixel(cell, cfg)
  const s = cfg.cellSize
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i
    return {
      px: centre.px + s * Math.cos(angle),
      py: centre.py + s * Math.sin(angle),
    }
  })
}

/** Width and height of a single flat-top hex tile. */
export function hexDimensions(cellSize: number): { width: number; height: number } {
  return {
    width: cellSize * 2,
    height: cellSize * SQRT3,
  }
}

// ── Internal helpers ──

/** Even-q offset → cube coordinates */
function offsetToCube(c: CellCoord): { x: number; y: number; z: number } {
  const x = c.col
  const z = c.row - Math.floor(c.col / 2)
  const y = -x - z
  return { x, y, z }
}

/** Axial round to nearest hex (returns offset coords) */
function axialRound(q: number, r: number): { col: number; row: number } {
  const s = -q - r
  let rq = Math.round(q)
  let rr = Math.round(r)
  const rs = Math.round(s)

  const dq = Math.abs(rq - q)
  const dr = Math.abs(rr - r)
  const ds = Math.abs(rs - s)

  if (dq > dr && dq > ds) {
    rq = -rr - rs
  } else if (dr > ds) {
    rr = -rq - rs
  }

  // axial (q, r) → col = q, row = r
  return { col: rq, row: rr }
}

/** Cell dimensions in pixels (useful for UI, e.g. cursor preview sizing). */
export function cellPixelSize(cfg: GridConfig): { width: number; height: number } {
  switch (cfg.type) {
    case 'square':
      return { width: cfg.cellSize, height: cfg.cellSize }
    case 'hex':
      return hexDimensions(cfg.cellSize)
    case 'gridless':
      return { width: cfg.cellSize, height: cfg.cellSize }
  }
}
