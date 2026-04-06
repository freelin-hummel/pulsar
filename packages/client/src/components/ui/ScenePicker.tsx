import { useState, useRef, useEffect, useCallback } from 'react'
import { Layers, FileText, Layout, Plus, ChevronDown } from 'lucide-react'

export type ViewMode = 'edgeless' | 'page'

interface Scene {
  id: string
  label: string
}

interface ScenePickerProps {
  scenes: Scene[]
  activeSceneId: string
  viewMode: ViewMode
  onSceneChange: (sceneId: string) => void
  onViewModeChange: (mode: ViewMode) => void
  onAddScene: () => void
}

export function ScenePicker({
  scenes,
  activeSceneId,
  viewMode,
  onSceneChange,
  onViewModeChange,
  onAddScene,
}: ScenePickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, close])

  const activeScene = scenes.find((s) => s.id === activeSceneId)

  return (
    <div ref={ref} style={styles.wrapper}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          ...styles.trigger,
          background: open
            ? 'var(--color-bg-active)'
            : 'var(--color-bg-elevated)',
        }}
      >
        <Layers size={14} />
        <span style={styles.label}>{activeScene?.label ?? 'Scene 1'}</span>
        <ChevronDown size={12} />
      </button>

      {open && (
        <div style={styles.dropdown}>
          {/* View mode toggle */}
          <div style={styles.section}>
            <span style={styles.sectionTitle}>View</span>
            <div style={styles.modeRow}>
              <button
                style={{
                  ...styles.modeBtn,
                  background:
                    viewMode === 'edgeless'
                      ? 'var(--color-bg-active)'
                      : 'transparent',
                  color:
                    viewMode === 'edgeless'
                      ? 'var(--color-accent)'
                      : 'var(--color-text-muted)',
                }}
                onClick={() => onViewModeChange('edgeless')}
              >
                <Layout size={13} />
                <span>Board</span>
              </button>
              <button
                style={{
                  ...styles.modeBtn,
                  background:
                    viewMode === 'page'
                      ? 'var(--color-bg-active)'
                      : 'transparent',
                  color:
                    viewMode === 'page'
                      ? 'var(--color-accent)'
                      : 'var(--color-text-muted)',
                }}
                onClick={() => onViewModeChange('page')}
              >
                <FileText size={13} />
                <span>Doc</span>
              </button>
            </div>
          </div>

          {/* Scene list */}
          <div style={styles.separator} />
          <div style={styles.section}>
            <span style={styles.sectionTitle}>Scenes</span>
            <div style={styles.sceneList}>
              {scenes.map((scene) => (
                <button
                  key={scene.id}
                  style={{
                    ...styles.sceneItem,
                    background:
                      scene.id === activeSceneId
                        ? 'var(--color-bg-active)'
                        : 'transparent',
                    color:
                      scene.id === activeSceneId
                        ? 'var(--color-accent)'
                        : 'var(--color-text)',
                  }}
                  onClick={() => {
                    onSceneChange(scene.id)
                    close()
                  }}
                  onMouseEnter={(e) => {
                    if (scene.id !== activeSceneId) {
                      e.currentTarget.style.background =
                        'var(--color-bg-hover)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      scene.id === activeSceneId
                        ? 'var(--color-bg-active)'
                        : 'transparent'
                  }}
                >
                  <Layers size={13} />
                  <span>{scene.label}</span>
                </button>
              ))}
            </div>
            <button
              style={styles.addBtn}
              onClick={() => {
                onAddScene()
                close()
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <Plus size={13} />
              <span>New Scene</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'absolute',
    top: 40,
    left: 8,
    zIndex: 'var(--z-menu)' as unknown as number,
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 10px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text)',
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: 'var(--font-ui)',
    lineHeight: 1,
  },
  label: {
    maxWidth: 120,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    minWidth: 200,
    background: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-menu)',
    padding: '8px 0',
  },
  section: {
    padding: '0 8px',
  },
  sectionTitle: {
    display: 'block',
    fontSize: 10,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    padding: '4px 4px',
    marginBottom: 2,
  },
  modeRow: {
    display: 'flex',
    gap: 4,
  },
  modeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    flex: 1,
    padding: '5px 8px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: 'var(--font-ui)',
    lineHeight: 1,
  },
  separator: {
    height: 1,
    background: 'var(--color-border)',
    margin: '6px 8px',
  },
  sceneList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  sceneItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    padding: '5px 8px',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontSize: 12,
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'var(--font-ui)',
    lineHeight: 1,
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    padding: '5px 8px',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    background: 'transparent',
    color: 'var(--color-text-muted)',
    fontSize: 12,
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'var(--font-ui)',
    marginTop: 2,
    lineHeight: 1,
  },
}
