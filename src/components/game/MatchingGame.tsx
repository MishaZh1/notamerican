"use client"

import { useReducer, useEffect, useRef, useCallback, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, Timer, Flame, Zap, Sparkles } from "lucide-react"

// =============================================================================
// TYPES
// =============================================================================

type CardState = 'IDLE' | 'SELECTED' | 'MATCHED' | 'WRONG' | 'DISAPPEARING' | 'APPEARING'

interface Card {
    id: string
    pairId: string
    content: string
    type: 'text' | 'image'
    position: number  // 0-9
    state: CardState
}

interface MatchedPair {
    cardIndices: [number, number]
    matchedAt: number
    timerId: NodeJS.Timeout
}

type GamePhase = 'INTRO' | 'PLAYING' | 'PAUSED' | 'FINISHED'

interface GameState {
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
    isProcessing: boolean // NEW: Blocks input during animations
}

export interface GameStats {
    score: number
    matches: number
    combo: number
    maxCombo: number
    duration: number
    total: number
}

type Action =
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
    | { type: 'UNLOCK_INPUT' } // NEW: Re-enables input

interface MatchingGameProps {
    pairs: { question: string, answer: string, type?: 'text' | 'flag' }[]
    onComplete?: (stats: GameStats) => void
    passports?: number // For flags game compatibility
    onWrongMatch?: () => void
}

const TOTAL_CARDS = 10
const MATCH_DISPLAY_TIME = 400 // Slightly longer to see the match
const ANIMATION_TIME = 300
const GAME_DURATION = 90 // 90 seconds
const GOAL_MATCHES = 40

// =============================================================================
// REDUCER
// =============================================================================

function gameReducer(state: GameState, action: Action): GameState {
    switch (action.type) {
        case 'INIT_GAME':
            return {
                ...state,
                phase: 'INTRO',
                cards: action.payload.cards,
                timeLeft: GAME_DURATION,
                score: 0,
                combo: 0,
                maxCombo: 0,
                totalMatches: 0,
                isProcessing: false,
                selectedCards: [] // Ensure clean slate
            }

        case 'START_PLAYING':
            return { ...state, phase: 'PLAYING', isProcessing: false }

        case 'TICK_TIMER':
            if (state.timeLeft <= 0) return { ...state, phase: 'FINISHED', timeLeft: 0 }
            return { ...state, timeLeft: state.timeLeft - 1 }

        case 'END_GAME':
            return { ...state, phase: 'FINISHED' }

        case 'SELECT_CARD': {
            // CRITICAL: Block input if processing (animation playing)
            if (state.isProcessing) return state

            const { position } = action.payload
            const card = state.cards.find(c => c.position === position)

            // Basic validation
            if (!card || card.state !== 'IDLE' || state.phase !== 'PLAYING') return state

            // Case 0: Deselect if clicking the same card
            if (state.selectedCards.includes(position)) {
                return {
                    ...state,
                    selectedCards: state.selectedCards.filter(p => p !== position),
                    cards: state.cards.map(c =>
                        c.position === position ? { ...c, state: 'IDLE' } : c
                    )
                }
            }

            // Case 1: First card selection
            if (state.selectedCards.length === 0) {
                return {
                    ...state,
                    selectedCards: [position],
                    cards: state.cards.map(c =>
                        c.position === position ? { ...c, state: 'SELECTED' } : c
                    )
                }
            }

            // Case 2: Second card selection
            if (state.selectedCards.length === 1) {
                const firstPos = state.selectedCards[0]
                const isFirstLeft = firstPos < 5
                const isCurrentLeft = position < 5

                // 2.1: Same column -> Swap selection (Fixes multiple selection glitch)
                if (isFirstLeft === isCurrentLeft) {
                    return {
                        ...state,
                        selectedCards: [position], // Replace selection
                        cards: state.cards.map(c => {
                            if (c.position === position) return { ...c, state: 'SELECTED' }
                            if (c.position === firstPos) return { ...c, state: 'IDLE' }
                            return c
                        })
                    }
                }

                // 2.2: Different column -> LOCK INPUT & Wait for Effect
                return {
                    ...state,
                    isProcessing: true, // LOCK INPUT
                    selectedCards: [...state.selectedCards, position],
                    cards: state.cards.map(c =>
                        c.position === position ? { ...c, state: 'SELECTED' } : c
                    )
                }
            }

            return state
        }

        case 'MATCH_CORRECT': {
            const { positions } = action.payload
            const newCombo = state.combo + 1
            const comboMultiplier = newCombo >= 5 ? 2.0 : (newCombo >= 3 ? 1.5 : 1.0)
            const points = Math.round(10 * comboMultiplier)

            const newOccupied = new Set(state.occupiedPositions)
            newOccupied.add(positions[0])
            newOccupied.add(positions[1])

            return {
                ...state,
                isProcessing: true, // Keep locked
                totalMatches: state.totalMatches + 1,
                combo: newCombo,
                maxCombo: Math.max(state.maxCombo, newCombo),
                score: state.score + points,
                selectedCards: [],
                occupiedPositions: newOccupied,
                cards: state.cards.map(c => {
                    if (positions.includes(c.position)) return { ...c, state: 'MATCHED' }
                    return c
                })
            }
        }

        case 'MATCH_WRONG': {
            const { positions } = action.payload
            return {
                ...state,
                isProcessing: true, // Keep locked
                combo: 0,
                selectedCards: [],
                cards: state.cards.map(c => {
                    if (positions.includes(c.position)) return { ...c, state: 'WRONG' }
                    // Clean up any weird states
                    if (c.state === 'SELECTED') return { ...c, state: 'IDLE' }
                    return c
                })
            }
        }

        case 'CLEAR_WRONG':
            return {
                ...state,
                isProcessing: false, // UNLOCK INPUT
                cards: state.cards.map(c =>
                    c.state === 'WRONG' ? { ...c, state: 'IDLE' } : c
                )
            }

        case 'UNLOCK_INPUT':
            return { ...state, isProcessing: false }

        case 'START_DISAPPEARING': {
            const { positions } = action.payload
            return {
                ...state,
                cards: state.cards.map(c =>
                    positions.includes(c.position) ? { ...c, state: 'DISAPPEARING' } : c
                )
            }
        }

        case 'REPLACE_CARDS': {
            const { oldPositions, newCards } = action.payload
            const newOccupied = new Set(state.occupiedPositions)
            newOccupied.delete(oldPositions[0])
            newOccupied.delete(oldPositions[1])

            const filteredCards = state.cards.filter(c => !oldPositions.includes(c.position))

            return {
                ...state,
                cards: [...filteredCards, ...newCards],
                occupiedPositions: newOccupied
            }
        }

        case 'SET_APPEARING_TO_IDLE': {
            const { cardIds } = action.payload
            return {
                ...state,
                cards: state.cards.map(c =>
                    cardIds.includes(c.id) ? { ...c, state: 'IDLE' } : c
                )
            }
        }

        case 'RESET_SELECTION':
            return {
                ...state,
                selectedCards: [],
                cards: state.cards.map(c =>
                    c.state === 'SELECTED' ? { ...c, state: 'IDLE' } : c
                )
            }

        default:
            return state
    }
}

// =============================================================================
// COMPONENT
// =============================================================================

export function MatchingGame({ pairs, onComplete, passports, onWrongMatch }: MatchingGameProps) {
    const [state, dispatch] = useReducer(gameReducer, {
        phase: 'INTRO',
        cards: [],
        selectedCards: [],
        matchedPairs: [],
        totalMatches: 0,
        combo: 0,
        maxCombo: 0,
        score: 0,
        timeLeft: GAME_DURATION,
        occupiedPositions: new Set<number>(),
        isProcessing: false
    })

    const stateRef = useRef(state)
    const pairsPoolRef = useRef(pairs)
    const matchedPairsRef = useRef<MatchedPair[]>([])

    useEffect(() => { stateRef.current = state }, [state])
    useEffect(() => { pairsPoolRef.current = pairs }, [pairs])

    // Timer
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (state.phase === 'PLAYING') {
            interval = setInterval(() => {
                dispatch({ type: 'TICK_TIMER' })
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [state.phase])

    // End Game Check
    useEffect(() => {
        if (state.phase === 'FINISHED' && onComplete) {
            // Slight delay to show final state
            setTimeout(() => {
                onComplete({
                    score: state.score,
                    matches: state.totalMatches,
                    combo: state.combo,
                    maxCombo: state.maxCombo,
                    duration: 90 - state.timeLeft,
                    total: state.totalMatches
                })
            }, 2000)
        }
    }, [state.phase, state.score, onComplete])

    // Init
    useEffect(() => {
        if (pairs.length === 0) return

        const initialPairs = pairs.slice(0, 5)
        const cards: Card[] = []

        initialPairs.forEach((pair, index) => {
            cards.push({
                id: `card-left-${index}-${Date.now()}`,
                pairId: `pair-${index}`,
                content: pair.question,
                type: 'text',
                position: index,
                state: 'IDLE'
            })
            cards.push({
                id: `card-right-${index}-${Date.now()}`,
                pairId: `pair-${index}`,
                content: pair.answer,
                type: pair.type === 'flag' ? 'image' : 'text',
                position: index + 5,
                state: 'IDLE'
            })
        })

        const leftCards = cards.filter(c => c.position < 5)
        const rightCards = cards.filter(c => c.position >= 5)
        const shuffledRight = rightCards.sort(() => Math.random() - 0.5)
            .map((card, idx) => ({ ...card, position: idx + 5 }))

        dispatch({ type: 'INIT_GAME', payload: { cards: [...leftCards, ...shuffledRight] } })
    }, [pairs])

    // Match Handling
    useEffect(() => {
        if (state.selectedCards.length !== 2) return

        const [pos1, pos2] = state.selectedCards
        const card1 = state.cards.find(c => c.position === pos1)
        const card2 = state.cards.find(c => c.position === pos2)

        if (!card1 || !card2) {
            dispatch({ type: 'RESET_SELECTION' })
            return
        }

        if (card1.pairId === card2.pairId) {
            // Correct
            dispatch({ type: 'MATCH_CORRECT', payload: { positions: [pos1, pos2] } })

            const timerId = setTimeout(() => {
                handleReplacement([pos1, pos2])
            }, MATCH_DISPLAY_TIME)

            matchedPairsRef.current.push({
                cardIndices: [pos1, pos2],
                matchedAt: Date.now(),
                timerId
            })
        } else {
            // Wrong
            if (onWrongMatch) onWrongMatch()
            dispatch({ type: 'MATCH_WRONG', payload: { positions: [pos1, pos2] } })
            setTimeout(() => {
                dispatch({ type: 'CLEAR_WRONG' })
            }, 500)
        }
    }, [state.selectedCards])

    const handleReplacement = useCallback((oldPositions: [number, number]) => {
        dispatch({ type: 'START_DISAPPEARING', payload: { positions: oldPositions } })

        setTimeout(() => {
            const currentState = stateRef.current

            // Reuse the EXACT same positions. No shuffling. No collisions.
            // Sort them so we know which is left (0-4) and right (5-9)
            const sortedPos = [...oldPositions].sort((a, b) => a - b)
            const posLeft = sortedPos[0] // Guaranteed 0-4
            const posRight = sortedPos[1] // Guaranteed 5-9

            // Get new pair
            const currentContent = new Set(currentState.cards.map(c => c.content))
            const availablePairs = pairsPoolRef.current.filter(p => !currentContent.has(p.question))

            // Fallback if pool exhausted
            const randomPair = availablePairs.length > 0
                ? availablePairs[Math.floor(Math.random() * availablePairs.length)]
                : pairsPoolRef.current[Math.floor(Math.random() * pairsPoolRef.current.length)]

            const newPairId = `pair-${Date.now()}-${Math.random()}`

            const newCards: Card[] = [
                {
                    id: `card-${newPairId}-left`,
                    pairId: newPairId,
                    content: randomPair.question,
                    type: 'text',
                    position: posLeft,
                    state: 'APPEARING'
                },
                {
                    id: `card-${newPairId}-right`,
                    pairId: newPairId,
                    content: randomPair.answer,
                    type: randomPair.type === 'flag' ? 'image' : 'text',
                    position: posRight,
                    state: 'APPEARING'
                }
            ]

            dispatch({ type: 'REPLACE_CARDS', payload: { oldPositions, newCards } })

            setTimeout(() => {
                dispatch({
                    type: 'SET_APPEARING_TO_IDLE',
                    payload: { cardIds: newCards.map(c => c.id) }
                })
                dispatch({ type: 'UNLOCK_INPUT' })
            }, ANIMATION_TIME)

        }, ANIMATION_TIME)
    }, [])

    const handleCardClick = (position: number) => {
        dispatch({ type: 'SELECT_CARD', payload: { position } })
    }

    const getCardClass = (card: Card) => {
        const base = "h-24 md:h-32 w-full rounded-2xl border-2 border-b-4 font-bold flex items-center justify-center cursor-pointer transition-all duration-100 select-none text-base md:text-xl relative overflow-hidden"

        // Add specific sizing for text vs flags if needed
        const contentClass = "z-10 text-center px-1"

        if (card.state === 'SELECTED') {
            return cn(base, "border-cyan-500 bg-cyan-100 text-cyan-700 -translate-y-1")
        }
        if (card.state === 'MATCHED') {
            return cn(base, "border-green-500 bg-green-100 text-green-700 scale-95 opacity-50")
        }
        if (card.state === 'WRONG') {
            return cn(base, "border-red-500 bg-red-100 text-red-700 animate-shake")
        }
        if (card.state === 'DISAPPEARING' || card.state === 'APPEARING') {
            return cn(base, "opacity-0 scale-50 p-0 m-0 h-0 w-0 border-0")
        }

        return cn(base, "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 active:border-b-2 active:translate-y-0.5")
    }

    // RENDER: Intro
    if (state.phase === 'INTRO') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center p-6 animate-in fade-in zoom-in duration-300">
                <div className="bg-primary/10 p-6 rounded-full">
                    <Zap className="w-16 h-16 text-primary" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-800">Ready to Match?</h2>
                    <p className="text-slate-500 font-medium">Match pairs as fast as you can. <br />Keep the combo streak alive!</p>
                </div>
                <Button
                    size="lg"
                    className="w-full max-w-xs font-black text-lg h-14 rounded-xl shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                    onClick={() => dispatch({ type: 'START_PLAYING' })}
                >
                    START GAME
                </Button>
            </div>
        )
    }

    // Fixed Slots 0-4 and 5-9
    const leftSlots = [0, 1, 2, 3, 4]
    const rightSlots = [5, 6, 7, 8, 9]

    return (
        <div className="flex flex-col gap-4 w-full max-w-5xl mx-auto p-4 md:p-6">

            {/* HUD */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-slate-100 flex items-center justify-between sticky top-2 z-50">
                {/* Progress / Score */}
                <div className="flex flex-col gap-1 w-1/3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Score</span>
                    <span className="text-xl font-black text-slate-800">{state.score}</span>
                </div>

                {/* Combo */}
                <div className="flex flex-col items-center w-1/3">
                    <div className={cn("flex items-center gap-1 transition-all", state.combo > 1 ? "scale-110" : "scale-100 opacity-50")}>
                        <Flame className={cn("w-5 h-5", state.combo > 4 ? "text-orange-500 fill-orange-500" : "text-slate-400")} />
                        <span className={cn("text-2xl font-black font-mono", state.combo > 4 ? "text-orange-500" : "text-slate-400")}>
                            x{state.combo}
                        </span>
                    </div>
                </div>

                {/* Timer */}
                <div className="flex flex-col items-end w-1/3">
                    <div className="flex items-center gap-1 text-slate-800">
                        <Timer className="w-4 h-4 text-slate-400" />
                        <span className={cn("text-xl font-black font-mono", state.timeLeft < 10 && "text-red-500 animate-pulse")}>
                            {Math.floor(state.timeLeft / 60)}:{String(state.timeLeft % 60).padStart(2, '0')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                    className="h-full bg-green-500 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${Math.min(100, (state.totalMatches / GOAL_MATCHES) * 100)}%` }}
                />
            </div>

            {/* Grid - Fixed Layout */}
            <div className="flex gap-4 md:gap-8 mt-4 relative w-full h-full max-w-4xl mx-auto">
                {/* Overlay for paused/finished */}
                {state.phase === 'FINISHED' && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-xl animate-in fade-in">
                        <Trophy className="w-16 h-16 text-yellow-500 mb-4 animate-bounce" />
                        <span className="text-3xl font-black text-slate-800">Time&apos;s Up!</span>
                    </div>
                )}

                {/* Left Column */}
                <div className="flex-1 flex flex-col gap-4">
                    {leftSlots.map(slotId => {
                        const card = state.cards.find(c => c.position === slotId)
                        // If no card found for slot (shouldn't happen), render empty placeholder
                        if (!card) return <div key={`slot-${slotId}`} className="h-24 md:h-32 invisible" />

                        return (
                            <div key={`container-left-${slotId}`} className="h-24 md:h-32 relative">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={card.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{
                                            opacity: 1,
                                            scale: card.state === 'MATCHED' ? 0.9 : 1,
                                        }}
                                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        onClick={() => handleCardClick(card.position)}
                                        className={getCardClass(card)}
                                    >
                                        <span className="text-center px-4 leading-tight">{card.content}</span>
                                        {card.state === 'MATCHED' && (
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="absolute -top-2 -right-2 bg-green-100 rounded-full p-1 border-2 border-white"
                                            >
                                                <Sparkles className="w-5 h-5 text-green-600 fill-green-200" />
                                            </motion.div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        )
                    })}
                </div>

                {/* Right Column */}
                <div className="flex-1 flex flex-col gap-4">
                    {rightSlots.map(slotId => {
                        const card = state.cards.find(c => c.position === slotId)
                        if (!card) return <div key={`slot-${slotId}`} className="h-24 md:h-32 invisible" />

                        return (
                            <div key={`container-right-${slotId}`} className="h-24 md:h-32 relative">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={card.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{
                                            opacity: 1,
                                            scale: card.state === 'MATCHED' ? 0.9 : 1,
                                        }}
                                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        onClick={() => handleCardClick(card.position)}
                                        className={getCardClass(card)}
                                    >
                                        {card.type === 'image' && card.content.startsWith('/') ? (
                                            <div className="relative w-full h-full flex items-center justify-center p-4">
                                                <img
                                                    src={card.content}
                                                    alt="flag"
                                                    className="max-h-full max-w-full object-contain pointer-events-none drop-shadow-sm"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-center px-4 leading-tight">{card.content}</span>
                                        )}
                                        {card.state === 'MATCHED' && (
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="absolute -top-2 -right-2 bg-green-100 rounded-full p-1 border-2 border-white" // Added border for contrast
                                            >
                                                <Sparkles className="w-5 h-5 text-green-600 fill-green-200" />
                                            </motion.div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
