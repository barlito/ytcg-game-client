import React, { useCallback, useRef, useState, useMemo } from 'react'
import Board from './components/board/Board'
import PlayerHand from './components/cards/PlayerHand'
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    pointerWithin,
} from '@dnd-kit/core'
import DragLayer, { type Wind } from './components/cards/DragLayer'
import DropPreview from './components/ui/DropPreview'
import type { DragStartEvent, DragEndEvent, DragMoveEvent } from '@dnd-kit/core'
import type { CardData, BoardCell } from './game/types'
import { useGameRoom } from './game/hooks/useGameRoom'
import { useDropValidation } from './game/hooks/useDropValidation'
import { HexLayouts, hexToKey } from './game/utils/hexGrid'

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export default function App() {
    // Connect to Colyseus server (or work in demo mode if server unavailable)
    const {
        gameState,
        isConnected,
        isConnecting,
        error,
        playCard,
        endTurn,
        reconnect
    } = useGameRoom('game_room', false) // Don't auto-connect for now (demo mode)

    // Initialize demo board state with all cells
    const demoBoardState = useMemo(() => {
        const board: Record<string, BoardCell> = {}
        HexLayouts.SMALL.forEach(([q, r]) => {
            const key = hexToKey({ q, r })
            board[key] = {
                coord: { q, r },
                key,
            }
        })
        return board
    }, [])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    )

    const [activeCard, setActiveCard] = useState<CardData | null>(null)
    const [activeId, setActiveId] = useState<string | null>(null)
    const [lastDrop, setLastDrop] = useState<string | null>(null)

    const [wind, setWind] = useState<Wind>({ rx: 0, ry: 0, angle: 0, strength: 0 })
    const prevRef = useRef<{ x: number; y: number; t: number } | null>(null)

    // Drop validation (use demo board if no game state)
    const dropValidation = useDropValidation(
        gameState?.board ?? demoBoardState,
        'player1', // TODO: Get from actual player ID
        true       // TODO: Check if it's actually player's turn
    )

    const handleDragStart = useCallback((e: DragStartEvent) => {
        setActiveId(String(e.active.id))
        const card = e.active.data.current?.card as CardData | undefined
        if (card) setActiveCard(card)
        prevRef.current = null
        setWind({ rx: 0, ry: 0, angle: 0, strength: 0 })
    }, [])

    const handleDragMove = useCallback((e: DragMoveEvent) => {
        // Update drop validation
        dropValidation.handleDragMove(e)

        if (!activeId || String(e.active.id) !== activeId) return
        const now = performance.now()
        const dx = e.delta.x
        const dy = e.delta.y

        if (!prevRef.current) {
            prevRef.current = { x: dx, y: dy, t: now }
            return
        }

        const dt = now - prevRef.current.t || 16
        const ddx = dx - prevRef.current.x
        const ddy = dy - prevRef.current.y

        const vx = ddx / dt // px/ms
        const vy = ddy / dt

        const maxTilt = 12
        const rx = clamp(vy * 10, -maxTilt, maxTilt)
        const ry = clamp(-vx * 10, -maxTilt, maxTilt)
        const angle = Math.atan2(vy, vx) * (180 / Math.PI)
        const speed = Math.hypot(vx, vy)
        const strength = clamp(speed * 1.8, 0, 1)

        setWind({ rx, ry, angle, strength })
        prevRef.current = { x: dx, y: dy, t: now }
    }, [activeId, dropValidation])

    const handleDragEnd = useCallback((e: DragEndEvent) => {
        if (e.over && e.over.id === 'board') {
            setLastDrop(String(e.active.id))
        }
        setActiveCard(null)
        setActiveId(null)
        setWind({ rx: 0, ry: 0, angle: 0, strength: 0 })
        prevRef.current = null
        dropValidation.reset()
    }, [dropValidation])

    const handleCardPlayed = useCallback((cardId: string, hexKey: string) => {
        if (isConnected) {
            // Send to server
            playCard(cardId, hexKey)
        } else {
            // Demo mode: just log it
            console.log('[Demo Mode] Card played:', cardId, 'at', hexKey)
        }
    }, [isConnected, playCard])

    const handleEndTurn = useCallback(() => {
        if (isConnected) {
            endTurn()
        } else {
            console.log('[Demo Mode] End turn clicked')
        }
    }, [isConnected, endTurn])

    return (
        <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
            {/* Compact Header */}
            <header className="h-14 bg-slate-950/80 backdrop-blur border-b border-slate-700/50 px-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Youl TCG
                    </h1>
                    {!isConnected && !isConnecting && (
                        <div className="badge badge-warning badge-sm">Demo</div>
                    )}
                    {isConnecting && (
                        <div className="badge badge-info badge-sm">Connecting...</div>
                    )}
                    {isConnected && (
                        <div className="badge badge-success badge-sm">Live</div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {error && (
                        <button className="btn btn-xs btn-error" onClick={reconnect}>
                            Reconnect
                        </button>
                    )}
                    <button className="btn btn-sm btn-primary" onClick={handleEndTurn}>
                        End Turn
                    </button>
                </div>
            </header>

            <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
            >
                {/* Main Game Area - Flexbox horizontal */}
                <main className="flex-1 flex items-center justify-center gap-6 p-6 min-h-0">
                    {/* Board - Takes most space */}
                    <div className="flex-1 h-full flex items-center justify-center">
                        <Board
                            lastDrop={lastDrop}
                            board={gameState?.board ?? demoBoardState}
                            onCardPlayed={handleCardPlayed}
                        />
                    </div>

                    {/* Player Hand - Vertical on the right */}
                    <div className="w-64 h-full flex flex-col">
                        <div className="text-sm font-semibold text-slate-400 mb-3 px-2">
                            Your Hand
                        </div>
                        <PlayerHand activeId={activeId} />
                    </div>
                </main>

                <DragLayer activeCard={activeCard} wind={wind} />
            </DndContext>

            {/* Drop validation feedback */}
            <DropPreview
                targetHex={dropValidation.currentTarget}
                isValid={dropValidation.validationResult?.valid ?? false}
                reason={dropValidation.validationResult?.reason}
            />
        </div>
    )
}
