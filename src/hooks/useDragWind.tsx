import { useRef, useState } from 'react'
import { useDndMonitor } from '@dnd-kit/core'
import type { DragMoveEvent } from '@dnd-kit/core'

type Wind = { rx: number; ry: number; angle: number; strength: number }

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export function useDragWind(activeId: string | null, opts?: { maxTilt?: number }) {
    const { maxTilt = 12 } = opts ?? {}
    const prev = useRef<{ x: number; y: number; t: number } | null>(null)
    const [wind, setWind] = useState<Wind>({ rx: 0, ry: 0, angle: 0, strength: 0 })

    useDndMonitor({
        onDragMove(e: DragMoveEvent) {
            if (!activeId || String(e.active.id) !== activeId) return
            const now = performance.now()
            const dx = e.delta.x
            const dy = e.delta.y

            if (!prev.current) {
                prev.current = { x: dx, y: dy, t: now }
                return
            }

            const dt = now - prev.current.t || 16
            const ddx = dx - prev.current.x
            const ddy = dy - prev.current.y

            const vx = ddx / dt // px/ms
            const vy = ddy / dt

            const rx = clamp(vy * 10, -maxTilt, maxTilt)   // tilt X suit la vitesse Y
            const ry = clamp(-vx * 10, -maxTilt, maxTilt)  // tilt Y suit la vitesse X (inversé)
            const angle = Math.atan2(vy, vx) * (180 / Math.PI)
            const speed = Math.hypot(vx, vy)
            const strength = clamp(speed * 1.8, 0, 1)

            setWind({ rx, ry, angle, strength })
            prev.current = { x: dx, y: dy, t: now }
        },
        onDragEnd() {
            prev.current = null
            setWind({ rx: 0, ry: 0, angle: 0, strength: 0 })
        },
        onDragCancel() {
            prev.current = null
            setWind({ rx: 0, ry: 0, angle: 0, strength: 0 })
        }
    })

    return wind
}
