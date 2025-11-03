/**
 * Game types shared between client and server
 * These should match the Colyseus server schema
 */

export type CardRarity = 'C' | 'R' | 'SR' | 'UR'

export type CardData = {
    id: string
    name: string
    cost: number
    rarity?: CardRarity
    clan?: string
    imageUrl?: string
}

export type HexCoord = {
    q: number
    r: number
}

export type HexKey = string // Format: "q,r"

export type Player = {
    id: string
    name: string
    hand: CardData[]
    territories: HexKey[] // Hex cells controlled by this player
}

export type BoardCell = {
    coord: HexCoord
    key: HexKey
    card?: CardData
    ownerId?: string // Player who owns this territory
}

export type GameState = {
    players: Record<string, Player> // Keyed by player ID
    board: Record<HexKey, BoardCell>
    currentTurn: string | null // Player ID whose turn it is
    phase: 'waiting' | 'playing' | 'ended'
    winner?: string
}

// Client-side UI state (not synced with server)
export type UIState = {
    activeCardId: string | null
    isDragging: boolean
    hoveredHex: HexKey | null
}

// Commands sent to server
export type PlayCardCommand = {
    cardId: string
    hexKey: HexKey
}

export type EndTurnCommand = Record<string, never> // Empty object
