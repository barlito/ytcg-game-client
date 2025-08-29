import React, { useMemo, useState, useRef, useCallback } from "react"
import { useDroppable, useDndMonitor } from "@dnd-kit/core"
import { defineHex, Grid } from "honeycomb-grid"
import { useGameStore } from "../../stores/game"
import CardView from "../hand/CardView"

type BoardProps = {
    lastDrop: string | null
}

const PRESET_CELLS: [number, number][] = [
    // Center hex
    [0, 0],
    
    // First ring (6 hexes)
    [1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1],
    
    // Second ring (12 hexes)
    [2, 0], [1, 1], [0, 2], [-1, 2], [-2, 2], [-2, 1],
    [-2, 0], [-1, -1], [0, -2], [1, -2], [2, -2], [2, -1],
    
    // Third ring partial (11 hexes to reach 30 total)
    [3, 0], [2, 1], [1, 2], [0, 3], [-1, 3], [-2, 3],
    [-3, 2], [-3, 1], [-3, 0], [-2, -1], [-1, -2]
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
    
    // Zoom and pan state
    const [zoom, setZoom] = useState(1)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [isPanning, setIsPanning] = useState(false)
    const panStart = useRef({ x: 0, y: 0 })
    const containerRef = useRef<HTMLDivElement>(null)

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
                const cardData = e.active.data.current?.card
                const hexKey = overId.replace("hex:", "")
                
                if (cardData && !board[hexKey]) {
                    // Place card in the game store
                    useGameStore.getState().playCard(hexKey, {
                        id: cardData.id,
                        name: cardData.name
                    })
                    
                    const msg = `${cardData.name} → ${hexKey}`
                    setLastHexLog(msg)
                    // eslint-disable-next-line no-console
                    console.log("[Board] Placed card:", msg)
                } else if (board[hexKey]) {
                    // eslint-disable-next-line no-console
                    console.log("[Board] Hex already occupied:", hexKey)
                }
            }
        },
    })

    // Zoom and pan handlers
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault()
        const delta = e.deltaY * -0.001
        const newZoom = Math.max(0.5, Math.min(3, zoom + delta))
        setZoom(newZoom)
    }, [zoom])

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button === 0 && !isDragging) { // Left click and not dragging cards
            setIsPanning(true)
            panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
        }
    }, [pan, isDragging])

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isPanning) {
            setPan({
                x: e.clientX - panStart.current.x,
                y: e.clientY - panStart.current.y
            })
        }
    }, [isPanning])

    const handleMouseUp = useCallback(() => {
        setIsPanning(false)
    }, [])

    const board = useGameStore((s) => s.board)

    return (
        <div
            ref={(node) => {
                setNodeRef(node)
                if (containerRef.current !== node) {
                    containerRef.current = node
                }
            }}
            className="relative select-none rounded-xl border border-base-300 bg-base-100/60 backdrop-blur shadow-sm p-3 h-full flex flex-col"
            aria-label="Board (droppable)"
        >
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <span className="text-sm opacity-80">Hex Map (30 hexagons) - Zoom: {zoom.toFixed(1)}x</span>
                <div className="flex items-center gap-2">
                    {lastHexLog && (
                        <span className="badge badge-sm badge-outline">Hex drop: {lastHexLog}</span>
                    )}
                    {lastDrop && (
                        <span className="badge badge-sm badge-ghost">Board drop: {lastDrop}</span>
                    )}
                </div>
            </div>

            <div 
                className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
            >
                <svg 
                    className="w-full h-full" 
                    viewBox={viewBox} 
                    role="img" 
                    aria-label="Hex map"
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: 'center center',
                        transition: isPanning ? 'none' : 'transform 0.1s ease-out'
                    }}
                >
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
        <g 
            ref={setNodeRef} 
            id={id} 
            style={{ 
                transition: "transform 140ms ease",
                isolation: "isolate" // Prevents color bleeding between hexagons
            }}
        >
            <polygon
                points={points}
                fill="url(#hexFill)"
                filter="url(#softShadow)"
                style={{
                    stroke: isOver ? "#8b5cf6" : isValidTarget ? "#22c55e" : "rgba(255,255,255,0.35)",
                    strokeWidth: isOver ? 1.8 : isValidTarget ? 1.5 : 1,
                    strokeLinejoin: "miter",
                    strokeLinecap: "butt",
                    cursor: "default",
                    transition: "stroke 140ms ease, stroke-width 140ms ease, fill-opacity 140ms ease",
                    vectorEffect: "non-scaling-stroke" // Prevents stroke scaling issues
                }}
            />

            {/* Glow ring when hovered/over or valid target */}
            {(isOver || isValidTarget) && (
                <polygon
                    points={points}
                    fill="none"
                    style={{
                        stroke: isOver ? "#a855f7" : "#34d399",
                        strokeWidth: isOver ? 2.5 : 1.5,
                        strokeOpacity: isOver ? 0.6 : 0.3,
                        strokeLinejoin: "miter",
                        strokeLinecap: "butt",
                        strokeDasharray: isOver ? "none" : "3,2",
                        vectorEffect: "non-scaling-stroke"
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

            {/* Occupied marker with full card component */}
            {occupied && (
                <g aria-label={`occupied by ${occupied.name}`}>
                    <defs>
                        <clipPath id={`hexClip-${occupied.id}`}>
                            <polygon points={points} />
                        </clipPath>
                    </defs>
                    
                    {/* Semi-transparent background */}
                    <polygon 
                        points={points} 
                        fill="rgba(0,0,0,0.2)"
                        clipPath={`url(#hexClip-${occupied.id})`}
                    />
                    
                    {/* Card component in foreignObject */}
                    <foreignObject
                        x={cx - 16.8}
                        y={cy - 21}
                        width={33.6}
                        height={42}
                        style={{ overflow: 'hidden' }}
                    >
                        <div 
                            style={{ 
                                transform: 'scale(0.15)',
                                transformOrigin: 'top left',
                                width: '224px',
                                height: '280px',
                                filter: 'brightness(0.9)'
                            }}
                        >
                            <CardView 
                                card={{
                                    id: occupied.id,
                                    name: occupied.name,
                                    cost: 1,
                                    rarity: 'C',
                                    clan: 'Board'
                                }}
                            />
                        </div>
                    </foreignObject>
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
