import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Layers,
  FileText,
  Layout,
  Plus,
  ChevronDown,
  Map,
  Film,
  Pencil,
  Eye,
} from 'lucide-react'
import type { BoardDescriptor, BoardKind, BoardMode } from '../../shared/board.js'

export type ViewMode = 'edgeless' | 'page'

interface BoardPickerProps {
  boards: BoardDescriptor[]
  activeBoardId: string
  viewMode: ViewMode
  boardMode: BoardMode
  userRole: 'gm' | 'player'
  onBoardChange: (boardId: string) => void
  onViewModeChange: (mode: ViewMode) => void
  onBoardModeChange: (mode: BoardMode) => void
  onAddBoard: (kind: BoardKind) => void
}

function boardIcon(kind: BoardKind, size: number) {
  switch (kind) {
    case 'map':
      return <Map size={size} />
    case 'scene':
    default:
      return <Film size={size} />
  }
}

export function BoardPicker({
  boards,
  activeBoardId,
  viewMode,
  boardMode,
  userRole,
  onBoardChange,
  onViewModeChange,
  onBoardModeChange,
  onAddBoard,
}: BoardPickerProps) {
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

  const activeBoard = boards.find((b) => b.id === activeBoardId)

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
        {activeBoard ? boardIcon(activeBoard.kind, 14) : <Layers size={14} />}
        <span style={styles.label}>{activeBoard?.label ?? 'Board 1'}</span>
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

          {/* Edit/View mode toggle (GM only) */}
          {userRole === 'gm' && (
            <>
              <div style={styles.separator} />
              <div style={styles.section}>
                <span style={styles.sectionTitle}>Mode</span>
                <div style={styles.modeRow}>
                  <button
                    style={{
                      ...styles.modeBtn,
                      background:
                        boardMode === 'edit'
                          ? 'var(--color-bg-active)'
                          : 'transparent',
                      color:
                        boardMode === 'edit'
                          ? 'var(--color-accent)'
                          : 'var(--color-text-muted)',
                    }}
                    onClick={() => onBoardModeChange('edit')}
                  >
                    <Pencil size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    style={{
                      ...styles.modeBtn,
                      background:
                        boardMode === 'view'
                          ? 'var(--color-bg-active)'
                          : 'transparent',
                      color:
                        boardMode === 'view'
                          ? 'var(--color-accent)'
                          : 'var(--color-text-muted)',
                    }}
                    onClick={() => onBoardModeChange('view')}
                  >
                    <Eye size={13} />
                    <span>View</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Board list */}
          <div style={styles.separator} />
          <div style={styles.section}>
            <span style={styles.sectionTitle}>Boards</span>
            <div style={styles.sceneList}>
              {boards.map((board) => (
                <button
                  key={board.id}
                  style={{
                    ...styles.sceneItem,
                    background:
                      board.id === activeBoardId
                        ? 'var(--color-bg-active)'
                        : 'transparent',
                    color:
                      board.id === activeBoardId
                        ? 'var(--color-accent)'
                        : 'var(--color-text)',
                  }}
                  onClick={() => {
                    onBoardChange(board.id)
                    close()
                  }}
                  onMouseEnter={(e) => {
                    if (board.id !== activeBoardId) {
                      e.currentTarget.style.background =
                        'var(--color-bg-hover)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      board.id === activeBoardId
                        ? 'var(--color-bg-active)'
                        : 'transparent'
                  }}
                >
                  {boardIcon(board.kind, 13)}
                  <span>{board.label}</span>
                  <span style={styles.kindBadge}>{board.kind}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
              <button
                style={{ ...styles.addBtn, flex: 1 }}
                onClick={() => {
                  onAddBoard('scene')
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
                <span>Scene</span>
              </button>
              <button
                style={{ ...styles.addBtn, flex: 1 }}
                onClick={() => {
                  onAddBoard('map')
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
                <span>Map</span>
              </button>
            </div>
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
    minWidth: 220,
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
  kindBadge: {
    marginLeft: 'auto',
    fontSize: 9,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    opacity: 0.6,
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
    lineHeight: 1,
  },
}
