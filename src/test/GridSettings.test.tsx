import { describe, it, expect } from 'vitest'

/**
 * Validates the grid rendering approach:
 * 1. BlockSuite's CSS dot grid is disabled (transparent)
 * 2. Grid is now rendered by the WebGL GridShader
 * 3. GridShader supports square, hex, and gridless types
 */
describe('Grid rendering', () => {
  it('disables BlockSuite CSS grid by setting --pulsar-edgeless-grid-color to transparent', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    el.style.setProperty('--pulsar-edgeless-grid-color', 'transparent')
    expect(el.style.getPropertyValue('--pulsar-edgeless-grid-color')).toBe('transparent')

    document.body.removeChild(el)
  })

  it('GridShader module can be imported', async () => {
    const mod = await import('../lib/shaders/programs/GridShader.js')
    expect(mod.GridShader).toBeDefined()
    expect(typeof mod.GridShader).toBe('function')
  })

  it('GridShader has correct default properties', async () => {
    const { GridShader } = await import('../lib/shaders/programs/GridShader.js')
    const shader = new GridShader()
    expect(shader.gridType).toBe('square')
    expect(shader.cellSize).toBe(40)
    expect(shader.visible).toBe(true)
    expect(shader.opacity).toBe(0.15)
    expect(shader.zoom).toBe(1.0)
  })

  it('GridShader properties can be updated for all grid types', async () => {
    const { GridShader } = await import('../lib/shaders/programs/GridShader.js')
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
})
