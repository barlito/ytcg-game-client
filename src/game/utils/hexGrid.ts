import type { HexCoord, HexKey } from '../types'

/**
 * Utilities for hexagonal grid calculations
 * Uses axial coordinates (q, r) system
 */

/**
 * Convert hex coordinates to a unique string key
 */
export function hexToKey(coord: HexCoord): HexKey {
    return `${coord.q},${coord.r}`
}

/**
 * Parse a hex key string back to coordinates
 */
export function keyToHex(key: HexKey): HexCoord {
    const [q, r] = key.split(',').map(Number)
    return { q, r }
}

/**
 * Calculate axial distance between two hexes
 * https://www.redblobgames.com/grids/hexagons/#distances
 */
export function hexDistance(a: HexCoord, b: HexCoord): number {
    const dq = Math.abs(a.q - b.q)
    const dr = Math.abs(a.r - b.r)
    const ds = Math.abs((a.q + a.r) - (b.q + b.r))
    return Math.max(dq, dr, ds)
}

/**
 * Get all 6 neighbors of a hex cell
 * Directions: East, NE, NW, West, SW, SE
 */
export function hexNeighbors(coord: HexCoord): HexCoord[] {
    const directions = [
        { q: 1, r: 0 },   // E
        { q: 1, r: -1 },  // NE
        { q: 0, r: -1 },  // NW
        { q: -1, r: 0 },  // W
        { q: -1, r: 1 },  // SW
        { q: 0, r: 1 },   // SE
    ]

    return directions.map(dir => ({
        q: coord.q + dir.q,
        r: coord.r + dir.r,
    }))
}

/**
 * Check if a hex is adjacent to another (distance = 1)
 */
export function hexIsAdjacent(a: HexCoord, b: HexCoord): boolean {
    return hexDistance(a, b) === 1
}

/**
 * Get all hexes within a certain range
 */
export function hexInRange(center: HexCoord, range: number): HexCoord[] {
    const results: HexCoord[] = []

    for (let q = -range; q <= range; q++) {
        for (let r = Math.max(-range, -q - range); r <= Math.min(range, -q + range); r++) {
            results.push({
                q: center.q + q,
                r: center.r + r,
            })
        }
    }

    return results
}

/**
 * Check if two hex coordinates are equal
 */
export function hexEquals(a: HexCoord, b: HexCoord): boolean {
    return a.q === b.q && a.r === b.r
}

/**
 * Common preset layouts for game boards
 */
export const HexLayouts = {
    /**
     * Small cluster (7 hexes) - good for quick games
     */
    SMALL: [
        [0, 0],
        [1, 0],
        [0, 1],
        [-1, 1],
        [1, -1],
        [2, -1],
        [2, 0],
    ] as [number, number][],

    /**
     * Medium hexagon (19 hexes) - balanced gameplay
     */
    MEDIUM: (() => {
        const hexes: [number, number][] = []
        for (let q = -2; q <= 2; q++) {
            for (let r = Math.max(-2, -q - 2); r <= Math.min(2, -q + 2); r++) {
                hexes.push([q, r])
            }
        }
        return hexes
    })(),

    /**
     * Large hexagon (37 hexes) - long games
     */
    LARGE: (() => {
        const hexes: [number, number][] = []
        for (let q = -3; q <= 3; q++) {
            for (let r = Math.max(-3, -q - 3); r <= Math.min(3, -q + 3); r++) {
                hexes.push([q, r])
            }
        }
        return hexes
    })(),
}
