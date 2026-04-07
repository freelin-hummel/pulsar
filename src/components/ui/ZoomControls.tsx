import { useCallback, useEffect, useState } from 'react'
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react'
import { useEditorContext } from '../../editor/context.js'
import { getViewport } from '../../editor/edgelessService.js'

/**
 * ZoomControls — Bottom-right zoom buttons for the edgeless canvas.
 *
 * Provides Zoom In (+), Zoom Out (−), and Fit to Screen controls.
 * Reads the current zoom level from the GfxController's viewport
 * (accessed via the editor's DI container) and applies changes via
 * the viewport API.
 */

interface ZoomControlsProps {
  /** Override the positioning style */
  style?: React.CSSProperties
}

export function ZoomControls({ style }: ZoomControlsProps) {
  const editorCtx = useEditorContext()
  const [zoomLevel, setZoomLevel] = useState(100)

  // Poll the zoom level from the viewport
  useEffect(() => {
    if (!editorCtx) return

    const interval = setInterval(() => {
      const vp = getViewport(editorCtx.editor)
      if (vp) {
        setZoomLevel(Math.round(vp.zoom * 100))
      }
    }, 200)

    return () => clearInterval(interval)
  }, [editorCtx])

  const handleZoomIn = useCallback(() => {
    if (!editorCtx) return
    const vp = getViewport(editorCtx.editor)
    if (!vp) return
    const newZoom = Math.min(vp.zoom * 1.25, 5)
    vp.setZoom(newZoom)
  }, [editorCtx])

  const handleZoomOut = useCallback(() => {
    if (!editorCtx) return
    const vp = getViewport(editorCtx.editor)
    if (!vp) return
    const newZoom = Math.max(vp.zoom / 1.25, 0.1)
    vp.setZoom(newZoom)
  }, [editorCtx])

  const handleFitToScreen = useCallback(() => {
    if (!editorCtx) return
    const vp = getViewport(editorCtx.editor)
    if (!vp) return
    vp.setZoom(1)
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
