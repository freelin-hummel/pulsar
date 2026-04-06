import { useState, useCallback } from 'react'
import {
  MousePointer2,
  Hand,
  Square,
  Circle,
  Type,
  Pencil,
  StickyNote,
  Image,
  Minus,
} from 'lucide-react'
import { useEditorContext } from '../../editor/context.js'
import type { MapTool, TerrainTextureId, MapObjectType } from '../../shared/mapTypes.js'
import type { BoardMode } from '../../shared/board.js'
import { MapToolbar } from './MapToolbar.js'

type Tool =
  | 'select'
  | 'hand'
  | 'rect'
  | 'ellipse'
  | 'text'
  | 'pen'
  | 'note'
  | 'image'
  | 'line'

interface ToolDef {
  id: Tool
  label: string
  icon: React.ReactNode
  /** Available in view mode */
  viewMode?: boolean
}

const tools: ToolDef[] = [
  { id: 'select', label: 'Select', icon: <MousePointer2 size={16} />, viewMode: true },
  { id: 'hand', label: 'Hand', icon: <Hand size={16} />, viewMode: true },
  { id: 'rect', label: 'Rectangle', icon: <Square size={16} /> },
  { id: 'ellipse', label: 'Ellipse', icon: <Circle size={16} /> },
  { id: 'line', label: 'Line', icon: <Minus size={16} /> },
  { id: 'pen', label: 'Draw', icon: <Pencil size={16} /> },
  { id: 'text', label: 'Text', icon: <Type size={16} /> },
  { id: 'note', label: 'Note', icon: <StickyNote size={16} /> },
  { id: 'image', label: 'Image', icon: <Image size={16} /> },
]

/**
 * Map our tool IDs to BlockSuite EdgelessTool objects.
 */
function toEdgelessTool(tool: Tool): Record<string, unknown> | null {
  switch (tool) {
    case 'select':
      return { type: 'default' }
    case 'hand':
      return { type: 'pan', panning: true }
    case 'rect':
      return { type: 'shape', shapeName: 'rect' }
    case 'ellipse':
      return { type: 'shape', shapeName: 'ellipse' }
    case 'line':
      return { type: 'connector', mode: 0 }
    case 'pen':
      return { type: 'brush' }
    case 'text':
      return { type: 'text' }
    case 'note':
      return { type: 'affine:note', childFlavour: 'pulsar:paragraph', childType: 'text', tip: 'Note' }
    case 'image':
      // Image insertion is handled by triggering a file input, not a tool switch
      return null
    default:
      return { type: 'default' }
  }
}

/**
 * Safely retrieve the edgeless root block component from the mounted editor.
 *
 * BlockSuite's PulsarEditorContainer is a shadowless Lit element that renders
 * `<pulsar-edgeless-root>` into the light DOM when in edgeless mode.  The
 * private `_edgelessRoot` accessor created by the `@query` decorator is backed
 * by a TC39 private field and is not accessible from outside the class.  We
 * use a plain DOM querySelector instead which works identically.
 */
function getEdgelessRoot(editor: unknown): {
  tools?: { setEdgelessTool: (tool: Record<string, unknown>) => void }
  addImages?: (files: File[]) => Promise<string[]>
} | null {
  const el = editor as HTMLElement | null
  if (!el || typeof el.querySelector !== 'function') return null
  return el.querySelector('pulsar-edgeless-root') as unknown as ReturnType<typeof getEdgelessRoot>
}

interface ToolbarProps {
  activeTool?: Tool
  onToolChange?: (tool: Tool) => void
  /** Current board mode — in 'view' mode, only select/hand are available */
  boardMode?: BoardMode
  /** Whether the active board is a map (shows map tools) */
  isMapBoard?: boolean
  /** Map tool state */
  activeMapTool?: MapTool | null
  onMapToolChange?: (tool: MapTool | null) => void
  selectedTerrain?: TerrainTextureId
  onTerrainChange?: (terrain: TerrainTextureId) => void
  selectedObject?: MapObjectType
  onObjectChange?: (obj: MapObjectType) => void
}

export function Toolbar({
  activeTool: controlledTool,
  onToolChange,
  boardMode = 'edit',
  isMapBoard = false,
  activeMapTool = null,
  onMapToolChange,
  selectedTerrain = 'stone',
  onTerrainChange,
  selectedObject = 'crate',
  onObjectChange,
}: ToolbarProps) {
  const [internalTool, setInternalTool] = useState<Tool>('select')
  const activeTool = controlledTool ?? internalTool
  const editorCtx = useEditorContext()

  const handleToolChange = useCallback(
    (tool: Tool) => {
      setInternalTool(tool)
      onToolChange?.(tool)

      if (!editorCtx) return
      const { editor } = editorCtx

      // For image tool, prompt file picker instead of switching tool
      if (tool === 'image') {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.multiple = true
        input.onchange = () => {
          const files = Array.from(input.files ?? [])
          if (files.length === 0) return
          const edgelessRoot = getEdgelessRoot(editor)
          if (edgelessRoot?.addImages) {
            edgelessRoot.addImages(files)
          }
        }
        input.click()
        return
      }

      const edgelessTool = toEdgelessTool(tool)
      if (!edgelessTool) return

      const edgelessRoot = getEdgelessRoot(editor)
      if (edgelessRoot?.tools) {
        edgelessRoot.tools.setEdgelessTool(edgelessTool)
      }
    },
    [editorCtx, onToolChange]
  )

  // Filter tools based on board mode
  const visibleTools = boardMode === 'view'
    ? tools.filter((t) => t.viewMode)
    : tools

  return (
    <div className="toolbar" data-testid="toolbar" style={styles.bar}>
      {visibleTools.map((tool) => (
        <button
          key={tool.id}
          title={tool.label}
          aria-label={tool.label}
          data-testid={`tool-${tool.id}`}
          data-active={activeTool === tool.id}
          onClick={() => handleToolChange(tool.id)}
          style={{
            ...styles.button,
            background:
              activeTool === tool.id
                ? 'var(--color-bg-active)'
                : 'transparent',
            color:
              activeTool === tool.id
                ? 'var(--color-accent)'
                : 'var(--color-text-muted)',
          }}
          onMouseEnter={(e) => {
            if (activeTool !== tool.id) {
              e.currentTarget.style.background = 'var(--color-bg-hover)'
              e.currentTarget.style.color = 'var(--color-text)'
            }
          }}
          onMouseLeave={(e) => {
            if (activeTool !== tool.id) {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--color-text-muted)'
            }
          }}
        >
          {tool.icon}
        </button>
      ))}

      {/* Map tools — shown only when active board is a map in edit mode */}
      {isMapBoard && boardMode === 'edit' && (
        <MapToolbar
          activeMapTool={activeMapTool}
          onMapToolChange={onMapToolChange ?? (() => {})}
          selectedTerrain={selectedTerrain}
          onTerrainChange={onTerrainChange ?? (() => {})}
          selectedObject={selectedObject}
          onObjectChange={onObjectChange ?? (() => {})}
        />
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    position: 'absolute',
    bottom: 12,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    padding: '4px',
    background: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-menu)',
    zIndex: 'var(--z-toolbar)' as unknown as number,
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
  },
}
