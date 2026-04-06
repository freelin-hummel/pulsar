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
 * - MenuBar: File menu with global settings (grid, snap)
 * - ScenePicker: top-left, switch scenes + toggle doc/board view
 * - Toolbar: bottom-center, clean SVG icons, no animation
 * - StatusBar: bottom-right, connection & room info
 *
 * Wraps the Pulsar edgeless editor with:
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
  })

  // Initialize the editor (stable across re-renders)
  const editorInstance = useMemo(() => initEditor(), [])
  const { editor, collection, doc } = editorInstance

  // Navigate to a doc by id (used for linked doc clicks and scene switching)
  const navigateToDoc = useCallback(
    (targetId: string) => {
      let targetDoc = collection.getDoc(targetId)
      if (!targetDoc) {
        // Create a new doc if it doesn't exist (e.g. linked doc reference)
        targetDoc = collection.createDoc({ id: targetId })
        targetDoc.load(() => {
          const pageBlockId = targetDoc!.addBlock('pulsar:page', {})
          targetDoc!.addBlock('pulsar:surface', {}, pageBlockId)
          const noteId = targetDoc!.addBlock('pulsar:note', {}, pageBlockId)
          targetDoc!.addBlock('pulsar:paragraph', {}, noteId)
        })
        setScenes((prev) => {
          if (prev.some((s) => s.id === targetId)) return prev
          return [...prev, { id: targetId, label: targetId }]
        })
      } else {
        targetDoc.load()
      }
      editor.doc = targetDoc
      setActiveSceneId(targetId)
    },
    [collection, editor]
  )

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
      navigateToDoc(sceneId)
    },
    [navigateToDoc]
  )

  // Add a new scene
  const handleAddScene = useCallback(() => {
    const idx = scenes.length + 1
    const id = `page${idx}`
    const newDoc = collection.createDoc({ id })
    newDoc.load(() => {
      const pageBlockId = newDoc.addBlock('pulsar:page', {})
      newDoc.addBlock('pulsar:surface', {}, pageBlockId)
      const noteId = newDoc.addBlock('pulsar:note', {}, pageBlockId)
      newDoc.addBlock('pulsar:paragraph', {}, noteId)
    })
    setScenes((prev) => [...prev, { id, label: `Scene ${idx}` }])
    editor.doc = newDoc
    setActiveSceneId(id)
  }, [collection, editor, scenes.length])

  // Mount the editor into the DOM and wire up event bridges
  useEffect(() => {
    const container = editorContainerRef.current
    if (!container) return

    container.replaceChildren()
    container.appendChild(editor)

    const disposables: Array<() => void> = []

    // Bridge block changes to ECS world
    const blockUpdated = doc.slots.blockUpdated.on((event) => {
      if (event.type === 'add') {
        world.addEntity(event.id)
        syncWorldToDoc(doc)
      } else if (event.type === 'delete') {
        world.removeEntity(event.id)
      }
    })
    disposables.push(() => blockUpdated.dispose())

    // Handle linked doc clicks — navigate to the target doc
    const docLinkClicked = editor.slots.docLinkClicked.on(
      (info: { docId?: string; pageId?: string }) => {
        const targetId = info.docId ?? info.pageId
        if (targetId) navigateToDoc(targetId)
      }
    )
    disposables.push(() => docLinkClicked.dispose())

    // Initialize the ECS world
    world.init()

    return () => {
      for (const dispose of disposables) {
        dispose()
      }
    }
  }, [editor, doc, world, syncWorldToDoc, navigateToDoc])

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
