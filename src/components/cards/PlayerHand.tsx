import React, { useMemo } from 'react'
import DraggableCard from './DraggableCard.tsx'
import type { CardData } from '../../game/types'

type Props = {
    activeId: string | null
}

export default function PlayerHand({ activeId }: Props) {
    const cards = useMemo<CardData[]>(() => ([
        { id: 'c1', name: 'Prairie Ranger', cost: 2, rarity: 'C',  clan: 'Warden' },
        { id: 'c2', name: 'Arcane Scholar',  cost: 3, rarity: 'R',  clan: 'Mystic' },
        { id: 'c3', name: 'Ironclad Knight', cost: 4, rarity: 'SR', clan: 'Vanguard' },
        { id: 'c4', name: 'Shadow Stalker',  cost: 2, rarity: 'C',  clan: 'Rogue' },
        { id: 'c5', name: 'Sunblade Adept',  cost: 1, rarity: 'UR', clan: 'Sanctum' },
    ]), [])

    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="flex flex-col items-center gap-3 p-2">
                {cards.map(card => (
                    <DraggableCard key={card.id} card={card} activeId={activeId} />
                ))}
            </div>
        </div>
    )
}
