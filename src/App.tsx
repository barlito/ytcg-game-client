import React, { useCallback, useRef, useState } from 'react'
import Board from './components/board/Board'
import PlayerHand from './components/hand/PlayerHand'
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    pointerWithin,
} from '@dnd-kit/core'
import DragLayer, { type Wind } from './components/hand/DragLayer'
import type { DragStartEvent, DragEndEvent, DragMoveEvent } from '@dnd-kit/core'
import type { CardData } from './components/hand/CardView'
import CardView from "./components/hand/CardView";

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export default function App() {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    )

    const [activeCard, setActiveCard] = useState<CardData | null>(null)
    const [activeId, setActiveId] = useState<string | null>(null)
    const [lastDrop, setLastDrop] = useState<string | null>(null)

    const [wind, setWind] = useState<Wind>({ rx: 0, ry: 0, angle: 0, strength: 0 })
    const prevRef = useRef<{ x: number; y: number; t: number } | null>(null)

    const handleDragStart = useCallback((e: DragStartEvent) => {
        setActiveId(String(e.active.id))
        const card = e.active.data.current?.card as CardData | undefined
        if (card) setActiveCard(card)
        prevRef.current = null
        setWind({ rx: 0, ry: 0, angle: 0, strength: 0 })
    }, [])

    const handleDragMove = useCallback((e: DragMoveEvent) => {
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
    }, [activeId])

    const handleDragEnd = useCallback((e: DragEndEvent) => {
        if (e.over && e.over.id === 'board') {
            setLastDrop(String(e.active.id))
        }
        setActiveCard(null)
        setActiveId(null)
        setWind({ rx: 0, ry: 0, angle: 0, strength: 0 })
        prevRef.current = null
    }, [])

    return (
        <div className="h-screen flex flex-col bg-base-200 overflow-hidden">
            <header className="flex-shrink-0 navbar bg-base-100/70 backdrop-blur border-b border-base-300 px-4">
                <div className="flex-1">
                    <a className="text-xl font-bold">Youl TCG</a>
                </div>
                <div className="flex gap-3 items-center">
          <span className="text-xs opacity-70">
            WS: <code>{import.meta.env.VITE_SERVER_URL ?? 'n/a'}</code>
          </span>
                    <button className="btn btn-sm btn-primary">End Turn</button>
                </div>
            </header>

            <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
            >
                <main className="flex-1 p-4 overflow-hidden">
                    <div className="w-full h-full">
                        <Board lastDrop={lastDrop} />
                    </div>
                </main>

                <footer className="flex-shrink-0 bg-base-100/70 backdrop-blur border-t border-base-300 px-4 py-2">
                    <div className="w-full">
                        <PlayerHand activeId={activeId} />
                    </div>
                </footer>

                <DragLayer activeCard={activeCard} wind={wind} />
            </DndContext>
        </div>
    )
}
