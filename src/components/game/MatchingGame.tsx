"use client"

import { useReducer, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import Image from "next/image"

export interface MatchingPair {
    id: string
    content: string
    type: 'text' | 'image'
}

interface TileData {
    id: string
    content: string
    type: 'text' | 'image'
    pairId: string
    side: 'left' | 'right'
}

interface GameStats {
    score: number
    matches: number
    total: number
    duration: number // seconds
}

interface MatchingGameProps {
    pairs: { question: string, answer: string, type?: 'text' | 'flag' }[]
    passports?: number
    onWrongMatch?: () => void
    onComplete: (stats: GameStats) => void
}

// ============================================================================
// STATE MACHINE DEFINITION - DUOLINGO STYLE
// ============================================================================

type GameState =
    | 'IDLE'
    | 'SELECTING'
    | 'ANIMATING_FAILURE'
    | 'GAME_OVER'

interface State {
    gameState: GameState
    leftTiles: TileData[]
    rightTiles: TileData[]
    selectedLeft: string | null
    selectedRight: string | null
    animatingIds: Set<string> // Tiles currently animating (success)
    wrongPair: { left: string, right: string } | null
    score: number
    matchesCount: number
    queueIndex: number
    startTime: number | null
    elapsed: number
    isGameOver: boolean
    lastMatchTime: number
}

type Action =
    | { type: 'INITIALIZE_GAME', payload: { leftTiles: TileData[], rightTiles: TileData[], startTime: number } }
    | { type: 'SELECT_TILE', payload: { tileId: string, side: 'left' | 'right' } }
    | { type: 'DESELECT_TILE', payload: { side: 'left' | 'right' } }
    | { type: 'MATCH_SUCCESS', payload: { leftId: string, rightId: string, points: number } }
    | { type: 'MATCH_FAILURE', payload: { leftId: string, rightId: string } }
    | { type: 'REMOVE_MATCHED_TILES', payload: { leftId: string, rightId: string } }
    | { type: 'ADD_NEW_TILES', payload: { newTiles: TileData[] } }
    | { type: 'END_FAILURE_ANIMATION' }
    | { type: 'UPDATE_TIMER', payload: { elapsed: number } }
    | { type: 'GAME_OVER' }

const DISPLAY_SIZE = 5 // Number of pairs visible at once
const TIME_LIMIT = 60

function gameReducer(state: State, action: Action): State {
    switch (action.type) {
        case 'INITIALIZE_GAME':
            return {
                ...state,
                gameState: 'IDLE',
                leftTiles: action.payload.leftTiles,
                rightTiles: action.payload.rightTiles,
                startTime: action.payload.startTime,
                lastMatchTime: action.payload.startTime,
                queueIndex: DISPLAY_SIZE,
                animatingIds: new Set(),
                selectedLeft: null,
                selectedRight: null,
                wrongPair: null,
                score: 0,
                matchesCount: 0,
                elapsed: 0,
                isGameOver: false
            }

        case 'SELECT_TILE': {
            // Only block if this specific tile is animating or if we're in failure animation
            if (state.gameState === 'ANIMATING_FAILURE' || state.gameState === 'GAME_OVER') {
                return state
            }

            const { tileId, side } = action.payload

            // Don't allow selecting tiles that are currently animating out
            if (state.animatingIds.has(tileId)) {
                return state
            }

            if (side === 'left') {
                return {
                    ...state,
                    gameState: 'SELECTING',
                    selectedLeft: tileId
                }
            } else {
                return {
                    ...state,
                    gameState: 'SELECTING',
                    selectedRight: tileId
                }
            }
        }

        case 'DESELECT_TILE': {
            if (state.gameState === 'ANIMATING_FAILURE' || state.gameState === 'GAME_OVER') {
                return state
            }

            if (action.payload.side === 'left') {
                return {
                    ...state,
                    gameState: state.selectedRight ? 'SELECTING' : 'IDLE',
                    selectedLeft: null
                }
            } else {
                return {
                    ...state,
                    gameState: state.selectedLeft ? 'SELECTING' : 'IDLE',
                    selectedRight: null
                }
            }
        }

        case 'MATCH_SUCCESS': {
            const { leftId, rightId, points } = action.payload
            const newAnimatingIds = new Set(state.animatingIds)
            newAnimatingIds.add(leftId)
            newAnimatingIds.add(rightId)

            return {
                ...state,
                animatingIds: newAnimatingIds,
                score: state.score + points,
                matchesCount: state.matchesCount + 1,
                selectedLeft: null,
                selectedRight: null,
                wrongPair: null,
                lastMatchTime: Date.now()
            }
        }

        case 'MATCH_FAILURE': {
            const { leftId, rightId } = action.payload
            return {
                ...state,
                gameState: 'ANIMATING_FAILURE',
                wrongPair: { left: leftId, right: rightId }
            }
        }

        case 'REMOVE_MATCHED_TILES': {
            const { leftId, rightId } = action.payload

            return {
                ...state,
                leftTiles: state.leftTiles.filter(t => t.id !== leftId),
                rightTiles: state.rightTiles.filter(t => t.id !== rightId),
                animatingIds: new Set([...state.animatingIds].filter(id => id !== leftId && id !== rightId))
            }
        }

        case 'ADD_NEW_TILES': {
            const { newTiles } = action.payload
            const newLeftTiles = newTiles.filter(t => t.side === 'left')
            const newRightTiles = newTiles.filter(t => t.side === 'right')

            // Shuffle right tiles for randomization
            const shuffledRightTiles = [...state.rightTiles, ...newRightTiles].sort(() => Math.random() - 0.5)

            return {
                ...state,
                gameState: 'IDLE',
                leftTiles: [...state.leftTiles, ...newLeftTiles],
                rightTiles: shuffledRightTiles
            }
        }

        case 'END_FAILURE_ANIMATION':
            return {
                ...state,
                gameState: 'IDLE',
                wrongPair: null,
                selectedLeft: null,
                selectedRight: null
            }

        case 'UPDATE_TIMER':
            return {
                ...state,
                elapsed: action.payload.elapsed
            }

        case 'GAME_OVER':
            return {
                ...state,
                gameState: 'GAME_OVER',
                isGameOver: true
            }

        default:
            return state
    }
}

const initialState: State = {
    gameState: 'IDLE',
    leftTiles: [],
    rightTiles: [],
    selectedLeft: null,
    selectedRight: null,
    animatingIds: new Set(),
    wrongPair: null,
    score: 0,
    matchesCount: 0,
    queueIndex: 0,
    startTime: null,
    elapsed: 0,
    isGameOver: false,
    lastMatchTime: Date.now()
}

// ============================================================================
// COMPONENT
// ============================================================================

export function MatchingGame({ pairs, passports, onWrongMatch, onComplete }: MatchingGameProps) {
    const [state, dispatch] = useReducer(gameReducer, initialState)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const pairsRef = useRef(pairs)
    const queueIndexRef = useRef(DISPLAY_SIZE)

    // Update pairs ref when props change
    useEffect(() => {
        pairsRef.current = pairs
    }, [pairs])

    // ========================================================================
    // INITIALIZATION
    // ========================================================================
    useEffect(() => {
        if (pairs.length === 0) return

        const batch = pairs.slice(0, DISPLAY_SIZE)

        const lefts: TileData[] = batch.map((p, i) => ({
            id: `l-${i}-${Date.now()}`,
            content: p.question,
            type: 'text',
            pairId: `p-${i}`,
            side: 'left'
        }))

        const rights: TileData[] = batch.map((p, i) => ({
            id: `r-${i}-${Date.now()}`,
            content: p.answer,
            type: p.type === 'flag' ? 'image' : 'text',
            pairId: `p-${i}`,
            side: 'right'
        }))

        const shuffledRights = rights.sort(() => Math.random() - 0.5)
        const now = Date.now()

        dispatch({
            type: 'INITIALIZE_GAME',
            payload: {
                leftTiles: lefts,
                rightTiles: shuffledRights,
                startTime: now
            }
        })

        queueIndexRef.current = DISPLAY_SIZE
    }, [pairs])

    // ========================================================================
    // TIMER
    // ========================================================================
    useEffect(() => {
        if (state.startTime && !state.isGameOver) {
            timerRef.current = setInterval(() => {
                const now = Date.now()
                const diff = Math.floor((now - state.startTime!) / 1000)
                dispatch({ type: 'UPDATE_TIMER', payload: { elapsed: diff } })

                if (diff >= TIME_LIMIT) {
                    dispatch({ type: 'GAME_OVER' })
                }
            }, 100)
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [state.startTime, state.isGameOver])

    // ========================================================================
    // HEARTS MONITOR
    // ========================================================================
    useEffect(() => {
        if (passports !== undefined && passports <= 0 && !state.isGameOver) {
            dispatch({ type: 'GAME_OVER' })
        }
    }, [passports, state.isGameOver])

    // ========================================================================
    // GAME OVER HANDLER
    // ========================================================================
    useEffect(() => {
        if (state.isGameOver) {
            if (timerRef.current) clearInterval(timerRef.current)

            setTimeout(() => {
                onComplete({
                    score: state.score,
                    matches: state.matchesCount,
                    total: pairs.length,
                    duration: TIME_LIMIT
                })
            }, 500)
        }
    }, [state.isGameOver, state.score, state.matchesCount, pairs.length, onComplete])

    // ========================================================================
    // AUTO-CHECK MATCH WHEN BOTH SELECTED
    // ========================================================================
    useEffect(() => {
        if (state.selectedLeft && state.selectedRight && state.gameState === 'SELECTING') {
            const leftTile = state.leftTiles.find(t => t.id === state.selectedLeft)
            const rightTile = state.rightTiles.find(t => t.id === state.selectedRight)

            if (!leftTile || !rightTile) return

            if (leftTile.pairId === rightTile.pairId) {
                // CORRECT MATCH
                const now = Date.now()
                const timeSinceLast = (now - state.lastMatchTime) / 1000

                let points = Math.max(10, Math.round(100 - (timeSinceLast * 8)))
                if (timeSinceLast < 1.5) points = 100

                dispatch({
                    type: 'MATCH_SUCCESS',
                    payload: {
                        leftId: state.selectedLeft,
                        rightId: state.selectedRight,
                        points
                    }
                })

                // Remove tiles after animation (800ms)
                setTimeout(() => {
                    dispatch({
                        type: 'REMOVE_MATCHED_TILES',
                        payload: {
                            leftId: leftTile.id,
                            rightId: rightTile.id
                        }
                    })

                    // Add new tiles immediately if available
                    const currentQueueIndex = queueIndexRef.current
                    if (currentQueueIndex < pairsRef.current.length) {
                        const nextPair = pairsRef.current[currentQueueIndex]
                        const timestamp = Date.now()

                        const newTiles: TileData[] = [
                            {
                                id: `l-${currentQueueIndex}-${timestamp}`,
                                content: nextPair.question,
                                type: 'text',
                                pairId: `p-${currentQueueIndex}`,
                                side: 'left'
                            },
                            {
                                id: `r-${currentQueueIndex}-${timestamp}`,
                                content: nextPair.answer,
                                type: nextPair.type === 'flag' ? 'image' : 'text',
                                pairId: `p-${currentQueueIndex}`,
                                side: 'right'
                            }
                        ]

                        dispatch({ type: 'ADD_NEW_TILES', payload: { newTiles } })
                        queueIndexRef.current = currentQueueIndex + 1
                    }
                }, 800)

            } else {
                // WRONG MATCH
                if (onWrongMatch) onWrongMatch()

                dispatch({
                    type: 'MATCH_FAILURE',
                    payload: {
                        leftId: state.selectedLeft,
                        rightId: state.selectedRight
                    }
                })

                setTimeout(() => {
                    dispatch({ type: 'END_FAILURE_ANIMATION' })
                }, 600)
            }
        }
    }, [state.selectedLeft, state.selectedRight, state.gameState, state.leftTiles, state.rightTiles, state.lastMatchTime, onWrongMatch])

    // ========================================================================
    // TILE CLICK HANDLER
    // ========================================================================
    const handleTileClick = useCallback((tile: TileData) => {
        // Block input during failure animation or game over
        if (
            state.gameState === 'ANIMATING_FAILURE' ||
            state.gameState === 'GAME_OVER' ||
            state.animatingIds.has(tile.id)
        ) {
            return
        }

        if (tile.side === 'left') {
            if (state.selectedLeft === tile.id) {
                dispatch({ type: 'DESELECT_TILE', payload: { side: 'left' } })
            } else {
                dispatch({ type: 'SELECT_TILE', payload: { tileId: tile.id, side: 'left' } })
            }
        } else {
            if (state.selectedRight === tile.id) {
                dispatch({ type: 'DESELECT_TILE', payload: { side: 'right' } })
            } else {
                dispatch({ type: 'SELECT_TILE', payload: { tileId: tile.id, side: 'right' } })
            }
        }
    }, [state.gameState, state.selectedLeft, state.selectedRight, state.animatingIds])

    // ========================================================================
    // RENDERING HELPERS
    // ========================================================================
    const getTileClass = (tile: TileData) => {
        const isSelected = (tile.side === 'left' && state.selectedLeft === tile.id) ||
            (tile.side === 'right' && state.selectedRight === tile.id)
        const isAnimating = state.animatingIds.has(tile.id)
        const isWrong = (state.wrongPair?.left === tile.id) || (state.wrongPair?.right === tile.id)

        let classes = "relative h-28 w-full rounded-2xl border-2 border-b-4 font-black flex items-center justify-center cursor-pointer transition-all duration-200 select-none overflow-hidden "

        if (isWrong) {
            classes += "border-red-500 bg-red-100 text-red-500 animate-shake "
        } else if (isAnimating) {
            classes += "border-green-500 bg-green-100 text-green-600 "
        } else if (isSelected) {
            classes += "border-blue-400 bg-blue-100 text-blue-600 "
        } else {
            classes += "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 "
        }

        return cn(classes)
    }

    // ========================================================================
    // RENDER
    // ========================================================================
    if (state.leftTiles.length === 0) {
        return <Loader2 className="animate-spin text-primary" />
    }

    const progressPercent = Math.max(0, (1 - (state.elapsed / TIME_LIMIT)) * 100)

    return (
        <div className="flex flex-col gap-4 w-full max-w-lg mx-auto">
            {/* Timeline Bar */}
            <div className="px-2 w-full">
                <div className="flex justify-between text-xs text-slate-400 font-bold mb-1">
                    <span>{Math.max(0, TIME_LIMIT - state.elapsed)}s</span>
                    <span>Blitz Mode</span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                    <div
                        className="h-full bg-green-500 transition-all duration-1000 ease-linear"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="text-center font-black text-2xl text-slate-700">
                {state.matchesCount} Matches
            </div>

            <div className="flex gap-4 w-full">
                {/* LEFT COLUMN */}
                <div className="flex-1 flex flex-col gap-3">
                    <AnimatePresence mode="popLayout">
                        {state.leftTiles.map(tile => (
                            <motion.div
                                key={tile.id}
                                layout
                                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, x: -100 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30
                                }}
                                onClick={() => handleTileClick(tile)}
                                className={getTileClass(tile)}
                            >
                                <span className="text-center px-1 text-sm md:text-base leading-tight pointer-events-none">
                                    {tile.content}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* RIGHT COLUMN */}
                <div className="flex-1 flex flex-col gap-3">
                    <AnimatePresence mode="popLayout">
                        {state.rightTiles.map(tile => (
                            <motion.div
                                key={tile.id}
                                layout
                                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, x: 100 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30
                                }}
                                onClick={() => handleTileClick(tile)}
                                className={getTileClass(tile)}
                            >
                                {tile.type === 'image' ? (
                                    <div className="relative w-full h-full p-3 pointer-events-none">
                                        <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-slate-300 shadow-md bg-white">
                                            <Image
                                                src={tile.content}
                                                alt="flag"
                                                fill
                                                className="object-contain p-1"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-center px-1 text-sm md:text-base leading-tight pointer-events-none">
                                        {tile.content}
                                    </span>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
