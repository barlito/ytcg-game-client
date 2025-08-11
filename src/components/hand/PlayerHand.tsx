import React, { useMemo } from 'react'
import Card from './Card'
import type { CardData } from './CardView'

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
        <div className="relative w-full">
            <div className="hand-scroll w-full overflow-x-auto overflow-y-visible">
                <div className="mx-auto w-fit flex items-end gap-4 px-6 py-4 min-h-[14rem]">
                    {cards.map(card => (
                        <Card key={card.id} card={card} activeId={activeId} />
                    ))}
                </div>
            </div>
        </div>
    )
}
