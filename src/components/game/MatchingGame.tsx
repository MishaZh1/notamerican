"use client"

import { useState, useEffect, useRef } from "react"
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
    onComplete: (stats: GameStats) => void
}

export function MatchingGame({ pairs, onComplete }: MatchingGameProps) {
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

    const [queueIndex, setQueueIndex] = useState(0)
    const BATCH_SIZE = 5

    // Timer
    const [startTime, setStartTime] = useState<number | null>(null)
    const [elapsed, setElapsed] = useState(0)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    // Initialize
    useEffect(() => {
        if (pairs.length === 0) return

        // Take first 5
        const batch = pairs.slice(0, BATCH_SIZE)
        setQueueIndex(BATCH_SIZE)

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
        setStartTime(Date.now())
    }, [pairs])

    useEffect(() => {
        if (startTime) {
            timerRef.current = setInterval(() => {
                setElapsed(Math.floor((Date.now() - startTime) / 1000))
            }, 1000)
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [startTime])

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
            // MATCH! - Duolingo-style Sequence

            // 1. Lock interaction
            setProcessingMatch(true)

            // 2. Immediate Success Updates
            const newScore = score + 10
            setScore(newScore)
            setMatchesCount(prev => prev + 1)

            // 3. Green Phase (Immediate)
            const newFadingSet = new Set(fadingIds)
            newFadingSet.add(leftId)
            newFadingSet.add(rightId)
            setFadingIds(newFadingSet)

            setSelectedLeft(null)
            setSelectedRight(null)

            // 4. Wait 1 second on Green... then Fade Out
            setTimeout(() => {
                const newExitingSet = new Set(exitingIds)
                newExitingSet.add(leftId)
                newExitingSet.add(rightId)
                setExitingIds(newExitingSet)

                // 5. Wait 0.5s for fade out... then Refill
                setTimeout(() => {
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

                        // Clear Animation States
                        setFadingIds(new Set())
                        setExitingIds(new Set())
                        setProcessingMatch(false)
                    } else {
                        // No more pairs - mark as matched (disappear)
                        const newSet = new Set(matchedIds)
                        newSet.add(leftId)
                        newSet.add(rightId)
                        setMatchedIds(newSet)
                        setFadingIds(new Set())
                        setExitingIds(new Set())

                        const activeCount = leftTiles.filter(t => !newSet.has(t.id)).length

                        if (activeCount === 0) {
                            // GAME OVER
                            if (timerRef.current) clearInterval(timerRef.current)
                            setTimeout(() => {
                                onComplete({
                                    score: newScore + 50,
                                    matches: matchesCount + 1,
                                    total: pairs.length,
                                    duration: elapsed
                                })
                            }, 500)
                        } else {
                            setProcessingMatch(false)
                        }
                    }
                }, 500) // 0.5s fade out time
            }, 1000) // 1s green time
        } else {
            // Wrong match
            setWrongPair({ left: leftId, right: rightId })
            setTimeout(() => {
                setWrongPair(null)
                setSelectedLeft(null)
                setSelectedRight(null)
            }, 600)
        }
    }

    const handleTileClick = (tile: TileData) => {
        // Prevent clicks during processing
        if (processingMatch || matchedIds.has(tile.id) || fadingIds.has(tile.id) || exitingIds.has(tile.id)) return

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

    return (
        <div className="flex flex-col gap-4 w-full max-w-lg mx-auto">
            {/* Header / Stats */}
            <div className="flex justify-between items-center px-2 text-slate-500 font-bold">
                <div className="flex items-center gap-2">
                    <TimerIcon className="w-5 h-5" />
                    <span>{elapsed}s</span>
                </div>
                <div>{matchesCount} / {pairs.length}</div>
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
