import { useEffect, useRef } from 'react'
import { Tldraw, type Editor } from 'tldraw'
import 'tldraw/tldraw.css'
import { useECSWorld } from '../hooks/useECSWorld.js'
import { useShaderManager } from '../hooks/useShaderManager.js'
import { useSyncConnection } from '../hooks/useSyncConnection.js'

interface PulsarCanvasProps {
  roomId: string
  userId: string
}

/**
 * PulsarCanvas - The main canvas component.
 *
 * Wraps tldraw with:
 * - ECS World integration (components/systems on shapes)
 * - Multiplayer sync via RivetKit actors
 * - WebGL shader overlay system
 */
export function PulsarCanvas({ roomId, userId }: PulsarCanvasProps) {
  const editorRef = useRef<Editor | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Initialize ECS World
  const { world, syncWorldToEditor } = useECSWorld()

  // Initialize shader system
  const { shaderManager } = useShaderManager(canvasRef)

  // Initialize multiplayer sync
  const { isConnected } = useSyncConnection({
    roomId,
    userId,
    world,
    editor: editorRef.current,
  })

  const handleMount = (editor: Editor) => {
    editorRef.current = editor

    // Sync tldraw shapes to ECS entities
    editor.store.listen(({ changes }) => {
      // Handle added shapes
      for (const record of Object.values(changes.added)) {
        if (record.typeName === 'shape') {
          world.addEntity(record.id)
          syncWorldToEditor(editor)
        }
      }

      // Handle removed shapes
      for (const record of Object.values(changes.removed)) {
        if (record.typeName === 'shape') {
          world.removeEntity(record.id)
        }
      }
    })

    // Initialize the ECS world
    world.init()
  }

  return (
    <div ref={canvasRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Tldraw
        onMount={handleMount}
        inferDarkMode
      />
      {/* Connection status indicator */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 12,
          background: 'rgba(0,0,0,0.5)',
          color: '#fff',
          fontSize: 12,
          fontFamily: 'system-ui, sans-serif',
          zIndex: 1000,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: isConnected ? '#4ECDC4' : '#FF6B6B',
          }}
        />
        {isConnected ? 'Connected' : 'Offline'}
      </div>
    </div>
  )
}
