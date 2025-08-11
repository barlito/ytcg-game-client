import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import CardView from './CardView'
import type { CardData } from './CardView'

type Props = {
    card: CardData
    activeId?: string | null
}

export default function Card({ card, activeId }: Props) {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: card.id,
        data: { card } // dispo dans DndContext.onDragStart via e.active.data.current.card
    })

    const isActive = activeId === card.id

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing"
        >
            <CardView card={card} muted={isActive} />
        </div>
    )
}
