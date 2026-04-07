import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MapToolbar } from '../components/ui/MapToolbar.js'
import type { MapTool, TerrainTextureId, MapObjectType } from '../shared/mapTypes.js'

const defaultProps = {
  activeMapTool: null as MapTool | null,
  onMapToolChange: vi.fn<(tool: MapTool | null) => void>(),
  selectedTerrain: 'stone' as TerrainTextureId,
  onTerrainChange: vi.fn<(t: TerrainTextureId) => void>(),
  selectedObject: 'crate' as MapObjectType,
  onObjectChange: vi.fn<(o: MapObjectType) => void>(),
}

describe('MapToolbar', () => {
  describe('rendering', () => {
    it('renders all 8 map tools', () => {
      render(<MapToolbar {...defaultProps} />)
      expect(screen.getByLabelText('Terrain')).toBeInTheDocument()
      expect(screen.getByLabelText('Wall')).toBeInTheDocument()
      expect(screen.getByLabelText('Diagonal Wall')).toBeInTheDocument()
      expect(screen.getByLabelText('Cavern Wall')).toBeInTheDocument()
      expect(screen.getByLabelText('Door')).toBeInTheDocument()
      expect(screen.getByLabelText('Object')).toBeInTheDocument()
      expect(screen.getByLabelText('Light')).toBeInTheDocument()
      expect(screen.getByLabelText('Legend')).toBeInTheDocument()
    })

    it('renders a divider before map tools', () => {
      const { container } = render(<MapToolbar {...defaultProps} />)
      // The divider is the first child of the container
      const divider = container.querySelector('[style*="width: 1px"]')
      expect(divider).toBeInTheDocument()
    })
  })

  describe('tool selection', () => {
    it('calls onMapToolChange when a map tool is clicked', async () => {
      const user = userEvent.setup()
      const onMapToolChange = vi.fn<(tool: MapTool | null) => void>()
      render(<MapToolbar {...defaultProps} onMapToolChange={onMapToolChange} />)

      await user.click(screen.getByLabelText('Terrain'))
      expect(onMapToolChange).toHaveBeenCalledWith('terrain')
    })

    it('calls onMapToolChange with null when same tool is clicked again (toggle off)', async () => {
      const user = userEvent.setup()
      const onMapToolChange = vi.fn<(tool: MapTool | null) => void>()
      render(<MapToolbar {...defaultProps} activeMapTool="terrain" onMapToolChange={onMapToolChange} />)

      await user.click(screen.getByLabelText('Terrain'))
      expect(onMapToolChange).toHaveBeenCalledWith(null)
    })

    it('switches between map tools', async () => {
      const user = userEvent.setup()
      const onMapToolChange = vi.fn<(tool: MapTool | null) => void>()
      render(<MapToolbar {...defaultProps} activeMapTool="terrain" onMapToolChange={onMapToolChange} />)

      await user.click(screen.getByLabelText('Wall'))
      expect(onMapToolChange).toHaveBeenCalledWith('wall')
    })
  })

  describe('terrain palette', () => {
    it('shows terrain palette when terrain tool is selected', async () => {
      const user = userEvent.setup()
      const onMapToolChange = vi.fn<(tool: MapTool | null) => void>()
      render(<MapToolbar {...defaultProps} onMapToolChange={onMapToolChange} />)

      await user.click(screen.getByLabelText('Terrain'))
      expect(screen.getByText('Terrain')).toBeInTheDocument()
    })

    it('renders all 9 terrain swatches when terrain tool is active', async () => {
      const user = userEvent.setup()
      render(<MapToolbar {...defaultProps} />)
      // Must click Terrain to open the internal palette state
      await user.click(screen.getByLabelText('Terrain'))
      // TERRAIN_SWATCHES has 9 entries
      const swatches = ['Stone', 'Grass', 'Wood', 'Water', 'Sand', 'Dirt', 'Snow', 'Lava', 'Void']
      for (const label of swatches) {
        expect(screen.getByLabelText(label)).toBeInTheDocument()
      }
    })

    it('calls onTerrainChange when a terrain swatch is clicked', async () => {
      const user = userEvent.setup()
      const onTerrainChange = vi.fn<(t: TerrainTextureId) => void>()
      render(<MapToolbar {...defaultProps} onTerrainChange={onTerrainChange} />)

      await user.click(screen.getByLabelText('Terrain'))
      await user.click(screen.getByLabelText('Grass'))
      expect(onTerrainChange).toHaveBeenCalledWith('grass')
    })

    it('highlights the selected terrain swatch', async () => {
      const user = userEvent.setup()
      render(<MapToolbar {...defaultProps} selectedTerrain="water" />)
      // Open terrain palette
      await user.click(screen.getByLabelText('Terrain'))
      const waterBtn = screen.getByLabelText('Water')
      // Selected swatch has accent outline
      expect(waterBtn).toHaveStyle({ outline: '2px solid var(--color-accent)' })
    })

    it('hides terrain palette when switching to wall tool', async () => {
      const user = userEvent.setup()
      const onMapToolChange = vi.fn<(tool: MapTool | null) => void>()
      render(<MapToolbar {...defaultProps} onMapToolChange={onMapToolChange} />)

      await user.click(screen.getByLabelText('Terrain'))
      expect(screen.getByText('Terrain')).toBeInTheDocument()

      await user.click(screen.getByLabelText('Wall'))
      // Terrain palette should close because wall doesn't have a palette
      expect(screen.queryByText('Terrain')).not.toBeInTheDocument()
    })
  })

  describe('object palette', () => {
    it('shows object palette when object tool is selected', async () => {
      const user = userEvent.setup()
      const onMapToolChange = vi.fn<(tool: MapTool | null) => void>()
      render(<MapToolbar {...defaultProps} onMapToolChange={onMapToolChange} />)

      await user.click(screen.getByLabelText('Object'))
      expect(screen.getByText('Objects')).toBeInTheDocument()
    })

    it('renders all 8 object types when object tool is active', async () => {
      const user = userEvent.setup()
      render(<MapToolbar {...defaultProps} />)
      await user.click(screen.getByLabelText('Object'))
      const objects = ['Crate', 'Table', 'Barrel', 'Bookshelf', 'Chair', 'Chest', 'Pillar', 'Statue']
      for (const label of objects) {
        expect(screen.getByLabelText(label)).toBeInTheDocument()
      }
    })

    it('calls onObjectChange when an object type is clicked', async () => {
      const user = userEvent.setup()
      const onObjectChange = vi.fn<(o: MapObjectType) => void>()
      render(<MapToolbar {...defaultProps} onObjectChange={onObjectChange} />)

      await user.click(screen.getByLabelText('Object'))
      await user.click(screen.getByLabelText('Barrel'))
      expect(onObjectChange).toHaveBeenCalledWith('barrel')
    })

    it('highlights the selected object type', async () => {
      const user = userEvent.setup()
      render(<MapToolbar {...defaultProps} selectedObject="chest" />)
      await user.click(screen.getByLabelText('Object'))
      const chestBtn = screen.getByLabelText('Chest')
      expect(chestBtn).toHaveStyle({ background: 'var(--color-bg-active)' })
    })
  })

  describe('accessibility', () => {
    it('every map tool has an aria-label', () => {
      render(<MapToolbar {...defaultProps} />)
      const labels = [
        'Terrain', 'Wall', 'Diagonal Wall', 'Cavern Wall',
        'Door', 'Object', 'Light', 'Legend',
      ]
      for (const label of labels) {
        expect(screen.getByLabelText(label)).toBeInTheDocument()
      }
    })
  })
})
