import { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import { useECSWorld } from '../hooks/useECSWorld.js'
import { useShaderManager } from '../hooks/useShaderManager.js'
import { useSyncConnection } from '../hooks/useSyncConnection.js'
import { initEditor } from '../editor/initEditor.js'
import { EditorContext } from '../editor/context.js'
import { MenuBar, type GlobalSettings } from './ui/MenuBar.js'
import { BoardPicker, type ViewMode } from './ui/BoardPicker.js'
import { Toolbar } from './ui/Toolbar.js'
import { StatusBar } from './ui/StatusBar.js'
import { MapEventOverlay } from './ui/MapEventOverlay.js'
import { LegendPanel, type LegendEntry } from './ui/LegendPanel.js'
import { LightProperties } from './ui/LightProperties.js'
import { ZoomControls } from './ui/ZoomControls.js'
import { MapExtension } from '../lib/extensions/map/index.js'
import { GridShader } from '../lib/shaders/programs/GridShader.js'
import {
  createTerrainElement,
  createWallElement,
  createDoorElement,
  createObjectElement,
  createLightElement,
  createLegendElement,
} from '../lib/mapSurfaceBridge.js'
import type { BoardDescriptor, BoardKind, BoardMode } from '../shared/board.js'
import { createBoard } from '../shared/board.js'
import type {
  MapTool,
  TerrainTextureId,
  MapObjectType,
  GridPoint,
  LightFalloff,
} from '../shared/mapTypes.js'
import type { GridConfig } from '../shared/grid.js'

interface PulsarCanvasProps {
  roomId: string
  userId: string
}

/**
 * PulsarCanvas - The main canvas component.
 *
 * All UI is rendered in-scene (no separate pages):
 * - MenuBar: File menu with global settings (grid, snap)
 * - BoardPicker: top-left, switch boards + toggle doc/board view + edit/view mode
 * - Toolbar: bottom-center, clean SVG icons, contextual map tools
 * - StatusBar: bottom-right, connection & room info
 * - MapEventOverlay: transparent pointer layer for map editing
 * - LegendPanel: right sidebar for map legend entries
 * - LightProperties: right panel for editing light node properties
 *
 * Wraps the Pulsar edgeless editor with:
 * - ECS World integration (components/systems on blocks)
 * - Multiplayer sync via RivetKit actors
 * - WebGL shader overlay system
 * - Map extension for terrain, walls, doors, objects, lighting, legends
 */
export function PulsarCanvas({ roomId, userId }: PulsarCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)

  // Board management (replaces scene management)
  const [boards, setBoards] = useState<BoardDescriptor[]>([
    createBoard('page1', 'Scene 1', 'scene'),
  ])
  const [activeBoardId, setActiveBoardId] = useState('page1')
  const [viewMode, setViewMode] = useState<ViewMode>('edgeless')
  const [boardMode, setBoardMode] = useState<BoardMode>('edit')

  // Map editing state
  const [activeMapTool, setActiveMapTool] = useState<MapTool | null>(null)
  const [selectedTerrain, setSelectedTerrain] = useState<TerrainTextureId>('stone')
  const [selectedObject, setSelectedObject] = useState<MapObjectType>('crate')
  const [legendEntries, setLegendEntries] = useState<LegendEntry[]>([])
  const [showLegend, setShowLegend] = useState(false)
  const [selectedLightEntity, setSelectedLightEntity] = useState<string | null>(null)
  const [lightProps, setLightProps] = useState({
    radius: 30,
    color: '#ffcc66',
    intensity: 0.8,
    falloff: 'quadratic' as LightFalloff,
    castShadows: true,
  })
  const mapExtensionInstalled = useRef(false)

  // Global settings
  const [settings, setSettings] = useState<GlobalSettings>({
    showGrid: true,
    snapToGrid: true,
    gridSize: 40,
    gridType: 'square',
  })

  // Derived state
  const activeBoard = boards.find((b) => b.id === activeBoardId)
  const isMapBoard = activeBoard?.kind === 'map'

  // Initialize the editor (stable across re-renders)
  const editorInstance = useMemo(() => initEditor(), [])
  const { editor, collection, doc } = editorInstance

  // Navigate to a doc by id (used for linked doc clicks and board switching)
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
        setBoards((prev) => {
          if (prev.some((b) => b.id === targetId)) return prev
          return [...prev, createBoard(targetId, targetId, 'scene')]
        })
      } else {
        targetDoc.load()
      }
      editor.doc = targetDoc
      setActiveBoardId(targetId)
    },
    [collection, editor]
  )

  // Initialize ECS World
  const { world, syncWorldToDoc } = useECSWorld()

  // Initialize shader system
  const { shaderManager: shaderManagerRef } = useShaderManager(canvasRef)

  // Initialize multiplayer sync
  const { isConnected } = useSyncConnection({
    roomId,
    userId,
    world,
    doc,
  })

  // Install map extension when a map board is first activated
  useEffect(() => {
    if (isMapBoard && !mapExtensionInstalled.current) {
      MapExtension.install(world)
      mapExtensionInstalled.current = true
    }
  }, [isMapBoard, world])

  // Derive grid configuration for the coordinate library
  const gridConfig: GridConfig = useMemo(
    () => ({ type: settings.gridType, cellSize: settings.gridSize }),
    [settings.gridType, settings.gridSize]
  )

  // Toggle between doc (page) and board (edgeless) view
  useEffect(() => {
    editor.mode = viewMode === 'page' ? 'page' : 'edgeless'
  }, [editor, viewMode])

  // Disable BlockSuite's built-in CSS dot grid so our WebGL grid is the only one
  useEffect(() => {
    const el = editorContainerRef.current
    if (!el) return
    el.style.setProperty('--pulsar-edgeless-grid-color', 'transparent')
  }, [])

  // Update WebGL grid shader when settings change
  useEffect(() => {
    const mgr = shaderManagerRef.current
    if (!mgr) return
    let shader = mgr.getProgram('grid') as GridShader | undefined
    if (!shader) {
      shader = new GridShader()
      mgr.registerProgram('grid', shader)
    }
    shader.gridType = settings.gridType
    shader.cellSize = settings.gridSize
    shader.visible = settings.showGrid
  }, [settings.showGrid, settings.gridType, settings.gridSize, shaderManagerRef])

  // Handle board switch
  const handleBoardChange = useCallback(
    (boardId: string) => {
      navigateToDoc(boardId)
      // Clear map tool when switching boards
      setActiveMapTool(null)
      setSelectedLightEntity(null)
    },
    [navigateToDoc]
  )

  // Add a new board
  const handleAddBoard = useCallback(
    (kind: BoardKind) => {
      const idx = boards.length + 1
      const id = `page${idx}`
      const label = kind === 'map' ? `Map ${idx}` : `Scene ${idx}`
      const newDoc = collection.createDoc({ id })
      newDoc.load(() => {
        const pageBlockId = newDoc.addBlock('pulsar:page', {})
        newDoc.addBlock('pulsar:surface', {}, pageBlockId)
        const noteId = newDoc.addBlock('pulsar:note', {}, pageBlockId)
        newDoc.addBlock('pulsar:paragraph', {}, noteId)
      })
      setBoards((prev) => [...prev, createBoard(id, label, kind)])
      editor.doc = newDoc
      setActiveBoardId(id)
      setActiveMapTool(null)
      setSelectedLightEntity(null)
    },
    [collection, editor, boards.length]
  )

  // ── Map tool event handlers ──

  const handleTerrainPaint = useCallback(
    (cells: GridPoint[]) => {
      // Create terrain entities for each painted cell
      for (const cell of cells) {
        const entityId = `terrain_${cell.x}_${cell.y}`
        if (!world.hasEntity(entityId)) {
          world.addEntity(entityId)
        }
        const terrainType = { name: 'map:terrain', defaults: () => ({ textureId: selectedTerrain, elevation: 0 }) }
        world.addComponent(entityId, terrainType, { textureId: selectedTerrain })

        // Create a visible surface element on the BlockSuite canvas
        createTerrainElement(editor, cell, selectedTerrain, settings.gridSize)
      }
    },
    [world, selectedTerrain, editor, settings.gridSize]
  )

  const handleWallDraw = useCallback(
    (points: GridPoint[], wallType: 'standard' | 'diagonal' | 'cavern') => {
      const entityId = `wall_${Date.now()}`
      world.addEntity(entityId)
      const wallCompType = {
        name: 'map:wall',
        defaults: () => ({
          points: [] as GridPoint[],
          thickness: 2,
          material: 'stone',
          wallType: 'standard' as string,
          seed: 0,
        }),
      }
      world.addComponent(entityId, wallCompType, {
        points,
        wallType,
        seed: wallType === 'cavern' ? Math.floor(Math.random() * 100000) : 0,
      })

      // Create a visible surface element on the BlockSuite canvas
      createWallElement(editor, points, wallType)
    },
    [world, editor]
  )

  const handleDoorPlace = useCallback(
    (point: GridPoint) => {
      const entityId = `door_${point.x}_${point.y}`
      world.addEntity(entityId)
      const doorType = {
        name: 'map:door',
        defaults: () => ({ state: 'closed' as const, width: 1, linkedWallId: '' }),
      }
      world.addComponent(entityId, doorType, { state: 'closed' })

      // Also give it a position via transform
      const transformType = {
        name: 'transform',
        defaults: () => ({ x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 }),
      }
      world.addComponent(entityId, transformType, { x: point.x, y: point.y })

      // Create a visible surface element on the BlockSuite canvas
      createDoorElement(editor, point)
    },
    [world, editor]
  )

  const handleObjectPlace = useCallback(
    (point: GridPoint, objectType: MapObjectType) => {
      const entityId = `obj_${Date.now()}`
      world.addEntity(entityId)
      const objType = {
        name: 'map:object',
        defaults: () => ({ objectType: 'crate' as string, zIndex: 10, collidable: true, interactable: true }),
      }
      world.addComponent(entityId, objType, { objectType })

      const transformType = {
        name: 'transform',
        defaults: () => ({ x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 }),
      }
      world.addComponent(entityId, transformType, { x: point.x, y: point.y })

      // Create a visible surface element on the BlockSuite canvas
      createObjectElement(editor, point, objectType)
    },
    [world, editor]
  )

  const handleLightPlace = useCallback(
    (point: GridPoint) => {
      const entityId = `light_${Date.now()}`
      world.addEntity(entityId)
      const lightType = {
        name: 'map:light',
        defaults: () => ({
          radius: 30,
          color: '#ffcc66',
          intensity: 0.8,
          falloff: 'quadratic' as string,
          castShadows: true,
        }),
      }
      world.addComponent(entityId, lightType, {})

      const transformType = {
        name: 'transform',
        defaults: () => ({ x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 }),
      }
      world.addComponent(entityId, transformType, { x: point.x, y: point.y })

      // Create a visible surface element on the BlockSuite canvas
      createLightElement(editor, point, lightProps.radius, lightProps.color)

      // Show light properties for the newly placed light
      setSelectedLightEntity(entityId)
    },
    [world, editor, lightProps.radius, lightProps.color]
  )

  const handleLegendPlace = useCallback(
    (point: GridPoint) => {
      const nextNumber = legendEntries.length + 1
      const entityId = `legend_${Date.now()}`
      world.addEntity(entityId)
      const legendType = {
        name: 'map:legend',
        defaults: () => ({ number: 0, text: '', pinEntityId: '' }),
      }
      world.addComponent(entityId, legendType, {
        number: nextNumber,
        text: `Location ${nextNumber}`,
        pinEntityId: entityId,
      })

      const transformType = {
        name: 'transform',
        defaults: () => ({ x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 }),
      }
      world.addComponent(entityId, transformType, { x: point.x, y: point.y })

      // Create a visible surface element on the BlockSuite canvas
      createLegendElement(editor, point, nextNumber)

      setLegendEntries((prev) => [
        ...prev,
        { entityId, number: nextNumber, text: `Location ${nextNumber}` },
      ])
      setShowLegend(true)
    },
    [world, legendEntries.length, editor]
  )

  const handleLegendEntryRemove = useCallback(
    (entityId: string) => {
      world.removeEntity(entityId)
      setLegendEntries((prev) => {
        const filtered = prev.filter((e) => e.entityId !== entityId)
        // Re-number
        return filtered.map((e, i) => ({ ...e, number: i + 1 }))
      })
    },
    [world]
  )

  const handleLightPropsUpdate = useCallback(
    (props: { radius: number; color: string; intensity: number; falloff: LightFalloff; castShadows: boolean }) => {
      setLightProps(props)
      if (selectedLightEntity) {
        const lightType = {
          name: 'map:light',
          defaults: () => ({
            radius: 30,
            color: '#ffcc66',
            intensity: 0.8,
            falloff: 'quadratic' as string,
            castShadows: true,
          }),
        }
        world.addComponent(selectedLightEntity, lightType, props)
      }
    },
    [world, selectedLightEntity]
  )

  // Mount the editor into the DOM and wire up event bridges
  useEffect(() => {
    const container = editorContainerRef.current
    if (!container) return

    container.replaceChildren()
    container.appendChild(editor)

    const disposables: Array<() => void> = []

    // Prevent browser zoom (Ctrl+wheel) and page scroll from hijacking
    // wheel events that should go to the BlockSuite edgeless canvas.
    // BlockSuite's UIEventDispatcher adds its own passive:false wheel
    // listener on the host element, but events on the outer React container
    // may still trigger the browser's default zoom.
    const preventPageZoom = (e: WheelEvent) => {
      // Only prevent default when the event is inside the editor area
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
      }
    }
    container.addEventListener('wheel', preventPageZoom, { passive: false })
    disposables.push(() => container.removeEventListener('wheel', preventPageZoom))

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
          style={{ flex: 1, position: 'relative', overflow: 'hidden', touchAction: 'none' }}
        >
          <div
            ref={editorContainerRef}
            style={{ width: '100%', height: '100%' }}
          />

          {/* Map pointer event overlay — captures clicks for map tools */}
          <MapEventOverlay
            active={isMapBoard && boardMode === 'edit'}
            activeMapTool={activeMapTool}
            gridConfig={gridConfig}
            snapEnabled={settings.snapToGrid}
            selectedObject={selectedObject}
            onTerrainPaint={handleTerrainPaint}
            onWallDraw={handleWallDraw}
            onDoorPlace={handleDoorPlace}
            onObjectPlace={handleObjectPlace}
            onLightPlace={handleLightPlace}
            onLegendPlace={handleLegendPlace}
          />

          {/* Board picker — top left */}
          <BoardPicker
            boards={boards}
            activeBoardId={activeBoardId}
            viewMode={viewMode}
            boardMode={boardMode}
            userRole="gm"
            onBoardChange={handleBoardChange}
            onViewModeChange={setViewMode}
            onBoardModeChange={setBoardMode}
            onAddBoard={handleAddBoard}
          />

          {/* Drawing toolbar — bottom center (with contextual map tools) */}
          <Toolbar
            boardMode={boardMode}
            isMapBoard={isMapBoard}
            activeMapTool={activeMapTool}
            onMapToolChange={setActiveMapTool}
            selectedTerrain={selectedTerrain}
            onTerrainChange={setSelectedTerrain}
            selectedObject={selectedObject}
            onObjectChange={setSelectedObject}
          />

          {/* Legend panel — right sidebar (when map has legend entries) */}
          {isMapBoard && showLegend && (
            <LegendPanel
              entries={legendEntries}
              onEntryClick={(_entityId) => {
                // TODO: Pan viewport to the pin location
              }}
              onEntryRemove={handleLegendEntryRemove}
              onClose={() => setShowLegend(false)}
            />
          )}

          {/* Light properties panel — right side (when a light is selected) */}
          {isMapBoard && selectedLightEntity && (
            <LightProperties
              radius={lightProps.radius}
              color={lightProps.color}
              intensity={lightProps.intensity}
              falloff={lightProps.falloff}
              castShadows={lightProps.castShadows}
              onUpdate={handleLightPropsUpdate}
              onClose={() => setSelectedLightEntity(null)}
            />
          )}

          {/* Status bar — bottom right */}
          <StatusBar isConnected={isConnected} roomId={roomId} />

          {/* Zoom controls — bottom right, next to status bar */}
          <ZoomControls />
        </div>
      </div>
    </EditorContext.Provider>
  )
}
