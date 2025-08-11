import React from 'react'

export type CardData = {
    id: string
    name: string
    cost: number
    rarity?: 'C' | 'R' | 'SR' | 'UR'
    clan?: string
}

type Props = {
    card: CardData
    muted?: boolean        // pour “éteindre” la carte quand son overlay est actif
    highlight?: boolean    // pour le rendu dans l’overlay (à animer plus tard)
}

export default function CardView({ card, muted = false, highlight = false }: Props) {
    return (
        <div
            className={[
                'card w-40 bg-base-100 shadow-md select-none',
                muted ? 'opacity-30' : '',
                highlight ? 'ring ring-primary ring-offset-2 ring-offset-base-200' : ''
            ].join(' ')}
        >
            <div className="card-body p-4 gap-2">
                <div className="flex items-center justify-between">
                    <span className="badge badge-neutral">{card.rarity ?? 'C'}</span>
                    <span className="badge badge-secondary">⚡ {card.cost}</span>
                </div>
                <h3 className="card-title text-base leading-snug">{card.name}</h3>
                <p className="text-xs opacity-70">{card.clan ?? 'Neutral'}</p>
            </div>
        </div>
    )
}
