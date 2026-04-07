import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BoardPicker } from '../components/ui/BoardPicker.js'
import { createBoard } from '../shared/board.js'

const defaultBoards = [
  createBoard('page1', 'Scene 1', 'scene'),
  createBoard('page2', 'Map 1', 'map'),
]

const defaultProps = {
  boards: defaultBoards,
  activeBoardId: 'page1',
  viewMode: 'edgeless' as const,
  boardMode: 'edit' as const,
  userRole: 'gm' as const,
  onBoardChange: vi.fn(),
  onViewModeChange: vi.fn(),
  onBoardModeChange: vi.fn(),
  onAddBoard: vi.fn(),
}

describe('BoardPicker', () => {
  describe('rendering', () => {
    it('renders with the active board label', () => {
      render(<BoardPicker {...defaultProps} />)
      expect(screen.getByText('Scene 1')).toBeInTheDocument()
    })

    it('shows dropdown when clicked', async () => {
      const user = userEvent.setup()
      render(<BoardPicker {...defaultProps} />)

      await user.click(screen.getByText('Scene 1'))
      // Should show board list and view mode controls
      // "View" appears as a section title and as a mode button, so use getAllByText
      expect(screen.getAllByText('View').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Boards')).toBeInTheDocument()
    })
  })

  describe('board switching', () => {
    it('calls onBoardChange when a different board is selected', async () => {
      const user = userEvent.setup()
      const onBoardChange = vi.fn()
      render(<BoardPicker {...defaultProps} onBoardChange={onBoardChange} />)

      // Open dropdown
      await user.click(screen.getByText('Scene 1'))
      // Click on Map 1
      await user.click(screen.getByText('Map 1'))

      expect(onBoardChange).toHaveBeenCalledWith('page2')
    })
  })

  describe('view mode toggle', () => {
    it('shows Board and Doc view mode buttons', async () => {
      const user = userEvent.setup()
      render(<BoardPicker {...defaultProps} />)

      await user.click(screen.getByText('Scene 1'))
      expect(screen.getByText('Board')).toBeInTheDocument()
      expect(screen.getByText('Doc')).toBeInTheDocument()
    })

    it('calls onViewModeChange when view mode is changed', async () => {
      const user = userEvent.setup()
      const onViewModeChange = vi.fn()
      render(<BoardPicker {...defaultProps} onViewModeChange={onViewModeChange} />)

      await user.click(screen.getByText('Scene 1'))
      await user.click(screen.getByText('Doc'))

      expect(onViewModeChange).toHaveBeenCalledWith('page')
    })
  })

  describe('edit/view mode toggle', () => {
    it('shows Edit and View mode buttons for GM users', async () => {
      const user = userEvent.setup()
      render(<BoardPicker {...defaultProps} userRole="gm" />)

      await user.click(screen.getByText('Scene 1'))
      expect(screen.getByText('Mode')).toBeInTheDocument()
      expect(screen.getByText('Edit')).toBeInTheDocument()
      // "View" appears both in the view mode section and the board mode section
      const viewButtons = screen.getAllByText('View')
      expect(viewButtons.length).toBeGreaterThanOrEqual(2)
    })

    it('does not show edit/view toggle for player users', async () => {
      const user = userEvent.setup()
      render(<BoardPicker {...defaultProps} userRole="player" />)

      await user.click(screen.getByText('Scene 1'))
      // "Mode" section should not appear for players
      expect(screen.queryByText('Mode')).not.toBeInTheDocument()
    })

    it('calls onBoardModeChange when mode is toggled', async () => {
      const user = userEvent.setup()
      const onBoardModeChange = vi.fn()
      render(<BoardPicker {...defaultProps} onBoardModeChange={onBoardModeChange} />)

      await user.click(screen.getByText('Scene 1'))
      // Find the View button in the Mode section (second occurrence of "View")
      const viewButtons = screen.getAllByText('View')
      // The last "View" is in the Mode section
      await user.click(viewButtons[viewButtons.length - 1])

      expect(onBoardModeChange).toHaveBeenCalledWith('view')
    })
  })

  describe('add board', () => {
    it('shows Scene and Map buttons for adding boards', async () => {
      const user = userEvent.setup()
      render(<BoardPicker {...defaultProps} />)

      await user.click(screen.getByText('Scene 1'))
      expect(screen.getByText('Scene')).toBeInTheDocument()
      expect(screen.getByText('Map')).toBeInTheDocument()
    })

    it('calls onAddBoard with "scene" when Scene button is clicked', async () => {
      const user = userEvent.setup()
      const onAddBoard = vi.fn()
      render(<BoardPicker {...defaultProps} onAddBoard={onAddBoard} />)

      await user.click(screen.getByText('Scene 1'))
      // Click the Scene add button (the one in the Boards section, not the board name)
      const sceneButtons = screen.getAllByText('Scene')
      // Last one is the add button
      await user.click(sceneButtons[sceneButtons.length - 1])

      expect(onAddBoard).toHaveBeenCalledWith('scene')
    })

    it('calls onAddBoard with "map" when Map button is clicked', async () => {
      const user = userEvent.setup()
      const onAddBoard = vi.fn()
      render(<BoardPicker {...defaultProps} onAddBoard={onAddBoard} />)

      await user.click(screen.getByText('Scene 1'))
      // Click the Map add button
      const mapButtons = screen.getAllByText('Map')
      await user.click(mapButtons[mapButtons.length - 1])

      expect(onAddBoard).toHaveBeenCalledWith('map')
    })
  })

  describe('board kind badges', () => {
    it('displays board kind badges in dropdown', async () => {
      const user = userEvent.setup()
      render(<BoardPicker {...defaultProps} />)

      await user.click(screen.getByText('Scene 1'))
      // Each board item shows its kind as a badge
      const sceneBadges = screen.getAllByText('scene')
      const mapBadges = screen.getAllByText('map')
      expect(sceneBadges.length).toBeGreaterThanOrEqual(1)
      expect(mapBadges.length).toBeGreaterThanOrEqual(1)
    })
  })
})
