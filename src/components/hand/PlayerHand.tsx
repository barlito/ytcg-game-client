import { useMemo } from 'react'
import DraggableCard from './DraggableCard.tsx'
import type { CardData } from './CardView'

type Props = {
    activeId: string | null
}

export default function PlayerHand({ activeId }: Props) {
    const cards = useMemo<CardData[]>(() => ([
        { id: 'c1', name: 'Prairie Ranger', cost: 2, rarity: 'C',  clan: 'Warden',  imageUrl: 'https://picsum.photos/300/420?random=c1' },
        { id: 'c2', name: 'Arcane Scholar',  cost: 3, rarity: 'R',  clan: 'Mystic',  imageUrl: 'https://picsum.photos/300/420?random=c2' },
        { id: 'c3', name: 'Ironclad Knight', cost: 4, rarity: 'SR', clan: 'Vanguard', imageUrl: 'https://picsum.photos/300/420?random=c3' },
        { id: 'c4', name: 'Shadow Stalker',  cost: 2, rarity: 'C',  clan: 'Rogue',   imageUrl: 'https://picsum.photos/300/420?random=c4' },
        { id: 'c5', name: 'Sunblade Adept',  cost: 1, rarity: 'UR', clan: 'Sanctum', imageUrl: 'https://picsum.photos/300/420?random=c5' },
    ]), [])

    return (
        <div className="relative w-full">
            <div className="hand-scroll w-full overflow-x-auto overflow-y-visible">
                <div className="mx-auto w-fit flex items-end gap-4 px-6 py-4 min-h-[14rem]">
                    {cards.map(card => (
                        <DraggableCard key={card.id} card={card} activeId={activeId} />
                    ))}
                </div>
            </div>
        </div>
    )
}
