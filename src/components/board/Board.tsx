import { useMemo, useState, type WheelEvent } from "react"
import { useDroppable, useDndMonitor } from "@dnd-kit/core"
import { defineHex, Grid } from "honeycomb-grid"
import { useGameStore } from "../../stores/game"
import type { CardData } from "../hand/CardView"

type BoardProps = {
    lastDrop: string | null
}

const PRESET_CELLS: [number, number][] = (() => {
    const width = 5
    const height = 6
    const qOffset = Math.floor(width / 2)
    const rOffset = Math.floor(height / 2)
    const cells: [number, number][] = []
    for (let q = -qOffset; q < width - qOffset; q++) {
        for (let r = -rOffset; r < height - rOffset; r++) {
            cells.push([q, r])
        }
    }
    return cells
})()

export default function Board({ lastDrop }: BoardProps) {
    // Droppable global (pas d'effet visuel)
    const { setNodeRef } = useDroppable({ id: "board" })

    const Hex = useMemo(() => defineHex({ dimensions: 40, origin: "topLeft" }), [])
    const grid = useMemo(() => new Grid(Hex, PRESET_CELLS), [Hex])

    const { polys, viewBox } = useMemo(() => {
        type Poly = { id: string; q: number; r: number; key: string; points: string; cx: number; cy: number }
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        const list: Poly[] = []

        for (const hex of grid as any) { // eslint-disable-line @typescript-eslint/no-explicit-any
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
    const [zoom, setZoom] = useState(1)

    const playCard = useGameStore((s) => s.playCard)

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
                const card = e.active.data.current?.card as CardData | undefined
                if (card) {
                    const hexKey = overId.replace("hex:", "")
                    const msg = `${card.id} → ${overId}`
                    setLastHexLog(msg)
                    const current = useGameStore.getState().board
                    if (!current[hexKey]) {
                        playCard(hexKey, card)
                    }
                    console.log("[Board] Dropped", msg)
                }
            }
        },
    })

    const board = useGameStore((s) => s.board)

    const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        const delta = e.deltaY < 0 ? 0.1 : -0.1
        setZoom((z) => Math.min(2, Math.max(0.5, z + delta)))
    }

    return (
        <div
            ref={setNodeRef}
            className="relative w-full h-full select-none"
            aria-label="Board (droppable)"
            onWheel={handleWheel}
        >
            <svg
                className="w-full h-full"
                viewBox={viewBox}
                role="img"
                aria-label="Hex map"
                style={{ transform: `scale(${zoom})`, transformOrigin: "50% 50%" }}
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

            <div className="absolute top-2 left-2 flex gap-2 text-xs">
                {lastHexLog && (
                    <span className="badge badge-sm badge-outline">Hex drop: {lastHexLog}</span>
                )}
                {lastDrop && (
                    <span className="badge badge-sm badge-ghost">Board drop: {lastDrop}</span>
                )}
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
    occupied?: CardData | undefined
    isDragging: boolean
}) {
    const { setNodeRef, isOver } = useDroppable({ id }) as {
        setNodeRef: (element: SVGGElement | null) => void
        isOver: boolean
    }

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
                <image
                    x={cx - 15}
                    y={cy - 21}
                    width={30}
                    height={42}
                    href={occupied.imageUrl ?? `https://picsum.photos/300/420?random=${encodeURIComponent(occupied.id)}`}
                    preserveAspectRatio="xMidYMid slice"
                />
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
