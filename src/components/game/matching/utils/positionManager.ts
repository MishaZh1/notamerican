// =============================================================================
// POSITION POOL MANAGEMENT
// =============================================================================

/**
 * Determines if a position is in the left column (0-4)
 */
export function isLeftPosition(position: number): boolean {
    return position < 5
}

/**
 * Determines if a position is in the right column (5-9)
 */
export function isRightPosition(position: number): boolean {
    return position >= 5
}

/**
 * Extracts left and right positions from a pair
 */
export function splitPositions(positions: [number, number]): { left: number, right: number } {
    const [pos1, pos2] = positions
    return {
        left: pos1 < 5 ? pos1 : pos2,
        right: pos1 >= 5 ? pos1 : pos2
    }
}

/**
 * Gets a random item from an array
 */
export function getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
}

/**
 * Shuffles an array in place (Fisher-Yates algorithm)
 */
export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}
