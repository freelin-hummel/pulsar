import { useEffect, useRef, useState } from 'react'
import type { World } from '@pulsar/ecs'
import type { SyncMessage } from '@pulsar/shared'
import type { Editor } from 'tldraw'

interface SyncConnectionOptions {
  roomId: string
  userId: string
  world: World
  editor: Editor | null
}

/**
 * React hook for multiplayer sync via RivetKit.
 *
 * Connects to a RivetKit room actor over WebSocket and
 * synchronizes canvas state + ECS component state in real-time.
 *
 * In development/offline mode, operates as a local-only session.
 */
export function useSyncConnection({
  roomId,
  userId,
  world,
  editor,
}: SyncConnectionOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // In local/offline mode, just mark as connected
    // Full RivetKit WebSocket integration will use:
    //   const ws = new WebSocket(`ws://localhost:6420/rooms/${roomId}`)
    // For now, operate in local mode
    setIsConnected(false)

    const tryConnect = () => {
      try {
        const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/rooms/${roomId}`
        const ws = new WebSocket(wsUrl)

        ws.addEventListener('open', () => {
          wsRef.current = ws
          setIsConnected(true)

          // Send connect message
          const msg: SyncMessage = {
            type: 'connect',
            roomId,
            userId,
          }
          ws.send(JSON.stringify(msg))
        })

        ws.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data as string)
            handleServerMessage(data, world, editor)
          } catch {
            // Ignore malformed messages
          }
        })

        ws.addEventListener('close', () => {
          wsRef.current = null
          setIsConnected(false)

          // Reconnect after delay
          setTimeout(tryConnect, 3000)
        })

        ws.addEventListener('error', () => {
          ws.close()
        })
      } catch {
        // Server not available, operate in local mode
        setIsConnected(false)
      }
    }

    tryConnect()

    // Set up ECS world event listeners for syncing changes
    const unsubAdd = world.on('componentAdded', (entity: unknown, componentType: unknown) => {
      if (!wsRef.current) return
      const comp = world.getComponent(entity as string, componentType as string)
      if (!comp) return
      const msg: SyncMessage = {
        type: 'ecs:component-add',
        entityId: entity as string,
        component: componentType as string,
        data: comp.data,
      }
      wsRef.current.send(JSON.stringify(msg))
    })

    const unsubRemove = world.on('componentRemoved', (entity: unknown, componentType: unknown) => {
      if (!wsRef.current) return
      const msg: SyncMessage = {
        type: 'ecs:component-remove',
        entityId: entity as string,
        component: componentType as string,
      }
      wsRef.current.send(JSON.stringify(msg))
    })

    return () => {
      unsubAdd()
      unsubRemove()
      if (wsRef.current) {
        const msg: SyncMessage = {
          type: 'disconnect',
          userId,
        }
        wsRef.current.send(JSON.stringify(msg))
        wsRef.current.close()
      }
    }
  }, [roomId, userId, world, editor])

  /** Send a sync message to the server */
  const send = (message: SyncMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }

  return { isConnected, send }
}

/** Handle incoming messages from the server */
function handleServerMessage(
  data: Record<string, unknown>,
  world: World,
  editor: Editor | null
) {
  // Future: handle snapshot, shapes:update, presence:update, ecs:* messages
  // This will be implemented when the server actor is fully connected
}
