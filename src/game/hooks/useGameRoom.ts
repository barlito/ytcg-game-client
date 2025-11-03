import { useEffect, useState, useCallback, useRef } from 'react'
import { Client, Room } from 'colyseus.js'
import type { GameState, PlayCardCommand, HexKey } from '../types'

type UseGameRoomReturn = {
    room: Room<GameState> | null
    gameState: GameState | null
    isConnected: boolean
    isConnecting: boolean
    error: string | null
    playCard: (cardId: string, hexKey: HexKey) => void
    endTurn: () => void
    reconnect: () => void
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'ws://localhost:2567'

/**
 * Hook to manage Colyseus room connection and game state
 *
 * @param roomName - Name of the Colyseus room to join (e.g., "game_room")
 * @param autoConnect - Whether to connect automatically on mount (default: true)
 */
export function useGameRoom(roomName = 'game_room', autoConnect = true): UseGameRoomReturn {
    const [room, setRoom] = useState<Room<GameState> | null>(null)
    const [gameState, setGameState] = useState<GameState | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const clientRef = useRef<Client | null>(null)

    const connect = useCallback(async () => {
        if (isConnecting || isConnected) return

        setIsConnecting(true)
        setError(null)

        try {
            // Initialize Colyseus client
            if (!clientRef.current) {
                clientRef.current = new Client(SERVER_URL)
            }

            // Join or create room
            const joinedRoom = await clientRef.current.joinOrCreate<GameState>(roomName)

            // Listen to state changes
            joinedRoom.onStateChange((state) => {
                setGameState(state)
            })

            // Handle room leave
            joinedRoom.onLeave((code) => {
                console.log('[useGameRoom] Left room with code:', code)
                setIsConnected(false)
                setRoom(null)
            })

            // Handle errors
            joinedRoom.onError((code, message) => {
                console.error('[useGameRoom] Room error:', code, message)
                setError(`Room error: ${message}`)
            })

            setRoom(joinedRoom)
            setIsConnected(true)
            console.log('[useGameRoom] Connected to room:', joinedRoom.id)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            console.error('[useGameRoom] Connection failed:', errorMessage)
            setError(errorMessage)
        } finally {
            setIsConnecting(false)
        }
    }, [roomName, isConnecting, isConnected])

    // Auto-connect on mount
    useEffect(() => {
        if (autoConnect) {
            connect()
        }

        // Cleanup on unmount
        return () => {
            if (room) {
                room.leave()
            }
        }
    }, [autoConnect, connect])

    // Send "play card" command to server
    const playCard = useCallback((cardId: string, hexKey: HexKey) => {
        if (!room) {
            console.warn('[useGameRoom] Cannot play card: not connected')
            return
        }

        const command: PlayCardCommand = { cardId, hexKey }
        room.send('playCard', command)
        console.log('[useGameRoom] Sent playCard:', command)
    }, [room])

    // Send "end turn" command to server
    const endTurn = useCallback(() => {
        if (!room) {
            console.warn('[useGameRoom] Cannot end turn: not connected')
            return
        }

        room.send('endTurn', {})
        console.log('[useGameRoom] Sent endTurn')
    }, [room])

    // Reconnect (useful for retry after error)
    const reconnect = useCallback(() => {
        if (room) {
            room.leave()
        }
        setRoom(null)
        setIsConnected(false)
        setError(null)
        connect()
    }, [room, connect])

    return {
        room,
        gameState,
        isConnected,
        isConnecting,
        error,
        playCard,
        endTurn,
        reconnect,
    }
}
