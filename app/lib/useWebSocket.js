import { useEffect, useState, useCallback } from 'react'
import io from 'socket.io-client'

export function useWebSocket() {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [events, setEvents] = useState([])
  const [lastPermissionUpdate, setLastPermissionUpdate] = useState(null)

  useEffect(() => {
    const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:4004'
    
    const socketInstance = io(WEBSOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    })

    socketInstance.on('connect', () => {
      setConnected(true)
      addEvent('Sistema', 'Conectado al servidor WebSocket', 'success')
    })

    socketInstance.on('disconnect', () => {
      setConnected(false)
      addEvent('Sistema', 'Desconectado del servidor WebSocket', 'warning')
    })

    socketInstance.on('permission.update', (data) => {
      setLastPermissionUpdate(data)
      addEvent('Notificación', `Cambio de permiso: ${JSON.stringify(data)}`, 'info')
    })

    socketInstance.on('error', (error) => {
      addEvent('Error', `Error WebSocket: ${error}`, 'error')
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const addEvent = useCallback((source, message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setEvents(prev => [
      { id: Date.now(), source, message, type, timestamp },
      ...prev.slice(0, 49) // Guardar últimos 50 eventos
    ])
  }, [])

  const clearEvents = useCallback(() => {
    setEvents([])
  }, [])

  return {
    socket,
    connected,
    events,
    addEvent,
    clearEvents,
    lastPermissionUpdate
  }
}
