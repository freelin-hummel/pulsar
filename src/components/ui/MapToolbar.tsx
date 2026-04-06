import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Paintbrush,
  Fence,
  Slash,
  Waves,
  DoorOpen,
  Package,
  Lightbulb,
  ListOrdered,
} from 'lucide-react'
import type { MapTool, TerrainTextureId, MapObjectType } from '../../shared/mapTypes.js'
import { TERRAIN_SWATCHES, MAP_OBJECT_SWATCHES } from '../../shared/mapTypes.js'

interface MapToolDef {
  id: MapTool
  label: string
  icon: React.ReactNode
}

const mapTools: MapToolDef[] = [
  { id: 'terrain', label: 'Terrain', icon: <Paintbrush size={16} /> },
  { id: 'wall', label: 'Wall', icon: <Fence size={16} /> },
  { id: 'wall-diagonal', label: 'Diagonal Wall', icon: <Slash size={16} /> },
  { id: 'wall-cavern', label: 'Cavern Wall', icon: <Waves size={16} /> },
  { id: 'door', label: 'Door', icon: <DoorOpen size={16} /> },
  { id: 'object', label: 'Object', icon: <Package size={16} /> },
  { id: 'light', label: 'Light', icon: <Lightbulb size={16} /> },
  { id: 'legend', label: 'Legend', icon: <ListOrdered size={16} /> },
]

interface MapToolbarProps {
  activeMapTool: MapTool | null
  onMapToolChange: (tool: MapTool | null) => void
  selectedTerrain: TerrainTextureId
  onTerrainChange: (terrain: TerrainTextureId) => void
  selectedObject: MapObjectType
  onObjectChange: (obj: MapObjectType) => void
}

export function MapToolbar({
  activeMapTool,
  onMapToolChange,
  selectedTerrain,
  onTerrainChange,
  selectedObject,
  onObjectChange,
}: MapToolbarProps) {
  const [showPalette, setShowPalette] = useState<'terrain' | 'object' | null>(null)
  const paletteRef = useRef<HTMLDivElement>(null)

  const handleToolClick = useCallback(
    (tool: MapTool) => {
      if (activeMapTool === tool) {
        // Toggle off
        onMapToolChange(null)
        setShowPalette(null)
      } else {
        onMapToolChange(tool)
        // Show palette for tools that need it
        if (tool === 'terrain') {
          setShowPalette('terrain')
        } else if (tool === 'object') {
          setShowPalette('object')
        } else {
          setShowPalette(null)
        }
      }
    },
    [activeMapTool, onMapToolChange],
  )

  // Close palette on outside click
  useEffect(() => {
    if (!showPalette) return
    const handleClick = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        setShowPalette(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showPalette])

  return (
    <div style={styles.container} ref={paletteRef}>
      {/* Palette flyout */}
      {showPalette === 'terrain' && (
        <div style={styles.palette}>
          <span style={styles.paletteTitle}>Terrain</span>
          <div style={styles.swatchGrid}>
            {TERRAIN_SWATCHES.map((swatch) => (
              <button
                key={swatch.id}
                title={swatch.label}
                aria-label={swatch.label}
                onClick={() => onTerrainChange(swatch.id)}
                style={{
                  ...styles.swatch,
                  background: swatch.color,
                  outline:
                    selectedTerrain === swatch.id
                      ? '2px solid var(--color-accent)'
                      : '1px solid var(--color-border)',
                  outlineOffset: selectedTerrain === swatch.id ? -1 : 0,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {showPalette === 'object' && (
        <div style={styles.palette}>
          <span style={styles.paletteTitle}>Objects</span>
          <div style={styles.objectGrid}>
            {MAP_OBJECT_SWATCHES.map((obj) => (
              <button
                key={obj.id}
                title={obj.label}
                aria-label={obj.label}
                onClick={() => onObjectChange(obj.id)}
                style={{
                  ...styles.objectBtn,
                  background:
                    selectedObject === obj.id
                      ? 'var(--color-bg-active)'
                      : 'transparent',
                  color:
                    selectedObject === obj.id
                      ? 'var(--color-accent)'
                      : 'var(--color-text-muted)',
                }}
              >
                <span style={{ fontSize: 16 }}>{obj.icon}</span>
                <span style={{ fontSize: 10 }}>{obj.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Divider from main toolbar */}
      <div style={styles.divider} />

      {/* Map tool buttons */}
      {mapTools.map((tool) => (
        <button
          key={tool.id}
          title={tool.label}
          aria-label={tool.label}
          onClick={() => handleToolClick(tool.id)}
          style={{
            ...styles.button,
            background:
              activeMapTool === tool.id
                ? 'var(--color-bg-active)'
                : 'transparent',
            color:
              activeMapTool === tool.id
                ? 'var(--color-accent)'
                : 'var(--color-text-muted)',
          }}
          onMouseEnter={(e) => {
            if (activeMapTool !== tool.id) {
              e.currentTarget.style.background = 'var(--color-bg-hover)'
              e.currentTarget.style.color = 'var(--color-text)'
            }
          }}
          onMouseLeave={(e) => {
            if (activeMapTool !== tool.id) {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--color-text-muted)'
            }
          }}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    position: 'relative',
  },
  divider: {
    width: 1,
    height: 20,
    background: 'var(--color-border)',
    margin: '0 4px',
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
  palette: {
    position: 'absolute',
    bottom: 'calc(100% + 8px)',
    left: 0,
    background: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-menu)',
    padding: 8,
    minWidth: 180,
  },
  paletteTitle: {
    display: 'block',
    fontSize: 10,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 6,
  },
  swatchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 4,
  },
  swatch: {
    width: 28,
    height: 28,
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
  },
  objectGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 2,
  },
  objectBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    width: 44,
    height: 44,
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontFamily: 'var(--font-ui)',
  },
}
