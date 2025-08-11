import React, { useState } from 'react'
import Board from './components/board/Board'
import PlayerHand from './components/hand/PlayerHand'
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import CardView from './components/hand/CardView'
import type { CardData } from './components/hand/CardView'

export default function App() {
    // Sensors: petit seuil pour éviter les drags accidentels
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    )

    // Carte actuellement “prise”
    const [activeCard, setActiveCard] = useState<CardData | null>(null)
    const [activeId, setActiveId] = useState<string | null>(null)

    // Pour l’exemple: on mémorise la dernière carte déposée sur le board
    const [lastDrop, setLastDrop] = useState<string | null>(null)

    const handleDragStart = (e: DragStartEvent) => {
        setActiveId(String(e.active.id))
        const card = e.active.data.current?.card as CardData | undefined
        if (card) setActiveCard(card)
    }

    const handleDragEnd = (e: DragEndEvent) => {
        if (e.over && e.over.id === 'board') {
            setLastDrop(String(e.active.id))
        }
        setActiveCard(null)
        setActiveId(null)
    }

    return (
        <div className="min-h-screen grid grid-rows-[auto,1fr,auto] bg-base-200">
            {/* Top bar */}
            <header className="navbar bg-base-100/70 backdrop-blur border-b border-base-300 px-4">
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

            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                {/* Board central */}
                <main className="p-4">
                    <div className="mx-auto max-w-6xl">
                        <Board lastDrop={lastDrop} />
                    </div>
                </main>

                {/* Main du joueur (sticky en bas) */}
                <footer className="bg-base-100/70 backdrop-blur border-t border-base-300 px-4 py-3">
                    <div className="w-full">
                        <PlayerHand activeId={activeId} />
                    </div>
                </footer>

                {/* Drag overlay : c’est ici qu’on animera plus tard */}
                <DragOverlay dropAnimation={null}>
                    {activeCard ? (
                        <div className="pointer-events-none">
                            <CardView card={activeCard} highlight />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}
