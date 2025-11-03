import { useRef, useState } from 'react'

export type Wind = {
    rx: number      // Rotation X (degrees)
    ry: number      // Rotation Y (degrees)
    angle: number   // Direction angle (degrees)
    strength: number // Normalized strength [0-1]
}

export type DragWindOptions = {
    maxTilt?: number // Maximum tilt angle in degrees
}

export type DragWindCallbacks = {
    onMove: (deltaX: number, deltaY: number) => void
    onEnd: () => void
}

/**
 * Calculate wind effect from drag velocity (physics-based)
 * This hook is framework-agnostic and doesn't depend on @dnd-kit
 *
 * @param options - Configuration for wind effect
 * @returns Object with current wind state and callback handlers
 *
 * @example
 * ```tsx
 * const { wind, onMove, onEnd } = useDragWind({ maxTilt: 15 })
 *
 * // In your drag handler:
 * onDragMove={(e) => onMove(e.delta.x, e.delta.y)}
 * onDragEnd={onEnd}
 *
 * // Apply to element:
 * <div style={{ transform: `rotateX(${wind.rx}deg) rotateY(${wind.ry}deg)` }} />
 * ```
 */
export function useDragWind(options: DragWindOptions = {}): { wind: Wind; callbacks: DragWindCallbacks } {
    const { maxTilt = 12 } = options

    const prev = useRef<{ x: number; y: number; t: number } | null>(null)
    const [wind, setWind] = useState<Wind>({ rx: 0, ry: 0, angle: 0, strength: 0 })

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

    const onMove = (deltaX: number, deltaY: number) => {
        const now = performance.now()
        const dx = deltaX
        const dy = deltaY

        if (!prev.current) {
            prev.current = { x: dx, y: dy, t: now }
            return
        }

        const dt = now - prev.current.t || 16
        const ddx = dx - prev.current.x
        const ddy = dy - prev.current.y

        const vx = ddx / dt // pixels per millisecond
        const vy = ddy / dt

        const rx = clamp(vy * 10, -maxTilt, maxTilt)   // Tilt X follows velocity Y
        const ry = clamp(-vx * 10, -maxTilt, maxTilt)  // Tilt Y follows velocity X (inverted)
        const angle = Math.atan2(vy, vx) * (180 / Math.PI)
        const speed = Math.hypot(vx, vy)
        const strength = clamp(speed * 1.8, 0, 1)

        setWind({ rx, ry, angle, strength })
        prev.current = { x: dx, y: dy, t: now }
    }

    const onEnd = () => {
        prev.current = null
        setWind({ rx: 0, ry: 0, angle: 0, strength: 0 })
    }

    return {
        wind,
        callbacks: { onMove, onEnd }
    }
}
