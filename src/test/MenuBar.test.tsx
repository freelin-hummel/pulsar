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

    it('hides checkmark for disabled toggles', async () => {
      const user = userEvent.setup()
      const disabledSettings = { ...defaultSettings, showGrid: false }
      render(<MenuBar settings={disabledSettings} onSettingsChange={() => {}} />)

      await user.click(screen.getByText('File'))

      const checks = screen.getAllByText('✓')
      // Show Grid is disabled → hidden checkmark (opacity 0)
      expect(checks[0]).toHaveStyle({ opacity: 0 })
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

    it('shows checkmark on active grid type only', async () => {
      const user = userEvent.setup()
      const hexSettings = { ...defaultSettings, gridType: 'hex' as const }
      render(<MenuBar settings={hexSettings} onSettingsChange={() => {}} />)

      await user.click(screen.getByText('File'))

      const checks = screen.getAllByText('✓')
      // checks[0] = Show Grid (on), checks[1] = Snap to Grid (on)
      // checks[2] = Square Grid, checks[3] = Hex Grid, checks[4] = Gridless
      expect(checks.length).toBe(5)
      expect(checks[0]).toHaveStyle({ opacity: 1 })  // Show Grid on
      expect(checks[1]).toHaveStyle({ opacity: 1 })  // Snap to Grid on
      expect(checks[2]).toHaveStyle({ opacity: 0 })  // Square Grid off (not active)
      expect(checks[3]).toHaveStyle({ opacity: 1 })  // Hex Grid on (active)
      expect(checks[4]).toHaveStyle({ opacity: 0 })  // Gridless off (not active)
    })

    it('only square grid has visible checkmark when grid type is square', async () => {
      const user = userEvent.setup()
      render(<MenuBar settings={defaultSettings} onSettingsChange={() => {}} />)

      await user.click(screen.getByText('File'))

      const checks = screen.getAllByText('✓')
      // checks[2] = Square Grid, checks[3] = Hex Grid, checks[4] = Gridless
      expect(checks[2]).toHaveStyle({ opacity: 1 })  // Square Grid on
      expect(checks[3]).toHaveStyle({ opacity: 0 })  // Hex Grid off
      expect(checks[4]).toHaveStyle({ opacity: 0 })  // Gridless off
    })

    it('only gridless has visible checkmark when grid type is gridless', async () => {
      const user = userEvent.setup()
      const gridlessSettings = { ...defaultSettings, gridType: 'gridless' as const }
      render(<MenuBar settings={gridlessSettings} onSettingsChange={() => {}} />)

      await user.click(screen.getByText('File'))

      const checks = screen.getAllByText('✓')
      expect(checks[2]).toHaveStyle({ opacity: 0 })  // Square Grid off
      expect(checks[3]).toHaveStyle({ opacity: 0 })  // Hex Grid off
      expect(checks[4]).toHaveStyle({ opacity: 1 })  // Gridless on
    })

    it('switches back to square grid when Square Grid is clicked', async () => {
      const user = userEvent.setup()
      const onSettingsChange = vi.fn()
      const hexSettings = { ...defaultSettings, gridType: 'hex' as const }
      render(<MenuBar settings={hexSettings} onSettingsChange={onSettingsChange} />)

      await user.click(screen.getByText('File'))
      await user.click(screen.getByText('Square Grid'))

      expect(onSettingsChange).toHaveBeenCalledWith({
        ...hexSettings,
        gridType: 'square',
      })
    })
  })

  describe('menu close behaviour', () => {
    it('closes menu when About Pulsar is clicked (action type)', async () => {
      const user = userEvent.setup()
      render(<MenuBar settings={defaultSettings} onSettingsChange={() => {}} />)

      await user.click(screen.getByText('File'))
      expect(screen.getByText('About Pulsar')).toBeInTheDocument()
      await user.click(screen.getByText('About Pulsar'))

      // Non-toggle items close the menu
      expect(screen.queryByText('About Pulsar')).not.toBeInTheDocument()
    })

    it('grid type clicks keep menu open (toggle type)', async () => {
      const user = userEvent.setup()
      render(<MenuBar settings={defaultSettings} onSettingsChange={() => {}} />)

      await user.click(screen.getByText('File'))
      await user.click(screen.getByText('Hex Grid'))

      // Toggle items should NOT close the menu
      expect(screen.getByText('Hex Grid')).toBeInTheDocument()
    })

    it('clicking File again closes the menu', async () => {
      const user = userEvent.setup()
      render(<MenuBar settings={defaultSettings} onSettingsChange={() => {}} />)

      await user.click(screen.getByText('File'))
      expect(screen.getByText('Show Grid')).toBeInTheDocument()

      await user.click(screen.getByText('File'))
      expect(screen.queryByText('Show Grid')).not.toBeInTheDocument()
    })

    it('opening View closes File menu', async () => {
      const user = userEvent.setup()
      render(<MenuBar settings={defaultSettings} onSettingsChange={() => {}} />)

      await user.click(screen.getByText('File'))
      expect(screen.getByText('Show Grid')).toBeInTheDocument()

      await user.click(screen.getByText('View'))
      expect(screen.queryByText('Show Grid')).not.toBeInTheDocument()
      expect(screen.getByText('Dark Theme')).toBeInTheDocument()
    })
  })

  describe('combined settings changes', () => {
    it('can toggle snap off while keeping grid visible', async () => {
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

    it('preserves other settings when changing grid type', async () => {
      const user = userEvent.setup()
      const onSettingsChange = vi.fn()
      const customSettings = { ...defaultSettings, showGrid: false, snapToGrid: false }
      render(<MenuBar settings={customSettings} onSettingsChange={onSettingsChange} />)

      await user.click(screen.getByText('File'))
      await user.click(screen.getByText('Hex Grid'))

      expect(onSettingsChange).toHaveBeenCalledWith({
        showGrid: false,
        snapToGrid: false,
        gridSize: 40,
        gridType: 'hex',
      })
    })
  })
})
