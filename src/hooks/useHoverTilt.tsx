import { useEffect, useRef, useState, type CSSProperties } from 'react'

type Options = {
    maxRotate?: number      // amplitude du tilt (deg)
    maxTranslate?: number   // léger déplacement XY (px)
    scale?: number          // zoom au hover
}

export function useHoverTilt({
                                 maxRotate = 8,
                                 maxTranslate = 8,
                                 scale = 1.03,
                             }: Options = {}) {
    const ref = useRef<HTMLDivElement | null>(null)
    const raf = useRef<number | null>(null)
    const [style, setStyle] = useState<CSSProperties>({ transform: 'perspective(600px)' })
    const [shine, setShine] = useState<{ xPct: number; yPct: number }>({ xPct: 50, yPct: 50 })

    // attract only: le curseur "attire" la carte
    const sign = -1

    const animate = (rx: number, ry: number, tx: number, ty: number, xPct: number, yPct: number) => {
        if (raf.current) cancelAnimationFrame(raf.current)
        raf.current = requestAnimationFrame(() => {
            setStyle({
                transform: `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
                willChange: 'transform',
            })
            setShine({ xPct, yPct })
        })
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (e.pointerType && e.pointerType !== 'mouse') return
        const el = ref.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const px = (e.clientX - rect.left) / rect.width
        const py = (e.clientY - rect.top) / rect.height

        const rx = (0.5 - py) * (maxRotate * 2) * sign
        const ry = (px - 0.5) * (maxRotate * 2) * sign
        const tx = (px - 0.5) * (maxTranslate * 2) * sign
        const ty = (py - 0.5) * (maxTranslate * 2) * sign

        animate(rx, ry, tx, ty, px * 100, py * 100)
    }

    const reset = () => {
        if (raf.current) cancelAnimationFrame(raf.current)
        setStyle({ transform: 'perspective(600px)' })
        setShine({ xPct: 50, yPct: 50 })
    }

    useEffect(() => {
        return () => { if (raf.current) cancelAnimationFrame(raf.current) }
    }, [])

    return { ref, style, shine, handlePointerMove, reset }
}
