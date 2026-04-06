import { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import { useECSWorld } from '../hooks/useECSWorld.js'
import { useShaderManager } from '../hooks/useShaderManager.js'
import { useSyncConnection } from '../hooks/useSyncConnection.js'
import { initEditor } from '../editor/initEditor.js'
import { EditorContext } from '../editor/context.js'
import { MenuBar, type GlobalSettings } from './ui/MenuBar.js'
import { ScenePicker, type ViewMode } from './ui/ScenePicker.js'
import { Toolbar } from './ui/Toolbar.js'
import { StatusBar } from './ui/StatusBar.js'

interface PulsarCanvasProps {
  roomId: string
  userId: string
}

interface Scene {
  id: string
  label: string
}

/**
 * PulsarCanvas - The main canvas component.
 *
 * All UI is rendered in-scene (no separate pages):
 * - MenuBar: File menu with global settings (grid, snap, extensions)
 * - ScenePicker: top-left, switch scenes + toggle doc/board view
 * - Toolbar: bottom-center, clean SVG icons, no animation
 * - StatusBar: bottom-right, connection & room info
 *
 * Wraps BlockSuite's EdgelessEditor with:
 * - ECS World integration (components/systems on blocks)
 * - Multiplayer sync via RivetKit actors
 * - WebGL shader overlay system
 */
export function PulsarCanvas({ roomId, userId }: PulsarCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)

  // Scene management
  const [scenes, setScenes] = useState<Scene[]>([
    { id: 'page1', label: 'Scene 1' },
  ])
  const [activeSceneId, setActiveSceneId] = useState('page1')
  const [viewMode, setViewMode] = useState<ViewMode>('edgeless')

  // Global settings
  const [settings, setSettings] = useState<GlobalSettings>({
    showGrid: true,
    snapToGrid: true,
    gridSize: 20,
    showExtensions: false,
  })

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

  // Toggle between doc (page) and board (edgeless) view
  useEffect(() => {
    editor.mode = viewMode === 'page' ? 'page' : 'edgeless'
  }, [editor, viewMode])

  // Handle scene switch
  const handleSceneChange = useCallback(
    (sceneId: string) => {
      const existing = collection.getDoc(sceneId)
      if (existing) {
        existing.load()
        editor.doc = existing
        setActiveSceneId(sceneId)
      }
    },
    [collection, editor]
  )

  // Add a new scene
  const handleAddScene = useCallback(() => {
    const idx = scenes.length + 1
    const id = `page${idx}`
    const newDoc = collection.createDoc({ id })
    newDoc.load(() => {
      const pageBlockId = newDoc.addBlock('affine:page', {})
      newDoc.addBlock('affine:surface', {}, pageBlockId)
      const noteId = newDoc.addBlock('affine:note', {}, pageBlockId)
      newDoc.addBlock('affine:paragraph', {}, noteId)
    })
    setScenes((prev) => [...prev, { id, label: `Scene ${idx}` }])
    editor.doc = newDoc
    setActiveSceneId(id)
  }, [collection, editor, scenes.length])

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
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Top menu bar */}
        <MenuBar settings={settings} onSettingsChange={setSettings} />

        {/* Main canvas area */}
        <div
          ref={canvasRef}
          style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
        >
          <div
            ref={editorContainerRef}
            style={{ width: '100%', height: '100%' }}
          />

          {/* Scene picker — top left */}
          <ScenePicker
            scenes={scenes}
            activeSceneId={activeSceneId}
            viewMode={viewMode}
            onSceneChange={handleSceneChange}
            onViewModeChange={setViewMode}
            onAddScene={handleAddScene}
          />

          {/* Drawing toolbar — bottom center */}
          <Toolbar />

          {/* Status bar — bottom right */}
          <StatusBar isConnected={isConnected} roomId={roomId} />
        </div>
      </div>
    </EditorContext.Provider>
  )
}
