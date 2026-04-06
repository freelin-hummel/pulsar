import { Wifi, WifiOff } from 'lucide-react'

interface StatusBarProps {
  isConnected: boolean
  roomId: string
}

export function StatusBar({ isConnected, roomId }: StatusBarProps) {
  return (
    <div style={styles.bar}>
      <div style={styles.group}>
        {isConnected ? (
          <Wifi size={12} style={{ color: 'var(--color-success)' }} />
        ) : (
          <WifiOff size={12} style={{ color: 'var(--color-text-muted)' }} />
        )}
        <span
          style={{
            color: isConnected
              ? 'var(--color-success)'
              : 'var(--color-text-muted)',
          }}
        >
          {isConnected ? 'Connected' : 'Offline'}
        </span>
      </div>
      <span style={styles.divider}>·</span>
      <span style={styles.muted}>{roomId}</span>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 10px',
    background: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    fontSize: 11,
    fontFamily: 'var(--font-ui)',
    zIndex: 'var(--z-toolbar)' as unknown as number,
    pointerEvents: 'none',
    userSelect: 'none',
  },
  group: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  divider: {
    color: 'var(--color-text-muted)',
  },
  muted: {
    color: 'var(--color-text-muted)',
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
  },
}
