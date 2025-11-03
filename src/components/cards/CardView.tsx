import React from 'react'
import { useHoverTilt } from '../../lib/card-effects'
import type { CardData } from '../../game/types'

type Props = {
    card: CardData
    muted?: boolean        // "éteint" la carte quand le drag overlay est actif
    highlight?: boolean    // style spécial pour l'overlay pendant le drag
    interactive?: boolean  // active l'effet 3D au hover
}

export default function CardView({ card, muted = false, highlight = false, interactive = false }: Props) {
    const tilt = useHoverTilt({ maxRotate: 10, maxTranslate: 10, scale: 1.04 })
    const imageUrl = card.imageUrl ?? `https://picsum.photos/300/420?random=${encodeURIComponent(card.id)}`

    const shineStyle = {
        background: `radial-gradient(220px circle at ${tilt.shine.xPct}% ${tilt.shine.yPct}%,
      rgba(255,255,255,0.12), transparent 45%)`,
        pointerEvents: 'none' as const,
    } satisfies React.CSSProperties;

    const cardProps = interactive && !muted
        ? { ref: tilt.ref, onPointerMove: tilt.handlePointerMove, onPointerLeave: tilt.reset, style: tilt.style }
        : {}

    return (
        <div
            {...cardProps}
            className={[
                'group relative w-36 aspect-[63/88] select-none rounded-lg shadow-2xl overflow-hidden bg-slate-800 transform-gpu transition-all duration-200 ease-out',
                muted ? 'opacity-30' : '',
            ].join(' ')}
            style={{
                ...cardProps.style,
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                border: highlight ? '2px solid #60a5fa' : '1px solid rgba(71, 85, 105, 0.5)',
            }}
        >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="absolute inset-0 p-2 flex flex-col">
                    <div className="flex items-center justify-between">
                        <span className="badge badge-xs badge-neutral">{card.rarity ?? 'C'}</span>
                        <span className="badge badge-xs badge-secondary font-bold">⚡{card.cost}</span>
                    </div>

                    <div className="mt-auto">
                        <h3 className="text-xs font-bold leading-tight drop-shadow-lg text-white">{card.name}</h3>
                        <p className="text-[10px] opacity-70">{card.clan ?? 'Neutral'}</p>
                    </div>
                </div>

            {/* Shine: invisible hors hover */}
            {interactive && !muted && (
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    style={shineStyle}
                />
            )}
        </div>
    )
}
