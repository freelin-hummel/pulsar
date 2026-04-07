import { useState, useCallback, useRef, useEffect } from 'react'
import { Lightbulb } from 'lucide-react'
import type { LightFalloff } from '../../shared/mapTypes.js'

interface LightPropertiesProps {
  radius: number
  color: string
  intensity: number
  falloff: LightFalloff
  castShadows: boolean
  onUpdate: (props: {
    radius: number
    color: string
    intensity: number
    falloff: LightFalloff
    castShadows: boolean
  }) => void
  onClose: () => void
}

export function LightProperties({
  radius,
  color,
  intensity,
  falloff,
  castShadows,
  onUpdate,
  onClose,
}: LightPropertiesProps) {
  const [localRadius, setLocalRadius] = useState(radius)
  const [localColor, setLocalColor] = useState(color)
  const [localIntensity, setLocalIntensity] = useState(intensity)
  const [localFalloff, setLocalFalloff] = useState(falloff)
  const [localShadows, setLocalShadows] = useState(castShadows)
  const ref = useRef<HTMLDivElement>(null)

  // Sync incoming props
  useEffect(() => {
    setLocalRadius(radius)
    setLocalColor(color)
    setLocalIntensity(intensity)
    setLocalFalloff(falloff)
    setLocalShadows(castShadows)
  }, [radius, color, intensity, falloff, castShadows])

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const commit = useCallback(() => {
    onUpdate({
      radius: localRadius,
      color: localColor,
      intensity: localIntensity,
      falloff: localFalloff,
      castShadows: localShadows,
    })
  }, [localRadius, localColor, localIntensity, localFalloff, localShadows, onUpdate])

  return (
    <div ref={ref} style={styles.panel}>
      <div style={styles.header}>
        <Lightbulb size={14} />
        <span style={styles.title}>Light Properties</span>
      </div>

      {/* Radius */}
      <div style={styles.field}>
        <label style={styles.fieldLabel}>Radius</label>
        <input
          type="range"
          min={5}
          max={100}
          step={1}
          value={localRadius}
          onChange={(e) => {
            setLocalRadius(Number(e.target.value))
            commit()
          }}
          style={styles.slider}
        />
        <span style={styles.fieldValue}>{localRadius}</span>
      </div>

      {/* Color */}
      <div style={styles.field}>
        <label style={styles.fieldLabel}>Color</label>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <input
            type="color"
            value={localColor}
            onChange={(e) => {
              setLocalColor(e.target.value)
              commit()
            }}
            style={styles.colorPicker}
          />
          <input
            type="text"
            value={localColor}
            onChange={(e) => {
              setLocalColor(e.target.value)
              commit()
            }}
            style={styles.textInput}
            maxLength={7}
          />
        </div>
      </div>

      {/* Intensity */}
      <div style={styles.field}>
        <label style={styles.fieldLabel}>Intensity</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={localIntensity}
          onChange={(e) => {
            setLocalIntensity(Number(e.target.value))
            commit()
          }}
          style={styles.slider}
        />
        <span style={styles.fieldValue}>{localIntensity.toFixed(2)}</span>
      </div>

      {/* Falloff */}
      <div style={styles.field}>
        <label style={styles.fieldLabel}>Falloff</label>
        <div style={styles.falloffRow}>
          {(['none', 'linear', 'quadratic'] as const).map((f) => (
            <button
              key={f}
              style={{
                ...styles.falloffBtn,
                background: localFalloff === f ? 'var(--color-bg-active)' : 'transparent',
                color: localFalloff === f ? 'var(--color-accent)' : 'var(--color-text-muted)',
              }}
              onClick={() => {
                setLocalFalloff(f)
                commit()
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Cast Shadows */}
      <div style={styles.field}>
        <label style={styles.fieldLabel}>Cast Shadows</label>
        <button
          style={{
            ...styles.toggleBtn,
            background: localShadows ? 'var(--color-bg-active)' : 'transparent',
            color: localShadows ? 'var(--color-accent)' : 'var(--color-text-muted)',
          }}
          onClick={() => {
            setLocalShadows(!localShadows)
            commit()
          }}
        >
          {localShadows ? 'On' : 'Off'}
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'absolute',
    right: 8,
    top: 80,
    width: 220,
    background: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-menu)',
    padding: 12,
    zIndex: 'var(--z-overlay)' as unknown as number,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: 'var(--color-text)',
    marginBottom: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'var(--font-ui)',
  },
  field: {
    marginBottom: 8,
  },
  fieldLabel: {
    display: 'block',
    fontSize: 10,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 4,
    fontFamily: 'var(--font-ui)',
  },
  fieldValue: {
    fontSize: 11,
    color: 'var(--color-text-muted)',
    fontFamily: 'var(--font-mono)',
    marginLeft: 4,
  },
  slider: {
    width: '100%',
    cursor: 'pointer',
  },
  colorPicker: {
    width: 24,
    height: 24,
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    padding: 0,
  },
  textInput: {
    flex: 1,
    padding: '3px 6px',
    background: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text)',
    fontSize: 11,
    fontFamily: 'var(--font-mono)',
  },
  falloffRow: {
    display: 'flex',
    gap: 4,
  },
  falloffBtn: {
    flex: 1,
    padding: '3px 6px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 10,
    cursor: 'pointer',
    fontFamily: 'var(--font-ui)',
    textTransform: 'capitalize' as const,
  },
  toggleBtn: {
    padding: '3px 10px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 11,
    cursor: 'pointer',
    fontFamily: 'var(--font-ui)',
  },
}
