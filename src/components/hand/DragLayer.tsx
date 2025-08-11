import React from 'react'
import { DragOverlay } from '@dnd-kit/core'
import DragCardOverlay from './DragCardOverlay'
import type { CardData } from './CardView'

export type Wind = { rx: number; ry: number; angle: number; strength: number }

type Props = {
    activeCard: CardData | null
    wind: Wind
}

export default function DragLayer({ activeCard, wind }: Props) {
    return (
        <DragOverlay dropAnimation={null}>
            {activeCard ? (
                <div className="pointer-events-none" style={{ transformStyle: 'preserve-3d', perspective: 700 }}>
                    <DragCardOverlay
                        card={activeCard}
                        rx={wind.rx}
                        ry={wind.ry}
                        strength={wind.strength}
                    />
                </div>
            ) : null}
        </DragOverlay>
    )
}
