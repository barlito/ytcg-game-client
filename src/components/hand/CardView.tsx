import { type CSSProperties } from 'react'
import { useHoverTilt } from '../../hooks/useHoverTilt'

export type CardData = {
    id: string
    name: string
    cost: number
    rarity?: 'C' | 'R' | 'SR' | 'UR'
    clan?: string
    imageUrl?: string // optionnel, sinon on mettra un placeholder
}

type Props = {
    card: CardData
    muted?: boolean        // “éteint” la carte quand le drag overlay est actif
    highlight?: boolean    // style spécial pour l’overlay pendant le drag
    interactive?: boolean  // active l’effet 3D au hover
}

export default function CardView({ card, muted = false, highlight = false, interactive = false }: Props) {
    const tilt = useHoverTilt({ maxRotate: 10, maxTranslate: 10, scale: 1.04 })
    const imageUrl = card.imageUrl ?? `https://picsum.photos/300/420?random=${encodeURIComponent(card.id)}`

    const shineStyle = {
        background: `radial-gradient(220px circle at ${tilt.shine.xPct}% ${tilt.shine.yPct}%,
      rgba(255,255,255,0.12), transparent 45%)`,
        pointerEvents: 'none' as const,
    } satisfies CSSProperties;

    const wrapperProps = interactive && !muted
        ? { ref: tilt.ref, onPointerMove: tilt.handlePointerMove, onPointerLeave: tilt.reset, style: tilt.style }
        : {}

    return (
        <div
            {...wrapperProps}
            className={[
                'group relative transform-gpu transition-[transform,box-shadow] duration-150 ease-out', // <- group
                muted ? 'opacity-30' : '',
                highlight ? 'ring ring-primary/70 ring-offset-2 ring-offset-base-200 rounded-xl' : ''
            ].join(' ')}
        >
            <div
                className="relative w-56 aspect-[63/88] select-none rounded-xl shadow-xl overflow-hidden bg-base-100"
                style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

                <div className="absolute inset-0 p-3 flex flex-col">
                    <div className="flex items-center justify-between">
                        <span className="badge badge-neutral">{card.rarity ?? 'C'}</span>
                        <span className="badge badge-secondary">⚡ {card.cost}</span>
                    </div>

                    <div className="mt-auto">
                        <h3 className="text-base font-semibold leading-snug drop-shadow-sm">{card.name}</h3>
                        <p className="text-xs opacity-80">{card.clan ?? 'Neutral'}</p>
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
        </div>
    )
}
