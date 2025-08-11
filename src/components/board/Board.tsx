import React from 'react'
import { useDroppable } from '@dnd-kit/core'

type Props = {
    lastDrop: string | null
}

export default function Board({ lastDrop }: Props) {
    const { isOver, setNodeRef } = useDroppable({ id: 'board' })

    return (
        <div className="grid gap-4">
            <div
                ref={setNodeRef}
                className={[
                    'h-80 rounded-2xl border bg-base-100/40 flex items-center justify-center transition-colors',
                    isOver ? 'border-primary' : 'border-dashed border-base-300'
                ].join(' ')}
            >
                <span className="opacity-70">{isOver ? 'Release to drop' : 'Drop a card here'}</span>
            </div>

            <div className="stats bg-base-100 shadow">
                <div className="stat">
                    <div className="stat-title">Last dropped card</div>
                    <div className="stat-value text-xl">{lastDrop ?? '—'}</div>
                    <div className="stat-desc">On branchera ça sur la map hex ensuite</div>
                </div>
            </div>
        </div>
    )
}
