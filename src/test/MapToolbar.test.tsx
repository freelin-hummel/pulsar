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
  })

  describe('object palette', () => {
    it('shows object palette when object tool is selected', async () => {
      const user = userEvent.setup()
      const onMapToolChange = vi.fn<(tool: MapTool | null) => void>()
      render(<MapToolbar {...defaultProps} onMapToolChange={onMapToolChange} />)

      await user.click(screen.getByLabelText('Object'))
      expect(screen.getByText('Objects')).toBeInTheDocument()
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
