import { motion } from 'framer-motion'
import CardView from './CardView'
import type { CardData } from './CardView'

type Props = {
    card: CardData
    rx: number
    ry: number
    strength: number // 0..1
}

export default function DragCardOverlay({ card, rx, ry, strength }: Props) {
    const dropShadowY = Math.round(6 + strength * 12)
    const blur = Math.round(18 + strength * 24)

    return (
        <motion.div
            className="pointer-events-none"
            style={{ transformStyle: 'preserve-3d', perspective: 700, willChange: 'transform' }}
            animate={{
                rotateX: rx,
                rotateY: ry,
                scale: (1.06 + strength * 0.04) * 0.25,
                boxShadow: `0 ${dropShadowY}px ${blur}px rgba(0,0,0,0.25)`
            }}
            transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.6 }}
        >
            <CardView card={card} highlight />
        </motion.div>
    )
}
