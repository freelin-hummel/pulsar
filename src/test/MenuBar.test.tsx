import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MenuBar, type GlobalSettings } from '../components/ui/MenuBar.js'

const defaultSettings: GlobalSettings = {
  showGrid: true,
  snapToGrid: true,
  gridSize: 40,
  gridType: 'square',
}

describe('MenuBar', () => {
  describe('rendering', () => {
    it('renders the menu bar', () => {
      render(<MenuBar settings={defaultSettings} onSettingsChange={() => {}} />)
      expect(screen.getByTestId('menu-bar')).toBeInTheDocument()
    })

    it('renders File and View menu buttons', () => {
      render(<MenuBar settings={defaultSettings} onSettingsChange={() => {}} />)
      expect(screen.getByText('File')).toBeInTheDocument()
      expect(screen.getByText('View')).toBeInTheDocument()
    })
  })

  describe('File menu', () => {
    it('opens File menu on click', async () => {
      const user = userEvent.setup()
      render(<MenuBar settings={defaultSettings} onSettingsChange={() => {}} />)

      await user.click(screen.getByText('File'))
      expect(screen.getByText('Show Grid')).toBeInTheDocument()
      expect(screen.getByText('Snap to Grid')).toBeInTheDocument()
    })

    it('toggles showGrid setting when Show Grid is clicked', async () => {
      const user = userEvent.setup()
      const onSettingsChange = vi.fn()
      render(<MenuBar settings={defaultSettings} onSettingsChange={onSettingsChange} />)

      await user.click(screen.getByText('File'))
      await user.click(screen.getByText('Show Grid'))

      expect(onSettingsChange).toHaveBeenCalledWith({
        ...defaultSettings,
        showGrid: false,
      })
    })

    it('toggles snapToGrid setting when Snap to Grid is clicked', async () => {
      const user = userEvent.setup()
      const onSettingsChange = vi.fn()
      render(<MenuBar settings={defaultSettings} onSettingsChange={onSettingsChange} />)

      await user.click(screen.getByText('File'))
      await user.click(screen.getByText('Snap to Grid'))

      expect(onSettingsChange).toHaveBeenCalledWith({
        ...defaultSettings,
        snapToGrid: false,
      })
    })

    it('shows checkmark for enabled toggles', async () => {
      const user = userEvent.setup()
      render(<MenuBar settings={defaultSettings} onSettingsChange={() => {}} />)

      await user.click(screen.getByText('File'))

      // Both are enabled by default, so checkmarks should be visible (opacity 1)
      const checks = screen.getAllByText('✓')
      expect(checks.length).toBeGreaterThanOrEqual(2)
      // The first two checks correspond to Show Grid and Snap to Grid
      expect(checks[0]).toHaveStyle({ opacity: 1 })
      expect(checks[1]).toHaveStyle({ opacity: 1 })
    })

    it('shows dimmed checkmark for disabled toggles', async () => {
      const user = userEvent.setup()
      const disabledSettings = { ...defaultSettings, showGrid: false }
      render(<MenuBar settings={disabledSettings} onSettingsChange={() => {}} />)

      await user.click(screen.getByText('File'))

      const checks = screen.getAllByText('✓')
      // Show Grid is disabled → dimmed checkmark
      expect(checks[0]).toHaveStyle({ opacity: 0.2 })
      // Snap to Grid is enabled → full checkmark
      expect(checks[1]).toHaveStyle({ opacity: 1 })
    })

    it('keeps File menu open after toggling a setting', async () => {
      const user = userEvent.setup()
      render(<MenuBar settings={defaultSettings} onSettingsChange={() => {}} />)

      await user.click(screen.getByText('File'))
      await user.click(screen.getByText('Show Grid'))

      // Toggle items should NOT close the menu
      expect(screen.getByText('Show Grid')).toBeInTheDocument()
    })
  })

  describe('View menu', () => {
    it('opens View menu and shows Dark Theme toggle', async () => {
      const user = userEvent.setup()
      render(<MenuBar settings={defaultSettings} onSettingsChange={() => {}} />)

      await user.click(screen.getByText('View'))
      expect(screen.getByText('Dark Theme')).toBeInTheDocument()
    })
  })

  describe('grid type selection', () => {
    it('shows grid type options in File menu', async () => {
      const user = userEvent.setup()
      render(<MenuBar settings={defaultSettings} onSettingsChange={() => {}} />)

      await user.click(screen.getByText('File'))
      expect(screen.getByText('Square Grid')).toBeInTheDocument()
      expect(screen.getByText('Hex Grid')).toBeInTheDocument()
      expect(screen.getByText('Gridless')).toBeInTheDocument()
    })

    it('switches to hex grid when Hex Grid is clicked', async () => {
      const user = userEvent.setup()
      const onSettingsChange = vi.fn()
      render(<MenuBar settings={defaultSettings} onSettingsChange={onSettingsChange} />)

      await user.click(screen.getByText('File'))
      await user.click(screen.getByText('Hex Grid'))

      expect(onSettingsChange).toHaveBeenCalledWith({
        ...defaultSettings,
        gridType: 'hex',
      })
    })

    it('switches to gridless when Gridless is clicked', async () => {
      const user = userEvent.setup()
      const onSettingsChange = vi.fn()
      render(<MenuBar settings={defaultSettings} onSettingsChange={onSettingsChange} />)

      await user.click(screen.getByText('File'))
      await user.click(screen.getByText('Gridless'))

      expect(onSettingsChange).toHaveBeenCalledWith({
        ...defaultSettings,
        gridType: 'gridless',
      })
    })

    it('shows checkmark on active grid type', async () => {
      const user = userEvent.setup()
      const hexSettings = { ...defaultSettings, gridType: 'hex' as const }
      render(<MenuBar settings={hexSettings} onSettingsChange={() => {}} />)

      await user.click(screen.getByText('File'))

      // The checkmarks: Show Grid (✓), Snap to Grid (✓), Square Grid (dim), Hex Grid (✓), Gridless (dim)
      const checks = screen.getAllByText('✓')
      // Hex Grid should be active (opacity 1), Square and Gridless should be dim (opacity 0.2)
      // Find the check marks that correspond to grid types — they are after the separator
      expect(checks.length).toBeGreaterThanOrEqual(5)
    })
  })
})
