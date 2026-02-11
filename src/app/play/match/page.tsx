"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { MatchingGame } from "@/components/game/MatchingGame"
import { Button } from "@/components/ui/button"
import { Loader2, Lock } from "lucide-react"
import { CONTINENTS } from "@/lib/data/continent-mapping"
import { TOP_CAPITALS } from "@/lib/data/capitals"
import { cn } from "@/lib/utils"
import { submitGameScore } from "@/app/actions-social"
import { createClient } from "@/lib/supabase/client"
import { canPlayGame, getHeartsForCurrentGame, startGame } from "@/app/actions-hearts"
import { PremiumModal } from "@/components/monetization/PremiumModal"

export default function MatchPage() {
    const router = useRouter()
    const [allPairs, setAllPairs] = useState<{ question: string, answer: string, type?: 'flag' | 'text', continent?: string }[]>([])
    const [filteredPairs, setFilteredPairs] = useState<{ question: string, answer: string, type?: 'flag' | 'text', continent?: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedContinent, setSelectedContinent] = useState("All")
    const [gameKey, setGameKey] = useState(0)
    const [currentScore, setCurrentScore] = useState(0)
    const [lives, setLives] = useState(3)
    const [gameStats, setGameStats] = useState({ matches: 0, combo: 0, maxCombo: 0 })

    // Monetization State
    const [isPremium, setIsPremium] = useState(false)
    const [showPremiumModal, setShowPremiumModal] = useState(false)
    const [modalType, setModalType] = useState<'OUT_OF_HEARTS' | 'REGION_LOCKED'>('OUT_OF_HEARTS')
    const [timeRemaining, setTimeRemaining] = useState(0)
    const [lockedContinents, setLockedContinents] = useState<string[]>([])

    // Initial Load: Check Status & Locks
    useEffect(() => {
        const checkStatus = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            // 1. Check if can play (Hearts/Daily Limit)
            const playStatus = await canPlayGame(user?.id || null)

            if (!playStatus.canPlay && playStatus.reason === 'daily_limit_reached') {
                setModalType('OUT_OF_HEARTS')
                setTimeRemaining(playStatus.timeRemaining || 0)
                setShowPremiumModal(true)
            } else if (!playStatus.canPlay && playStatus.reason === 'out_of_hearts') {
                setModalType('OUT_OF_HEARTS')
                setShowPremiumModal(true)
            }

            // 2. Check Premium Status for Regions
            const heartStatus = await getHeartsForCurrentGame(user?.id || null)
            setIsPremium(heartStatus.isPremium)

            // 3. Randomly lock 2 continents if Free
            if (!heartStatus.isPremium) {
                const continents = CONTINENTS.filter(c => c !== 'All')
                const shuffled = [...continents].sort(() => Math.random() - 0.5)
                setLockedContinents(shuffled.slice(0, 2)) // Lock first 2
            }
        }
        checkStatus()
    }, [])

    useEffect(() => {
        // @ts-ignore - emoji property exists now
        const formattedPairs = TOP_CAPITALS.map(c => ({
            question: `${c.emoji || ''} ${c.country}`,
            answer: c.capital,
            type: 'text' as const,
            continent: c.continent
        }))
        setAllPairs(formattedPairs)
        setLoading(false)
    }, [])


    // Filter pairs when continent changes
    useEffect(() => {
        if (allPairs.length === 0) return

        let filtered = allPairs
        if (selectedContinent !== "All") {
            filtered = allPairs.filter(p => p.continent === selectedContinent)
        }

        const shuffled = [...filtered].sort(() => Math.random() - 0.5)
        setFilteredPairs(shuffled)

        setGameKey(prev => prev + 1)
        setCurrentScore(0)
        setLives(3)
    }, [selectedContinent, allPairs])


    const finishGame = async (score: number, reason: 'time' | 'mistakes' | 'manual') => {
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            const result = await submitGameScore(
                user?.id || null,
                score,
                undefined,
                { correct: score / 10, total: (score / 10) + (5 - lives), duration: 0 }
            )

            const params = new URLSearchParams()
            params.set("score", score.toString())
            params.set("correct", (score / 10).toString())
            if (reason === 'mistakes') params.set("out", "true")
            if (result?.sessionId) params.set("sessionId", result.sessionId)

            router.push(`/results?${params.toString()}`)
        } catch (error) {
            console.error("Error submitting score:", error)
            router.push('/')
        }
    }

    const handleWrongMatch = () => {
        setLives(prev => {
            const newLives = Math.max(0, prev - 1)
            if (newLives === 0) {
                finishGame(currentScore, 'mistakes')
            }
            return newLives
        })
    }

    const handleContinentClick = (continent: string) => {
        if (lockedContinents.includes(continent)) {
            setModalType('REGION_LOCKED')
            setShowPremiumModal(true)
            return
        }
        setSelectedContinent(continent)
    }

    const handleGameStart = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const result = await startGame(user?.id || null)

        if (result.success) {
            return true
        }

        // @ts-ignore - handling both error and reason for flexibility
        if (result.error === 'out_of_hearts' || result.reason === 'out_of_hearts') {
            setModalType('OUT_OF_HEARTS')
            setShowPremiumModal(true)
            return false
        }

        return false
    }

    return (
        <main className="min-h-screen p-4 bg-background flex flex-col">
            <PremiumModal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
                type={modalType}
                timeRemaining={timeRemaining}
            />

            <div className="flex justify-between items-center mb-4">
                <Button variant="ghost" size="sm" onClick={() => router.push('/')}>Quit</Button>

                <h1 className="font-black text-xl text-primary hidden md:block">Match Madness</h1>

                <div className="flex items-center gap-1 text-slate-700 font-black">
                    <span className="text-xl">❤️</span>
                    <span className="text-xl">{lives}</span>
                </div>
            </div>

            <div className="w-full overflow-x-auto no-scrollbar pb-2 mb-4 -mx-4 px-4 scroll-smooth">
                <div className="flex gap-2 w-max mx-auto md:mx-0">
                    {CONTINENTS.map((continent) => {
                        const isLocked = lockedContinents.includes(continent)
                        return (
                            <button
                                key={continent}
                                onClick={() => handleContinentClick(continent)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2 touch-manipulation flex items-center gap-2",
                                    selectedContinent === continent
                                        ? "bg-primary border-primary text-primary-foreground shadow-md"
                                        : "bg-background border-border hover:bg-accent/50 text-muted-foreground",
                                    isLocked && "opacity-75 bg-slate-100 border-slate-200 text-slate-400"
                                )}
                            >
                                {isLocked && <Lock className="w-3 h-3" />}
                                {continent}
                            </button>
                        )
                    })}
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary w-8 h-8" />
                </div>
            ) : (
                <MatchingGame
                    key={gameKey}
                    pairs={filteredPairs}
                    onWrongMatch={handleWrongMatch}
                    onStartGame={handleGameStart}
                    onComplete={(stats) => {
                        setCurrentScore(stats.score)
                        finishGame(stats.score, 'time')
                    }}
                />
            )}
        </main>
    )
}
