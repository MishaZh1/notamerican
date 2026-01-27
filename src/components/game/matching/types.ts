// =============================================================================
// TYPES FOR MATCHING GAME
// =============================================================================

export type CardState = 'IDLE' | 'SELECTED' | 'MATCHED' | 'WRONG' | 'DISAPPEARING' | 'APPEARING'

export interface Card {
    id: string
    pairId: string
    content: string
    type: 'text' | 'image'
    position: number  // 0-9
    state: CardState
}

export interface MatchedPair {
    cardIndices: [number, number]
    matchedAt: number
    timerId: NodeJS.Timeout
}

export type GamePhase = 'INTRO' | 'PLAYING' | 'PAUSED' | 'FINISHED'

export interface GameState {
    phase: GamePhase
    cards: Card[]
    selectedCards: number[]
    matchedPairs: MatchedPair[]
    totalMatches: number
    combo: number
    maxCombo: number
    score: number
    timeLeft: number
    occupiedPositions: Set<number>
    isProcessing: boolean // Blocks input during animations
}

export interface GameStats {
    score: number
    matches: number
    combo: number
    maxCombo: number
    duration: number
    total: number
}

export type GameAction =
    | { type: 'INIT_GAME', payload: { cards: Card[] } }
    | { type: 'START_PLAYING' }
    | { type: 'TICK_TIMER' }
    | { type: 'SELECT_CARD', payload: { position: number } }
    | { type: 'MATCH_CORRECT', payload: { positions: [number, number] } }
    | { type: 'MATCH_WRONG', payload: { positions: [number, number] } }
    | { type: 'CLEAR_WRONG' }
    | { type: 'START_DISAPPEARING', payload: { positions: [number, number] } }
    | { type: 'REPLACE_CARDS', payload: { oldPositions: [number, number], newCards: Card[] } }
    | { type: 'SET_APPEARING_TO_IDLE', payload: { cardIds: string[] } }
    | { type: 'RESET_SELECTION' }
    | { type: 'END_GAME' }
    | { type: 'UNLOCK_INPUT' } // Re-enables input

export interface MatchingGameProps {
    pairs: { question: string, answer: string, type?: 'text' | 'flag' }[]
    onComplete?: (stats: GameStats) => void
    passports?: number // For flags game compatibility
    onWrongMatch?: () => void
}

export interface PairData {
    question: string
    answer: string
    type?: 'text' | 'flag'
}
