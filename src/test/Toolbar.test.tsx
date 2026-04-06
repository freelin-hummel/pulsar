import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toolbar } from '../components/ui/Toolbar.js'
import { EditorContext } from '../editor/context.js'

// Mock the editor context so we can test tool switching
function createMockEditorContext() {
  const mockSetEdgelessTool = vi.fn()
  const mockEditor = {
    _edgelessRoot: {
      tools: {
        setEdgelessTool: mockSetEdgelessTool,
      },
      addImages: vi.fn(),
    },
  }
  return {
    editor: mockEditor as unknown as import('../editor/context.js').EditorContextValue['editor'],
    collection: {} as import('../editor/context.js').EditorContextValue['collection'],
    doc: {} as import('../editor/context.js').EditorContextValue['doc'],
    _mock: { mockSetEdgelessTool },
  }
}

function renderToolbar(
  props: Partial<Parameters<typeof Toolbar>[0]> = {},
  editorCtx?: ReturnType<typeof createMockEditorContext>,
) {
  const ctx = editorCtx ?? createMockEditorContext()
  return {
    ...render(
      <EditorContext.Provider value={ctx}>
        <Toolbar {...props} />
      </EditorContext.Provider>
    ),
    mockCtx: ctx,
  }
}

describe('Toolbar', () => {
  describe('rendering', () => {
    it('renders all tools in edit mode', () => {
      renderToolbar({ boardMode: 'edit' })
      expect(screen.getByTestId('toolbar')).toBeInTheDocument()
      expect(screen.getByTestId('tool-select')).toBeInTheDocument()
      expect(screen.getByTestId('tool-hand')).toBeInTheDocument()
      expect(screen.getByTestId('tool-rect')).toBeInTheDocument()
      expect(screen.getByTestId('tool-ellipse')).toBeInTheDocument()
      expect(screen.getByTestId('tool-line')).toBeInTheDocument()
      expect(screen.getByTestId('tool-pen')).toBeInTheDocument()
      expect(screen.getByTestId('tool-text')).toBeInTheDocument()
      expect(screen.getByTestId('tool-note')).toBeInTheDocument()
      expect(screen.getByTestId('tool-image')).toBeInTheDocument()
    })

    it('renders only select and hand in view mode', () => {
      renderToolbar({ boardMode: 'view' })
      expect(screen.getByTestId('tool-select')).toBeInTheDocument()
      expect(screen.getByTestId('tool-hand')).toBeInTheDocument()
      expect(screen.queryByTestId('tool-rect')).not.toBeInTheDocument()
      expect(screen.queryByTestId('tool-pen')).not.toBeInTheDocument()
      expect(screen.queryByTestId('tool-text')).not.toBeInTheDocument()
    })

    it('does not render map tools when isMapBoard is false', () => {
      renderToolbar({ isMapBoard: false, boardMode: 'edit' })
      expect(screen.queryByTestId('map-toolbar')).not.toBeInTheDocument()
    })
  })

  describe('tool selection', () => {
    it('highlights the active tool', () => {
      renderToolbar()
      const selectBtn = screen.getByTestId('tool-select')
      // By default 'select' is active
      expect(selectBtn).toHaveAttribute('data-active', 'true')
    })

    it('switches active tool on click', async () => {
      const user = userEvent.setup()
      renderToolbar()

      const handBtn = screen.getByTestId('tool-hand')
      await user.click(handBtn)

      // hand should now be active
      expect(handBtn).toHaveAttribute('data-active', 'true')
      // select should no longer be active
      expect(screen.getByTestId('tool-select')).toHaveAttribute('data-active', 'false')
    })

    it('calls onToolChange callback when tool changes', async () => {
      const user = userEvent.setup()
      const onToolChange = vi.fn()
      renderToolbar({ onToolChange })

      await user.click(screen.getByTestId('tool-rect'))
      expect(onToolChange).toHaveBeenCalledWith('rect')
    })

    it('calls BlockSuite setEdgelessTool with correct params for select', async () => {
      const user = userEvent.setup()
      const ctx = createMockEditorContext()
      renderToolbar({}, ctx)

      await user.click(screen.getByTestId('tool-select'))
      expect(ctx._mock.mockSetEdgelessTool).toHaveBeenCalledWith({ type: 'default' })
    })

    it('calls BlockSuite setEdgelessTool with correct params for hand/pan', async () => {
      const user = userEvent.setup()
      const ctx = createMockEditorContext()
      renderToolbar({}, ctx)

      await user.click(screen.getByTestId('tool-hand'))
      expect(ctx._mock.mockSetEdgelessTool).toHaveBeenCalledWith({ type: 'pan', panning: true })
    })

    it('calls BlockSuite setEdgelessTool with correct params for rect shape', async () => {
      const user = userEvent.setup()
      const ctx = createMockEditorContext()
      renderToolbar({}, ctx)

      await user.click(screen.getByTestId('tool-rect'))
      expect(ctx._mock.mockSetEdgelessTool).toHaveBeenCalledWith({ type: 'shape', shapeName: 'rect' })
    })

    it('calls BlockSuite setEdgelessTool with correct params for ellipse shape', async () => {
      const user = userEvent.setup()
      const ctx = createMockEditorContext()
      renderToolbar({}, ctx)

      await user.click(screen.getByTestId('tool-ellipse'))
      expect(ctx._mock.mockSetEdgelessTool).toHaveBeenCalledWith({ type: 'shape', shapeName: 'ellipse' })
    })

    it('calls BlockSuite setEdgelessTool with correct params for pen/brush', async () => {
      const user = userEvent.setup()
      const ctx = createMockEditorContext()
      renderToolbar({}, ctx)

      await user.click(screen.getByTestId('tool-pen'))
      expect(ctx._mock.mockSetEdgelessTool).toHaveBeenCalledWith({ type: 'brush' })
    })

    it('calls BlockSuite setEdgelessTool with correct params for text', async () => {
      const user = userEvent.setup()
      const ctx = createMockEditorContext()
      renderToolbar({}, ctx)

      await user.click(screen.getByTestId('tool-text'))
      expect(ctx._mock.mockSetEdgelessTool).toHaveBeenCalledWith({ type: 'text' })
    })

    it('calls BlockSuite setEdgelessTool with correct params for note', async () => {
      const user = userEvent.setup()
      const ctx = createMockEditorContext()
      renderToolbar({}, ctx)

      await user.click(screen.getByTestId('tool-note'))
      expect(ctx._mock.mockSetEdgelessTool).toHaveBeenCalledWith({
        type: 'affine:note',
        childFlavour: 'pulsar:paragraph',
        childType: 'text',
        tip: 'Note',
      })
    })

    it('calls BlockSuite setEdgelessTool with correct params for line/connector', async () => {
      const user = userEvent.setup()
      const ctx = createMockEditorContext()
      renderToolbar({}, ctx)

      await user.click(screen.getByTestId('tool-line'))
      expect(ctx._mock.mockSetEdgelessTool).toHaveBeenCalledWith({ type: 'connector', mode: 0 })
    })
  })

  describe('accessibility', () => {
    it('every tool button has an accessible label', () => {
      renderToolbar({ boardMode: 'edit' })
      const labels = [
        'Select', 'Hand', 'Rectangle', 'Ellipse', 'Line',
        'Draw', 'Text', 'Note', 'Image',
      ]
      for (const label of labels) {
        expect(screen.getByLabelText(label)).toBeInTheDocument()
      }
    })

    it('every tool button has a title tooltip', () => {
      renderToolbar({ boardMode: 'edit' })
      const titles = [
        'Select', 'Hand', 'Rectangle', 'Ellipse', 'Line',
        'Draw', 'Text', 'Note', 'Image',
      ]
      for (const title of titles) {
        expect(screen.getByTitle(title)).toBeInTheDocument()
      }
    })
  })
})
