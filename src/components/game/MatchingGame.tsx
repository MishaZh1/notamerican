"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Loader2, Timer as TimerIcon } from "lucide-react"
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

export function MatchingGame({ pairs, passports, onWrongMatch, onComplete }: MatchingGameProps) {
    const [leftTiles, setLeftTiles] = useState<TileData[]>([])
    const [rightTiles, setRightTiles] = useState<TileData[]>([])

    // Selection
    const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
    const [selectedRight, setSelectedRight] = useState<string | null>(null)

    const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set())
    const [wrongPair, setWrongPair] = useState<{ left: string, right: string } | null>(null)
    const [processingMatch, setProcessingMatch] = useState(false)

    // Animation States
    const [fadingIds, setFadingIds] = useState<Set<string>>(new Set()) // Green phase
    const [exitingIds, setExitingIds] = useState<Set<string>>(new Set()) // Fade out phase

    const [score, setScore] = useState(0)
    const [matchesCount, setMatchesCount] = useState(0)

    // Refs for safe access in timer/callbacks
    const scoreRef = useRef(0)
    const matchesRef = useRef(0)
    const lastMatchTimeRef = useRef<number>(Date.now())

    const [queueIndex, setQueueIndex] = useState(0)
    const BATCH_SIZE_ACTUAL = 5

    // Timer
    const TIME_LIMIT = 60
    const [startTime, setStartTime] = useState<number | null>(null)
    const [elapsed, setElapsed] = useState(0)
    const [isGameOver, setIsGameOver] = useState(false)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    // Initialize
    useEffect(() => {
        if (pairs.length === 0) return

        // Take first batch
        const batch = pairs.slice(0, BATCH_SIZE_ACTUAL)
        setQueueIndex(BATCH_SIZE_ACTUAL)

        const lefts: TileData[] = batch.map((p, i) => ({
            id: `l-${i}`, content: p.question, type: 'text', pairId: `p-${i}`, side: 'left'
        }))

        const rights: TileData[] = batch.map((p, i) => ({
            id: `r-${i}`,
            content: p.answer,
            type: p.type === 'flag' ? 'image' : 'text',
            pairId: `p-${i}`,
            side: 'right'
        }))

        setRightTiles(rights.sort(() => Math.random() - 0.5))
        setLeftTiles(lefts)

        // Start Timer
        const now = Date.now()
        setStartTime(now)
        lastMatchTimeRef.current = now // Reset match timer
    }, [pairs])

    useEffect(() => {
        if (startTime && !isGameOver) {
            timerRef.current = setInterval(() => {
                const now = Date.now()
                const diff = Math.floor((now - startTime) / 1000)
                setElapsed(diff)

                if (diff >= TIME_LIMIT) {
                    // TIME IS UP!
                    handleGameOver()
                }
            }, 100)
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [startTime, isGameOver])

    // Handle Game Over
    const handleGameOver = useCallback(() => {
        setIsGameOver(true)
        if (timerRef.current) clearInterval(timerRef.current)

        // Wait a small moment then call complete
        setTimeout(() => {
            onComplete({
                score: scoreRef.current, // Use Ref to avoid stale closure
                matches: matchesRef.current,
                total: pairs.length,
                duration: TIME_LIMIT
            })
        }, 500)
    }, [onComplete, pairs.length])

    useEffect(() => {
        if (elapsed >= TIME_LIMIT && !isGameOver) {
            handleGameOver()
        }
    }, [elapsed, isGameOver, handleGameOver])


    const getNextPair = () => {
        if (queueIndex >= pairs.length) return null
        const pair = pairs[queueIndex]
        setQueueIndex(prev => prev + 1)
        return { pair, idSuffix: queueIndex }
    }

    const checkMatch = (leftId: string, rightId: string) => {
        const leftTile = leftTiles.find(t => t.id === leftId)
        const rightTile = rightTiles.find(t => t.id === rightId)
        if (!leftTile || !rightTile) return

        if (leftTile.pairId === rightTile.pairId) {
            // MATCH!
            setProcessingMatch(true)

            // --- Dynamic Scoring Logic ---
            const now = Date.now()
            const timeSinceLast = (now - lastMatchTimeRef.current) / 1000 // seconds
            lastMatchTimeRef.current = now // Reset for next match

            // 100 pts if < 2s, decays to 10 pts over 10s
            // Formula: Max 100, Min 10. Loss of ~10 pts per sec after 1st sec?
            // Let's try: Base 100 - (Time * 8).
            let points = Math.max(10, Math.round(100 - (timeSinceLast * 8)))
            if (timeSinceLast < 1.5) points = 100 // Speed bonus for instant

            // Update State & Refs
            setScore(s => {
                const newScore = s + points
                scoreRef.current = newScore
                return newScore
            })
            setMatchesCount(m => {
                const newCount = m + 1
                matchesRef.current = newCount
                return newCount
            })

            const newFadingSet = new Set(fadingIds)
            newFadingSet.add(leftId)
            newFadingSet.add(rightId)
            setFadingIds(newFadingSet)

            setSelectedLeft(null)
            setSelectedRight(null)

            setTimeout(() => {
                const newExitingSet = new Set(exitingIds)
                newExitingSet.add(leftId)
                newExitingSet.add(rightId)
                setExitingIds(newExitingSet)

                setTimeout(() => {
                    if (isGameOver) return // Don't refill if game ended

                    const next = getNextPair()
                    if (next) {
                        setLeftTiles(prev => prev.map(t =>
                            t.id === leftId ? {
                                id: `l-${next.idSuffix}`,
                                content: next.pair.question,
                                type: 'text',
                                pairId: `p-${next.idSuffix}`,
                                side: 'left'
                            } : t
                        ))
                        setRightTiles(prev => prev.map(t =>
                            t.id === rightId ? {
                                id: `r-${next.idSuffix}`,
                                content: next.pair.answer,
                                type: next.pair.type === 'flag' ? 'image' : 'text',
                                pairId: `p-${next.idSuffix}`,
                                side: 'right'
                            } : t
                        ))

                        setFadingIds(new Set())
                        setExitingIds(new Set())
                        setProcessingMatch(false)
                    } else {
                        // Empty Spots Logic (Just hide them)
                        const newSet = new Set(matchedIds)
                        newSet.add(leftId)
                        newSet.add(rightId)
                        setMatchedIds(newSet)
                        setFadingIds(new Set())
                        setExitingIds(new Set())
                        setProcessingMatch(false)
                        // DO NOT Trigger Auto-End. Wait for timer.
                    }
                }, 200) // Reduced from 500
            }, 500) // Reduced from 1000
        } else {
            // Wrong match
            if (onWrongMatch) onWrongMatch() // Deduct passport
            setWrongPair({ left: leftId, right: rightId })
            setTimeout(() => {
                setWrongPair(null)
                setSelectedLeft(null)
                setSelectedRight(null)
            }, 600)
        }
    }

    const handleTileClick = (tile: TileData) => {
        // Prevent clicks on already matched or processing tiles ONLY
        if (isGameOver || matchedIds.has(tile.id) || fadingIds.has(tile.id) || exitingIds.has(tile.id)) return

        if (tile.side === 'left') {
            if (selectedLeft === tile.id) setSelectedLeft(null)
            else {
                setSelectedLeft(tile.id)
                if (selectedRight) checkMatch(tile.id, selectedRight)
            }
        } else {
            if (selectedRight === tile.id) setSelectedRight(null)
            else {
                setSelectedRight(tile.id)
                if (selectedLeft) checkMatch(selectedLeft, tile.id)
            }
        }
    }

    if (leftTiles.length === 0) return <Loader2 className="animate-spin text-primary" />

    const getTileClass = (tile: TileData) => {
        const isSelected = (tile.side === 'left' && selectedLeft === tile.id) || (tile.side === 'right' && selectedRight === tile.id)
        const isMatched = matchedIds.has(tile.id)
        const isFading = fadingIds.has(tile.id) // Green phase
        const isExiting = exitingIds.has(tile.id) // Fade out phase
        const isWrong = (wrongPair?.left === tile.id) || (wrongPair?.right === tile.id)

        let classes = "relative h-28 w-full rounded-2xl border-2 border-b-4 font-black flex items-center justify-center cursor-pointer transition-colors select-none overflow-hidden "

        if (isWrong) classes += "border-red-500 bg-red-100 text-red-500 animate-shake "
        else if (isFading || isExiting) classes += "border-green-500 bg-green-100 text-green-600 " // Keep Green during fade out
        else if (isSelected) classes += "border-blue-400 bg-blue-100 text-blue-600 "
        else classes += "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 "

        if (isMatched) classes += "opacity-0 pointer-events-none "

        return cn(classes)
    }

    const getAnimationProps = (tile: TileData) => {
        if (exitingIds.has(tile.id)) {
            return {
                initial: { opacity: 1, scale: 1 },
                animate: { opacity: 0, scale: 0.8 },
                transition: { duration: 0.4 }
            }
        }
        if (fadingIds.has(tile.id)) {
            return {
                animate: { scale: 1.05 },
                transition: { type: "spring" as const, stiffness: 300, damping: 20 }
            }
        }
        // Entering (New tile)
        return {
            initial: { opacity: 0, scale: 0.5 },
            animate: { opacity: 1, scale: 1 },
            transition: { type: "spring" as const, stiffness: 300, damping: 25 }
        }
    }

    const progressPercent = Math.max(0, (1 - (elapsed / TIME_LIMIT)) * 100)

    return (
        <div className="flex flex-col gap-4 w-full max-w-lg mx-auto">
            {/* Timeline Bar */}
            <div className="px-2 w-full">
                <div className="flex justify-between text-xs text-slate-400 font-bold mb-1">
                    <span>{Math.max(0, TIME_LIMIT - elapsed)}s</span>
                    <span>Blitz Mode</span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                    <div
                        className="h-full bg-green-500 transition-all duration-1000 ease-linear"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Stats (Score Only) */}
            <div className="text-center font-black text-2xl text-slate-700">
                {matchesCount} Matches
            </div>

            <div className="flex gap-4 w-full">
                {/* LEFT COLUMN */}
                <div className="flex-1 flex flex-col gap-3">
                    {leftTiles.map(tile => (
                        <motion.div
                            key={tile.id}
                            layout
                            onClick={() => handleTileClick(tile)}
                            className={getTileClass(tile)}
                            {...getAnimationProps(tile)}
                        >
                            <span className="text-center px-1 text-sm md:text-base leading-tight">
                                {tile.content}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* RIGHT COLUMN */}
                <div className="flex-1 flex flex-col gap-3">
                    {rightTiles.map(tile => (
                        <motion.div
                            key={tile.id}
                            layout
                            onClick={() => handleTileClick(tile)}
                            className={getTileClass(tile)}
                            {...getAnimationProps(tile)}
                        >
                            {tile.type === 'image' ? (
                                <div className="relative w-full h-full p-3">
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
                                <span className="text-center px-1 text-sm md:text-base leading-tight">
                                    {tile.content}
                                </span>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
