import { useEffect, useRef, useMemo } from 'react'
import { useECSWorld } from '../hooks/useECSWorld.js'
import { useShaderManager } from '../hooks/useShaderManager.js'
import { useSyncConnection } from '../hooks/useSyncConnection.js'
import { initEditor } from '../editor/initEditor.js'
import { EditorContext } from '../editor/context.js'

interface PulsarCanvasProps {
  roomId: string
  userId: string
}

/**
 * PulsarCanvas - The main canvas component.
 *
 * Wraps BlockSuite's EdgelessEditor with:
 * - ECS World integration (components/systems on blocks)
 * - Multiplayer sync via RivetKit actors
 * - WebGL shader overlay system
 */
export function PulsarCanvas({ roomId, userId }: PulsarCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)

  // Initialize BlockSuite editor (stable across re-renders)
  const editorInstance = useMemo(() => initEditor(), [])
  const { editor, collection, doc } = editorInstance

  // Initialize ECS World
  const { world, syncWorldToDoc } = useECSWorld()

  // Initialize shader system
  const { shaderManager: _shaderManager } = useShaderManager(canvasRef)

  // Initialize multiplayer sync
  const { isConnected } = useSyncConnection({
    roomId,
    userId,
    world,
    doc,
  })

  // Mount the BlockSuite editor web component into the DOM
  useEffect(() => {
    const container = editorContainerRef.current
    if (!container) return

    container.replaceChildren()
    container.appendChild(editor)

    // Listen for block-level changes via the Doc's slot system
    // and bridge them to the ECS world
    const disposables: Array<() => void> = []

    const blockUpdated = doc.slots.blockUpdated.on((event) => {
      if (event.type === 'add') {
        world.addEntity(event.id)
        syncWorldToDoc(doc)
      } else if (event.type === 'delete') {
        world.removeEntity(event.id)
      }
    })
    disposables.push(() => blockUpdated.dispose())

    // Initialize the ECS world
    world.init()

    return () => {
      for (const dispose of disposables) {
        dispose()
      }
    }
  }, [editor, doc, world, syncWorldToDoc])

  return (
    <EditorContext.Provider value={{ editor, collection, doc }}>
      <div ref={canvasRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
        <div
          ref={editorContainerRef}
          style={{ width: '100%', height: '100%' }}
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
    </EditorContext.Provider>
  )
}
