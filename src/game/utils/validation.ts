import type { BoardCell, HexKey, GameState } from '../types'

/**
 * Game rules validation utilities
 */

export type ValidationResult = {
    valid: boolean
    reason?: string
}

/**
 * Check if a card can be played at a specific hex position
 *
 * @param hexKey - Target hex position
 * @param board - Current board state
 * @param currentPlayerId - ID of the player attempting to play
 * @param isPlayerTurn - Whether it's currently this player's turn
 */
export function canPlayCardAt(
    hexKey: HexKey,
    board: Record<HexKey, BoardCell>,
    currentPlayerId?: string,
    isPlayerTurn?: boolean
): ValidationResult {
    // Rule 1: Cell must exist (in bounds)
    const cell = board[hexKey]
    if (!cell) {
        return { valid: false, reason: 'Cell is out of bounds' }
    }

    // Rule 2: Cell must be empty
    if (cell.card) {
        return { valid: false, reason: 'Cell is already occupied' }
    }

    // Rule 3: Must be player's turn (if multiplayer)
    if (isPlayerTurn !== undefined && !isPlayerTurn) {
        return { valid: false, reason: 'Not your turn' }
    }

    // Rule 4: Cell must not be owned by opponent (if applicable)
    if (cell.ownerId && currentPlayerId && cell.ownerId !== currentPlayerId) {
        return { valid: false, reason: 'Cell is controlled by opponent' }
    }

    return { valid: true }
}

/**
 * Get all valid drop targets for a card
 */
export function getValidDropTargets(
    board: Record<HexKey, BoardCell>,
    currentPlayerId?: string,
    isPlayerTurn?: boolean
): Set<HexKey> {
    const validTargets = new Set<HexKey>()

    for (const [hexKey, cell] of Object.entries(board)) {
        const result = canPlayCardAt(hexKey, board, currentPlayerId, isPlayerTurn)
        if (result.valid) {
            validTargets.add(hexKey)
        }
    }

    return validTargets
}
