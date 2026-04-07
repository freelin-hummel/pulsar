import { useCallback, useEffect, useState } from 'react'
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react'
import { useEditorContext } from '../../editor/context.js'

/**
 * ZoomControls — Bottom-right zoom buttons for the edgeless canvas.
 *
 * Provides Zoom In (+), Zoom Out (−), and Fit to Screen controls.
 * Reads the current zoom level from BlockSuite's viewport and applies
 * changes via the viewport API.
 */

function getEdgelessRoot(editor: unknown): {
  service?: {
    viewport: {
      zoom: number
      setZoom: (zoom: number, center?: { x: number; y: number }) => void
      center: [number, number]
    }
  }
} | null {
  const el = editor as HTMLElement | null
  if (!el || typeof el.querySelector !== 'function') return null
  return el.querySelector('pulsar-edgeless-root') as unknown as ReturnType<typeof getEdgelessRoot>
}

interface ZoomControlsProps {
  /** Override the positioning style */
  style?: React.CSSProperties
}

export function ZoomControls({ style }: ZoomControlsProps) {
  const editorCtx = useEditorContext()
  const [zoomLevel, setZoomLevel] = useState(100)

  // Poll the zoom level from the viewport (BlockSuite doesn't expose a
  // reactive signal we can subscribe to from React)
  useEffect(() => {
    if (!editorCtx) return

    const interval = setInterval(() => {
      const root = getEdgelessRoot(editorCtx.editor)
      if (root?.service?.viewport) {
        setZoomLevel(Math.round(root.service.viewport.zoom * 100))
      }
    }, 200)

    return () => clearInterval(interval)
  }, [editorCtx])

  const handleZoomIn = useCallback(() => {
    if (!editorCtx) return
    const root = getEdgelessRoot(editorCtx.editor)
    if (!root?.service?.viewport) return
    const newZoom = Math.min(root.service.viewport.zoom * 1.25, 5)
    root.service.viewport.setZoom(newZoom)
  }, [editorCtx])

  const handleZoomOut = useCallback(() => {
    if (!editorCtx) return
    const root = getEdgelessRoot(editorCtx.editor)
    if (!root?.service?.viewport) return
    const newZoom = Math.max(root.service.viewport.zoom / 1.25, 0.1)
    root.service.viewport.setZoom(newZoom)
  }, [editorCtx])

  const handleFitToScreen = useCallback(() => {
    if (!editorCtx) return
    const root = getEdgelessRoot(editorCtx.editor)
    if (!root?.service?.viewport) return
    root.service.viewport.setZoom(1)
  }, [editorCtx])

  return (
    <div data-testid="zoom-controls" style={{ ...styles.container, ...style }}>
      <button
        title="Zoom Out"
        aria-label="Zoom Out"
        data-testid="zoom-out"
        onClick={handleZoomOut}
        style={styles.button}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-bg-hover)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
        }}
      >
        <ZoomOut size={14} />
      </button>
      <button
        title="Reset Zoom"
        aria-label="Reset Zoom"
        data-testid="zoom-reset"
        onClick={handleFitToScreen}
        style={styles.levelButton}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-bg-hover)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
        }}
      >
        {zoomLevel}%
      </button>
      <button
        title="Zoom In"
        aria-label="Zoom In"
        data-testid="zoom-in"
        onClick={handleZoomIn}
        style={styles.button}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-bg-hover)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
        }}
      >
        <ZoomIn size={14} />
      </button>
      <div style={styles.divider} />
      <button
        title="Fit to Screen"
        aria-label="Fit to Screen"
        data-testid="zoom-fit"
        onClick={handleFitToScreen}
        style={styles.button}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-bg-hover)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
        }}
      >
        <Maximize size={14} />
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    bottom: 12,
    right: 120,
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
    width: 28,
    height: 28,
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    padding: 0,
    background: 'transparent',
    color: 'var(--color-text-muted)',
    lineHeight: 1,
  },
  levelButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    height: 28,
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    padding: '0 4px',
    background: 'transparent',
    color: 'var(--color-text)',
    fontSize: 11,
    fontFamily: 'var(--font-mono)',
    lineHeight: 1,
  },
  divider: {
    width: 1,
    height: 20,
    background: 'var(--color-border)',
    margin: '0 2px',
  },
}
