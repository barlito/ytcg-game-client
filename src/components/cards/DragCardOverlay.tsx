import React from 'react'
import CardView from './CardView'
import type { CardData } from '../../game/types'

type Props = {
    card: CardData
    rx: number
    ry: number
    strength: number // 0..1
}

export default function DragCardOverlay({ card, rx, ry, strength }: Props) {
    const dropShadowY = Math.round(6 + strength * 12)
    const blur = Math.round(18 + strength * 24)
    const scale = 1.06 + strength * 0.04

    return (
        <div
            className="pointer-events-none transition-transform duration-75 ease-out"
            style={{
                transformStyle: 'preserve-3d',
                perspective: 700,
                willChange: 'transform',
                transform: `rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`,
                boxShadow: `0 ${dropShadowY}px ${blur}px rgba(0,0,0,0.25)`
            }}
        >
            <CardView card={card} highlight />
        </div>
    )
}
