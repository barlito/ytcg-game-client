import { useState, useCallback } from 'react'
import type { DragMoveEvent, DragOverEvent } from '@dnd-kit/core'
import { canPlayCardAt, type ValidationResult } from '../utils/validation'
import type { BoardCell, HexKey } from '../types'

type UseDropValidationReturn = {
    currentTarget: HexKey | null
    validationResult: ValidationResult | null
    handleDragMove: (e: DragMoveEvent) => void
    handleDragOver: (e: DragOverEvent) => void
    reset: () => void
}

/**
 * Hook to manage drop validation and preview feedback
 */
export function useDropValidation(
    board: Record<HexKey, BoardCell>,
    currentPlayerId?: string,
    isPlayerTurn?: boolean
): UseDropValidationReturn {
    const [currentTarget, setCurrentTarget] = useState<HexKey | null>(null)
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

    const handleDragMove = useCallback((e: DragMoveEvent) => {
        const overId = e.over?.id
        if (typeof overId === 'string' && overId.startsWith('hex:')) {
            const hexKey = overId.replace('hex:', '')
            setCurrentTarget(hexKey)

            const result = canPlayCardAt(hexKey, board, currentPlayerId, isPlayerTurn)
            setValidationResult(result)
        } else {
            setCurrentTarget(null)
            setValidationResult(null)
        }
    }, [board, currentPlayerId, isPlayerTurn])

    const handleDragOver = useCallback((e: DragOverEvent) => {
        const overId = e.over?.id
        if (typeof overId === 'string' && overId.startsWith('hex:')) {
            const hexKey = overId.replace('hex:', '')
            setCurrentTarget(hexKey)

            const result = canPlayCardAt(hexKey, board, currentPlayerId, isPlayerTurn)
            setValidationResult(result)
        } else {
            setCurrentTarget(null)
            setValidationResult(null)
        }
    }, [board, currentPlayerId, isPlayerTurn])

    const reset = useCallback(() => {
        setCurrentTarget(null)
        setValidationResult(null)
    }, [])

    return {
        currentTarget,
        validationResult,
        handleDragMove,
        handleDragOver,
        reset,
    }
}
