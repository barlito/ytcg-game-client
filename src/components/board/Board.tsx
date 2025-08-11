import React, { useMemo, useState } from "react"
import { useDroppable, useDndMonitor } from "@dnd-kit/core"
import { defineHex, Grid } from "honeycomb-grid"
import { useGameStore } from "../../stores/game"

type BoardProps = {
    lastDrop: string | null
}

const PRESET_CELLS: [number, number][] = [
    [0, 0],
    [1, 0],
    [0, 1],
    [-1, 1],
    [1, -1],
    [2, -1],
    [2, 0],
] as const

export default function Board({ lastDrop }: BoardProps) {
    // Droppable global (pas d'effet visuel)
    const { setNodeRef } = useDroppable({ id: "board" })

    const Hex = useMemo(() => defineHex({ dimensions: 28, origin: "topLeft" }), [])
    const grid = useMemo(() => new Grid(Hex, PRESET_CELLS), [Hex])

    const { polys, viewBox } = useMemo(() => {
        type Poly = { id: string; q: number; r: number; key: string; points: string; cx: number; cy: number }
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        const list: Poly[] = []

        for (const hex of grid as any) {
            const q: number = hex.q
            const r: number = hex.r
            const id = `hex:${q},${r}`
            const corners: { x: number; y: number }[] = hex.corners
            const points = corners.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ")
            const cx = corners.reduce((s, p) => s + p.x, 0) / corners.length
            const cy = corners.reduce((s, p) => s + p.y, 0) / corners.length

            for (const p of corners) {
                if (p.x < minX) minX = p.x
                if (p.y < minY) minY = p.y
                if (p.x > maxX) maxX = p.x
                if (p.y > maxY) maxY = p.y
            }

            list.push({ id, q, r, key: `${q},${r}`, points, cx, cy })
        }

        const PAD = 18
        const vb = `${(minX - PAD).toFixed(2)} ${(minY - PAD).toFixed(2)} ${(
            maxX - minX + 2 * PAD
        ).toFixed(2)} ${(maxY - minY + 2 * PAD).toFixed(2)}`
        return { polys: list, viewBox: vb }
    }, [grid])

    const [lastHexLog, setLastHexLog] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)

    useDndMonitor({
        onDragStart() {
            setIsDragging(true)
        },
        onDragCancel() {
            setIsDragging(false)
        },
        onDragEnd: (e) => {
            setIsDragging(false)
            const overId = e.over?.id
            if (typeof overId === "string" && overId.startsWith("hex:")) {
                const cardId = String(e.active.id)
                const msg = `${cardId} → ${overId}`
                setLastHexLog(msg)
                // eslint-disable-next-line no-console
                console.log("[Board] Dropped", msg)
            }
        },
    })

    const board = useGameStore((s) => s.board)

    return (
        <div
            ref={setNodeRef}
            className="relative select-none rounded-xl border border-base-300 bg-base-100/60 backdrop-blur shadow-sm p-3"
            aria-label="Board (droppable)"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-80">Mini map (honeycomb v4)</span>
                <div className="flex items-center gap-2">
                    {lastHexLog && (
                        <span className="badge badge-sm badge-outline">Hex drop: {lastHexLog}</span>
                    )}
                    {lastDrop && (
                        <span className="badge badge-sm badge-ghost">Board drop: {lastDrop}</span>
                    )}
                </div>
            </div>

            <div className="w-full overflow-auto">
                <svg className="w-full h-auto" viewBox={viewBox} role="img" aria-label="Hex map">
                    <defs>
                        <linearGradient id="hexFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4f46e5" />
                            <stop offset="100%" stopColor="#1f2937" />
                        </linearGradient>
                        <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
                            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.25" />
                        </filter>
                    </defs>

                    {polys.map((p) => (
                        <HexDroppable
                            key={p.id}
                            id={p.id}
                            points={p.points}
                            label={`${p.q},${p.r}`}
                            cx={p.cx}
                            cy={p.cy}
                            occupied={board[p.key]}
                            isDragging={isDragging}
                        />
                    ))}
                </svg>
            </div>
        </div>
    )
}

function HexDroppable({
                          id,
                          points,
                          label,
                          cx,
                          cy,
                          occupied,
                          isDragging,
                      }: {
    id: string
    points: string
    label: string
    cx: number
    cy: number
    occupied?: { id: string; name: string } | undefined
    isDragging: boolean
}) {
    const { setNodeRef, isOver } = useDroppable({ id })

    const isValidTarget = isDragging && !occupied

    return (
        <g ref={setNodeRef} id={id} style={{ transition: "transform 140ms ease" }}>
            <polygon
                points={points}
                fill="url(#hexFill)"
                filter="url(#softShadow)"
                style={{
                    stroke: isOver ? "#f59e0b" : isValidTarget ? "#22c55e" : "rgba(255,255,255,0.35)",
                    strokeWidth: isOver ? 2.2 : isValidTarget ? 2 : 1.25,
                    cursor: "default",
                    transition: "stroke 140ms ease, stroke-width 140ms ease, fill-opacity 140ms ease",
                }}
            />

            {/* Glow ring when hovered/over or valid target */}
            {(isOver || isValidTarget) && (
                <polygon
                    points={points}
                    fill="none"
                    style={{
                        stroke: isOver ? "#fbbf24" : "#34d399",
                        strokeWidth: 4,
                        strokeOpacity: 0.25,
                    }}
                />
            )}

            {/* Subtle scale on over */}
            {isOver && (
                <g
                    style={{
                        transform: `translate(${cx}px, ${cy}px) scale(1.03) translate(${-cx}px, ${-cy}px)`,
                        transition: "transform 140ms ease",
                    }}
                >
                    <polygon points={points} fill="rgba(255,255,255,0.05)" />
                </g>
            )}

            {/* Occupied marker */}
            {occupied && (
                <g aria-label={`occupied by ${occupied.name}`}>
                    <circle cx={cx} cy={cy} r={8} fill="#0ea5e9" opacity={0.9} />
                    <text
                        x={cx}
                        y={cy + 4}
                        className="select-none pointer-events-none"
                        style={{
                            fill: "white",
                            font: "10px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Helvetica Neue, Arial, Noto Sans",
                            textAnchor: "middle",
                            fontWeight: 700,
                        }}
                    >
                        {occupied.name.slice(0, 1).toUpperCase()}
                    </text>
                </g>
            )}

            {/* Axial label */}
            <text
                x={cx}
                y={cy + 14}
                className="select-none pointer-events-none"
                style={{
                    fill: "rgba(255,255,255,0.75)",
                    font: "10px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Helvetica Neue, Arial, Noto Sans",
                    textAnchor: "middle",
                }}
            >
                {label}
            </text>
        </g>
    )
}
