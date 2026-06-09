import React, { useMemo, useState } from "react"
import { useDroppable, useDndMonitor } from "@dnd-kit/core"
import { defineHex, Grid } from "honeycomb-grid"
import { HexLayouts } from "../../game/utils/hexGrid"
import type { BoardCell } from "../../game/types"

type BoardProps = {
    board?: Record<string, BoardCell> // Optional: board state from Colyseus
    onCardPlayed?: (cardId: string, hexKey: string) => void // Callback when card is dropped
}

export default function Board({ board = {}, onCardPlayed }: BoardProps) {
    // Droppable global (pas d'effet visuel)
    const { setNodeRef } = useDroppable({ id: "board" })

    // Hexagones beaucoup plus grands (80 au lieu de 28)
    const Hex = useMemo(() => defineHex({ dimensions: 80, origin: "topLeft" }), [])
    const grid = useMemo(() => new Grid(Hex, HexLayouts.SMALL), [Hex])

    const { polys, viewBox } = useMemo(() => {
        type Poly = { id: string; q: number; r: number; key: string; points: string; cx: number; cy: number }
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        const list: Poly[] = []

        for (const hex of grid as Iterable<{ q: number; r: number; corners: { x: number; y: number }[] }>) {
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
    const [hoveredHex, setHoveredHex] = useState<string | null>(null)

    useDndMonitor({
        onDragStart() {
            setIsDragging(true)
            setHoveredHex(null)
        },
        onDragCancel() {
            setIsDragging(false)
            setHoveredHex(null)
        },
        onDragEnd: (e) => {
            setIsDragging(false)
            setHoveredHex(null)
            const overId = e.over?.id
            if (typeof overId === "string" && overId.startsWith("hex:")) {
                const cardId = String(e.active.id)
                const hexKey = overId.replace("hex:", "")
                const msg = `${cardId} → ${hexKey}`
                setLastHexLog(msg)
                 
                console.log("[Board] Dropped", msg)

                // Notify parent component (will send to server)
                onCardPlayed?.(cardId, hexKey)
            }
        },
    })

    return (
        <div
            ref={setNodeRef}
            className="relative select-none w-full h-full flex flex-col items-center justify-center"
            aria-label="Board (droppable)"
        >
            {/* Drop notification */}
            {lastHexLog && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="badge badge-lg badge-success gap-2 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-4 h-4 stroke-current">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Card dropped: {lastHexLog}
                    </div>
                </div>
            )}

            <div className="relative w-full h-full max-w-4xl max-h-full p-4">
                <svg
                    className="w-full h-full"
                    viewBox={viewBox}
                    preserveAspectRatio="xMidYMid meet"
                    role="img"
                    aria-label="Hex map"
                >
                    <defs>
                        <linearGradient id="hexFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1e293b" />
                            <stop offset="100%" stopColor="#0f172a" />
                        </linearGradient>
                        <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                            <feOffset dx="0" dy="2" result="offsetblur" />
                            <feComponentTransfer>
                                <feFuncA type="linear" slope="0.5" />
                            </feComponentTransfer>
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        {/* Glow effect for hover */}
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
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
                            occupied={board[p.key]?.card}
                            ownerId={board[p.key]?.ownerId}
                            isDragging={isDragging}
                            onHoverChange={setHoveredHex}
                        />
                    ))}

                    {/* Hover overlay - rendered last to appear on top */}
                    {hoveredHex && polys.find(p => p.id === hoveredHex) && (
                        <polygon
                            points={polys.find(p => p.id === hoveredHex)!.points}
                            fill="none"
                            style={{
                                stroke: "#60a5fa",
                                strokeWidth: 6,
                                strokeOpacity: 1,
                                pointerEvents: "none",
                            }}
                        />
                    )}
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
                          ownerId,
                          isDragging,
                          onHoverChange,
                      }: {
    id: string
    points: string
    label: string
    cx: number
    cy: number
    occupied?: { id: string; name: string } | undefined
    ownerId?: string
    isDragging: boolean
    onHoverChange: (id: string | null) => void
}) {
    const { setNodeRef, isOver } = useDroppable({ id })

    React.useEffect(() => {
        if (isOver) {
            onHoverChange(id)
        }
    }, [isOver, id, onHoverChange])

    const isValidTarget = isDragging && !occupied

    // Color code territories by owner
    const fillColor = ownerId
        ? ownerId === 'player1' ? '#3b82f6' : '#ef4444'
        : 'url(#hexFill)'

    return (
        <g ref={(node) => setNodeRef(node as Element as HTMLElement)} id={id} style={{ transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)" }}>
            {/* Base polygon */}
            <polygon
                points={points}
                fill={fillColor}
                fillOpacity={ownerId ? 0.5 : 0.95}
                filter={isOver ? "url(#glow)" : "url(#softShadow)"}
                style={{
                    stroke: "#475569",
                    strokeWidth: 2,
                    cursor: "default",
                    transition: "all 200ms ease",
                    transform: isOver ? 'scale(1.05)' : 'scale(1)',
                    transformOrigin: `${cx}px ${cy}px`,
                }}
            />

            {/* Bright fill on hover */}
            {isOver && (
                <polygon points={points} fill="rgba(96,165,250,0.15)" />
            )}

            {/* Green border for valid targets */}
            {isValidTarget && !isOver && (
                <polygon
                    points={points}
                    fill="none"
                    style={{
                        stroke: "#4ade80",
                        strokeWidth: 4,
                        strokeOpacity: 0.8,
                    }}
                />
            )}

            {/* Animated dashed border for valid targets */}
            {isValidTarget && !isOver && (
                <polygon
                    points={points}
                    fill="none"
                    style={{
                        stroke: "#4ade80",
                        strokeWidth: 2,
                        strokeOpacity: 0.4,
                        strokeDasharray: "10,5",
                        animation: "dash 20s linear infinite",
                    }}
                />
            )}

            {/* Occupied marker */}
            {occupied && (
                <g aria-label={`occupied by ${occupied.name}`}>
                    <circle cx={cx} cy={cy} r={20} fill="#06b6d4" opacity={0.9} />
                    <text
                        x={cx}
                        y={cy + 8}
                        className="select-none pointer-events-none"
                        style={{
                            fill: "white",
                            font: "bold 24px system-ui",
                            textAnchor: "middle",
                        }}
                    >
                        {occupied.name.slice(0, 1).toUpperCase()}
                    </text>
                </g>
            )}

            {/* Axial coordinates label */}
            <text
                x={cx}
                y={cy + (occupied ? 35 : 8)}
                className="select-none pointer-events-none"
                style={{
                    fill: "#94a3b8",
                    font: "14px monospace",
                    textAnchor: "middle",
                    fontWeight: 600,
                }}
            >
                {label}
            </text>
        </g>
    )
}
