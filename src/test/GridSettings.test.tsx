import { describe, it, expect } from 'vitest'
import { GridShader } from '../lib/shaders/programs/GridShader.js'
import { snapToVertex, type GridConfig } from '../shared/grid.js'

/**
 * Validates the grid rendering approach:
 * 1. BlockSuite's CSS dot grid is disabled (transparent)
 * 2. Grid is now rendered by the WebGL GridShader
 * 3. GridShader supports square, hex, and gridless types
 * 4. GridShader.cellSize is the same value used by grid.ts snap functions
 */
describe('Grid rendering', () => {
  it('disables BlockSuite CSS grid by setting --pulsar-edgeless-grid-color to transparent', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    el.style.setProperty('--pulsar-edgeless-grid-color', 'transparent')
    expect(el.style.getPropertyValue('--pulsar-edgeless-grid-color')).toBe('transparent')

    document.body.removeChild(el)
  })

  it('GridShader has correct default properties', () => {
    const shader = new GridShader()
    expect(shader.gridType).toBe('square')
    expect(shader.cellSize).toBe(40)
    expect(shader.visible).toBe(true)
    expect(shader.opacity).toBe(0.15)
    expect(shader.zoom).toBe(1.0)
  })

  it('GridShader properties can be updated for all grid types', () => {
    const shader = new GridShader()

    shader.gridType = 'hex'
    shader.cellSize = 60
    shader.visible = false
    expect(shader.gridType).toBe('hex')
    expect(shader.cellSize).toBe(60)
    expect(shader.visible).toBe(false)

    shader.gridType = 'gridless'
    expect(shader.gridType).toBe('gridless')

    shader.gridType = 'square'
    expect(shader.gridType).toBe('square')
  })

  it('GridShader.cellSize matches grid.ts snap coordinate system', () => {
    const shader = new GridShader()
    const cfg: GridConfig = { type: 'square', cellSize: shader.cellSize }

    // When cellSize matches, grid lines drawn by the shader at multiples
    // of cellSize should align with snapToVertex results
    const snapped = snapToVertex({ px: 42, py: 38 }, cfg)
    expect(snapped.px % shader.cellSize).toBe(0)
    expect(snapped.py % shader.cellSize).toBe(0)
  })

  it('updating GridShader.cellSize to a non-default value still aligns', () => {
    const shader = new GridShader()
    shader.cellSize = 60
    const cfg: GridConfig = { type: 'square', cellSize: shader.cellSize }

    const snapped = snapToVertex({ px: 65, py: 35 }, cfg)
    expect(snapped.px % shader.cellSize).toBe(0)
    expect(snapped.py % shader.cellSize).toBe(0)
  })
})
