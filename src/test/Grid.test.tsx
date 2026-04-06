import { describe, it, expect } from 'vitest'
import {
  cellToPixel,
  pixelToCell,
  snapToCell,
  snapToVertex,
  neighbours,
  cellDistance,
  hexVertices,
  hexDimensions,
  cellPixelSize,
  type GridConfig,
} from '../shared/grid.js'

// ── Square grid tests ──

const sq: GridConfig = { type: 'square', cellSize: 40 }

describe('Square grid', () => {
  describe('cellToPixel', () => {
    it('maps (0,0) to the centre of the first cell', () => {
      expect(cellToPixel({ col: 0, row: 0 }, sq)).toEqual({ px: 20, py: 20 })
    })

    it('maps (2,3) correctly', () => {
      expect(cellToPixel({ col: 2, row: 3 }, sq)).toEqual({ px: 100, py: 140 })
    })
  })

  describe('pixelToCell', () => {
    it('maps the origin to cell (0,0)', () => {
      expect(pixelToCell({ px: 5, py: 5 }, sq)).toEqual({ col: 0, row: 0 })
    })

    it('maps pixel (100, 140) to cell (2,3)', () => {
      expect(pixelToCell({ px: 100, py: 140 }, sq)).toEqual({ col: 2, row: 3 })
    })

    it('maps pixel at the boundary of cell (1,0) correctly', () => {
      // pixel 40.0 is the start of cell (1,0)
      expect(pixelToCell({ px: 40, py: 0 }, sq)).toEqual({ col: 1, row: 0 })
    })
  })

  describe('snapToCell', () => {
    it('snaps arbitrary point to nearest cell centre', () => {
      const result = snapToCell({ px: 15, py: 15 }, sq)
      expect(result).toEqual({ px: 20, py: 20 })
    })

    it('snaps point at (65, 85) to cell (1,2) centre', () => {
      const result = snapToCell({ px: 65, py: 85 }, sq)
      expect(result).toEqual({ px: 60, py: 100 })
    })
  })

  describe('snapToVertex', () => {
    it('snaps to nearest grid intersection', () => {
      const result = snapToVertex({ px: 18, py: 15 }, sq)
      expect(result).toEqual({ px: 0, py: 0 })
    })

    it('snaps (42, 38) to intersection (40, 40)', () => {
      const result = snapToVertex({ px: 42, py: 38 }, sq)
      expect(result).toEqual({ px: 40, py: 40 })
    })
  })

  describe('neighbours', () => {
    it('returns 4 neighbours for a square cell', () => {
      const n = neighbours({ col: 5, row: 5 }, sq)
      expect(n).toHaveLength(4)
      expect(n).toContainEqual({ col: 4, row: 5 })
      expect(n).toContainEqual({ col: 6, row: 5 })
      expect(n).toContainEqual({ col: 5, row: 4 })
      expect(n).toContainEqual({ col: 5, row: 6 })
    })
  })

  describe('cellDistance', () => {
    it('adjacent cells have distance 1', () => {
      expect(cellDistance({ col: 0, row: 0 }, { col: 1, row: 0 }, sq)).toBe(1)
    })

    it('diagonal cells have distance 1 (Chebyshev)', () => {
      expect(cellDistance({ col: 0, row: 0 }, { col: 1, row: 1 }, sq)).toBe(1)
    })

    it('distant cells are correct', () => {
      expect(cellDistance({ col: 0, row: 0 }, { col: 3, row: 4 }, sq)).toBe(4)
    })
  })

  describe('cellPixelSize', () => {
    it('returns cellSize × cellSize for square', () => {
      expect(cellPixelSize(sq)).toEqual({ width: 40, height: 40 })
    })
  })
})

// ── Hex grid tests ──

const hex: GridConfig = { type: 'hex', cellSize: 30 }

describe('Hex grid', () => {
  describe('cellToPixel / pixelToCell round-trip', () => {
    it('cell (0,0) round-trips', () => {
      const px = cellToPixel({ col: 0, row: 0 }, hex)
      const cell = pixelToCell(px, hex)
      expect(cell).toEqual({ col: 0, row: 0 })
    })

    it('cell (2,3) round-trips', () => {
      const px = cellToPixel({ col: 2, row: 3 }, hex)
      const cell = pixelToCell(px, hex)
      expect(cell).toEqual({ col: 2, row: 3 })
    })

    it('odd-column cell (1,2) round-trips', () => {
      const px = cellToPixel({ col: 1, row: 2 }, hex)
      const cell = pixelToCell(px, hex)
      expect(cell).toEqual({ col: 1, row: 2 })
    })

    it('negative cell (-1,-1) round-trips', () => {
      const px = cellToPixel({ col: -1, row: -1 }, hex)
      const cell = pixelToCell(px, hex)
      expect(cell).toEqual({ col: -1, row: -1 })
    })
  })

  describe('snapToCell', () => {
    it('snaps to cell centre', () => {
      const centre = cellToPixel({ col: 1, row: 1 }, hex)
      // Slightly offset from centre
      const snapped = snapToCell({ px: centre.px + 3, py: centre.py - 2 }, hex)
      expect(snapped.px).toBeCloseTo(centre.px, 5)
      expect(snapped.py).toBeCloseTo(centre.py, 5)
    })
  })

  describe('neighbours', () => {
    it('returns 6 neighbours for a hex cell', () => {
      const n = neighbours({ col: 2, row: 2 }, hex)
      expect(n).toHaveLength(6)
    })

    it('returns different offsets for even vs odd columns', () => {
      const evenNeighbours = neighbours({ col: 2, row: 2 }, hex)
      const oddNeighbours = neighbours({ col: 3, row: 2 }, hex)
      // They should have different row patterns
      expect(evenNeighbours).not.toEqual(oddNeighbours)
    })
  })

  describe('cellDistance', () => {
    it('same cell has distance 0', () => {
      expect(cellDistance({ col: 0, row: 0 }, { col: 0, row: 0 }, hex)).toBe(0)
    })

    it('adjacent hex has distance 1', () => {
      expect(cellDistance({ col: 0, row: 0 }, { col: 0, row: 1 }, hex)).toBe(1)
    })
  })

  describe('hexVertices', () => {
    it('returns 6 vertices', () => {
      const verts = hexVertices({ col: 0, row: 0 }, hex)
      expect(verts).toHaveLength(6)
    })

    it('all vertices are at distance cellSize from centre', () => {
      const centre = cellToPixel({ col: 0, row: 0 }, hex)
      const verts = hexVertices({ col: 0, row: 0 }, hex)
      for (const v of verts) {
        const d = Math.sqrt((v.px - centre.px) ** 2 + (v.py - centre.py) ** 2)
        expect(d).toBeCloseTo(hex.cellSize, 5)
      }
    })
  })

  describe('hexDimensions', () => {
    it('returns correct width and height', () => {
      const dim = hexDimensions(30)
      expect(dim.width).toBe(60)
      expect(dim.height).toBeCloseTo(30 * Math.sqrt(3), 5)
    })
  })
})

// ── Gridless tests ──

const gridless: GridConfig = { type: 'gridless', cellSize: 40 }

describe('Gridless grid', () => {
  describe('snapToCell', () => {
    it('returns the input point unchanged', () => {
      expect(snapToCell({ px: 123.4, py: 567.8 }, gridless)).toEqual({
        px: 123.4,
        py: 567.8,
      })
    })
  })

  describe('snapToVertex', () => {
    it('returns the input point unchanged', () => {
      expect(snapToVertex({ px: 123.4, py: 567.8 }, gridless)).toEqual({
        px: 123.4,
        py: 567.8,
      })
    })
  })

  describe('neighbours', () => {
    it('returns empty array', () => {
      expect(neighbours({ col: 0, row: 0 }, gridless)).toEqual([])
    })
  })

  describe('cellDistance', () => {
    it('returns Euclidean distance', () => {
      const d = cellDistance({ col: 0, row: 0 }, { col: 3, row: 4 }, gridless)
      expect(d).toBe(5) // 3-4-5 triangle
    })
  })
})
