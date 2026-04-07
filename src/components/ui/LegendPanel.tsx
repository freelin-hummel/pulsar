import { useCallback } from 'react'
import { MapPin, Trash2, MoveRight } from 'lucide-react'

export interface LegendEntry {
  entityId: string
  number: number
  text: string
}

interface LegendPanelProps {
  entries: LegendEntry[]
  onEntryClick: (entityId: string) => void
  onEntryRemove: (entityId: string) => void
  onClose: () => void
}

export function LegendPanel({
  entries,
  onEntryClick,
  onEntryRemove,
  onClose,
}: LegendPanelProps) {
  const handleEntryClick = useCallback(
    (entityId: string) => {
      onEntryClick(entityId)
    },
    [onEntryClick],
  )

  if (entries.length === 0) return null

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <MapPin size={14} />
        <span style={styles.title}>Legend</span>
        <button
          style={styles.closeBtn}
          onClick={onClose}
          aria-label="Close legend panel"
        >
          ×
        </button>
      </div>

      <div style={styles.list}>
        {entries.map((entry) => (
          <div key={entry.entityId} style={styles.entry}>
            <span style={styles.number}>{entry.number}</span>
            <span style={styles.text}>{entry.text || '(unnamed)'}</span>
            <div style={styles.actions}>
              <button
                style={styles.actionBtn}
                title="Go to pin"
                aria-label={`Go to legend pin ${entry.number}`}
                onClick={() => handleEntryClick(entry.entityId)}
              >
                <MoveRight size={11} />
              </button>
              <button
                style={styles.actionBtn}
                title="Remove"
                aria-label={`Remove legend entry ${entry.number}`}
                onClick={() => onEntryRemove(entry.entityId)}
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'absolute',
    right: 8,
    top: 80,
    width: 240,
    maxHeight: 'calc(100vh - 160px)',
    background: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-menu)',
    zIndex: 'var(--z-overlay)' as unknown as number,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 12px',
    borderBottom: '1px solid var(--color-border)',
    color: 'var(--color-text)',
  },
  title: {
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'var(--font-ui)',
    flex: 1,
  },
  closeBtn: {
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    background: 'transparent',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: 'var(--font-ui)',
  },
  list: {
    overflow: 'auto',
    padding: 4,
  },
  entry: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 8px',
    borderRadius: 'var(--radius-sm)',
  },
  number: {
    width: 22,
    height: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    background: 'var(--color-accent)',
    color: 'var(--color-bg)',
    fontSize: 11,
    fontWeight: 700,
    fontFamily: 'var(--font-ui)',
    flexShrink: 0,
  },
  text: {
    flex: 1,
    fontSize: 12,
    color: 'var(--color-text)',
    fontFamily: 'var(--font-ui)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  actions: {
    display: 'flex',
    gap: 2,
    flexShrink: 0,
  },
  actionBtn: {
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    background: 'transparent',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
  },
}
