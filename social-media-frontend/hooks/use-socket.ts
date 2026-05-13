import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/lib/store'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'

// Singleton socket — one connection for the whole app lifetime
let socketInstance: Socket | null = null

function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
    })
  }
  return socketInstance
}

export function useSocket() {
  const { user, isAuthenticated } = useAuthStore()
  const socketRef = useRef<Socket>(getSocket())

  // Connect and announce presence when authenticated
  useEffect(() => {
    const socket = socketRef.current

    if (isAuthenticated && user) {
      if (!socket.connected) {
        socket.connect()
      }

      socket.on('connect', () => {
        socket.emit('userOnline', user._id)
      })

      // If already connected, announce immediately
      if (socket.connected) {
        socket.emit('userOnline', user._id)
      }
    } else {
      if (socket.connected) {
        socket.disconnect()
      }
    }

    return () => {
      socket.off('connect')
    }
  }, [isAuthenticated, user])

  const emit = useCallback(<T>(event: string, data: T) => {
    socketRef.current.emit(event, data)
  }, [])

  const on = useCallback(<T>(event: string, handler: (data: T) => void) => {
    socketRef.current.on(event, handler)
    return () => {
      socketRef.current.off(event, handler)
    }
  }, [])

  const off = useCallback((event: string, handler?: (...args: unknown[]) => void) => {
    socketRef.current.off(event, handler)
  }, [])

  return {
    socket: socketRef.current,
    emit,
    on,
    off,
    isConnected: socketRef.current.connected,
  }
}
