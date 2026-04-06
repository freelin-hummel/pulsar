import { useState, useRef, useEffect, useCallback } from 'react'
import {
  File,
  Grid3x3,
  Magnet,
  Eye,
  EyeOff,
  Moon,
  Info,
} from 'lucide-react'

export interface GlobalSettings {
  showGrid: boolean
  snapToGrid: boolean
  gridSize: number
}

interface MenuBarProps {
  settings: GlobalSettings
  onSettingsChange: (settings: GlobalSettings) => void
}

interface MenuItem {
  label: string
  icon?: React.ReactNode
  shortcut?: string
  type?: 'toggle' | 'action' | 'separator'
  checked?: boolean
  onAction?: () => void
}

export function MenuBar({ settings, onSettingsChange }: MenuBarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const closeMenu = useCallback(() => setOpenMenu(null), [])

  useEffect(() => {
    if (!openMenu) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [openMenu, closeMenu])

  const fileMenuItems: MenuItem[] = [
    {
      label: 'Show Grid',
      icon: <Grid3x3 size={14} />,
      type: 'toggle',
      checked: settings.showGrid,
      onAction: () =>
        onSettingsChange({ ...settings, showGrid: !settings.showGrid }),
    },
    {
      label: 'Snap to Grid',
      icon: <Magnet size={14} />,
      type: 'toggle',
      checked: settings.snapToGrid,
      onAction: () =>
        onSettingsChange({ ...settings, snapToGrid: !settings.snapToGrid }),
    },
    { label: '', type: 'separator' },
    {
      label: 'About Pulsar',
      icon: <Info size={14} />,
      type: 'action',
      onAction: () => {
        /* no-op for now */
      },
    },
  ]

  const toggleMenu = (name: string) => {
    setOpenMenu((prev) => (prev === name ? null : name))
  }

  return (
    <div ref={menuRef} className="menu-bar" data-testid="menu-bar" style={styles.bar}>
      <MenuButton
        label="File"
        icon={<File size={14} />}
        isOpen={openMenu === 'file'}
        onClick={() => toggleMenu('file')}
        items={fileMenuItems}
        onClose={closeMenu}
      />
      <MenuButton
        label="View"
        icon={openMenu === 'view' ? <EyeOff size={14} /> : <Eye size={14} />}
        isOpen={openMenu === 'view'}
        onClick={() => toggleMenu('view')}
        items={[
          {
            label: 'Dark Theme',
            icon: <Moon size={14} />,
            type: 'toggle',
            checked: true,
            onAction: () => {
              /* always dark for now */
            },
          },
        ]}
        onClose={closeMenu}
      />
    </div>
  )
}

function MenuButton({
  label,
  icon,
  isOpen,
  onClick,
  items,
  onClose,
}: {
  label: string
  icon: React.ReactNode
  isOpen: boolean
  onClick: () => void
  items: MenuItem[]
  onClose: () => void
}) {
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onClick}
        style={{
          ...styles.menuButton,
          background: isOpen ? 'var(--color-bg-active)' : 'transparent',
        }}
      >
        {icon}
        <span>{label}</span>
      </button>
      {isOpen && (
        <div style={styles.dropdown}>
          {items.map((item, i) => {
            if (item.type === 'separator') {
              return <div key={i} style={styles.separator} />
            }
            return (
              <button
                key={item.label}
                style={styles.dropdownItem}
                onClick={() => {
                  item.onAction?.()
                  if (item.type !== 'toggle') onClose()
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-bg-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <span style={styles.itemIcon}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.type === 'toggle' && (
                  <span
                    style={{
                      ...styles.check,
                      opacity: item.checked ? 1 : 0.2,
                    }}
                  >
                    ✓
                  </span>
                )}
                {item.shortcut && (
                  <span style={styles.shortcut}>{item.shortcut}</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    height: 32,
    background: 'var(--color-bg-surface)',
    borderBottom: '1px solid var(--color-border)',
    padding: '0 4px',
    zIndex: 'var(--z-menu)' as unknown as number,
    position: 'relative',
    flexShrink: 0,
  },
  menuButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 8px',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text)',
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: 'var(--font-ui)',
    lineHeight: 1,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    minWidth: 200,
    background: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-menu)',
    padding: '4px 0',
    zIndex: 'var(--z-menu)' as unknown as number,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '6px 12px',
    border: 'none',
    background: 'transparent',
    color: 'var(--color-text)',
    fontSize: 12,
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'var(--font-ui)',
    lineHeight: 1,
  },
  separator: {
    height: 1,
    background: 'var(--color-border)',
    margin: '4px 8px',
  },
  itemIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    flexShrink: 0,
  },
  check: {
    fontSize: 11,
    color: 'var(--color-accent)',
    fontWeight: 600,
  },
  shortcut: {
    fontSize: 11,
    color: 'var(--color-text-muted)',
    fontFamily: 'var(--font-mono)',
  },
}
