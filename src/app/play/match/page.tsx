"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { MatchingGame } from "@/components/game/MatchingGame"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { CONTINENTS } from "@/lib/data/continent-mapping"
import { TOP_CAPITALS } from "@/lib/data/capitals"
import { cn } from "@/lib/utils"
// Import these for score submission
import { submitGameScore } from "@/app/actions-social"
import { createClient } from "@/lib/supabase/client"

export default function MatchPage() {
    const router = useRouter()
    const [allPairs, setAllPairs] = useState<{ question: string, answer: string, type?: 'flag' | 'text', continent?: string }[]>([])
    const [filteredPairs, setFilteredPairs] = useState<{ question: string, answer: string, type?: 'flag' | 'text', continent?: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedContinent, setSelectedContinent] = useState("All")
    const [gameKey, setGameKey] = useState(0)
    const [currentScore, setCurrentScore] = useState(0)
    const [lives, setLives] = useState(5)
    // Track stats for submission
    const [gameStats, setGameStats] = useState({ matches: 0, combo: 0, maxCombo: 0 })

    // Load and format data
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

        // Shuffle filtered pairs
        const shuffled = [...filtered].sort(() => Math.random() - 0.5)
        setFilteredPairs(shuffled)

        // Reset game
        setGameKey(prev => prev + 1)
        setCurrentScore(0)
        setLives(5)
    }, [selectedContinent, allPairs])

    // Unified Game Over / Finish Handler
    const finishGame = async (score: number, reason: 'time' | 'mistakes' | 'manual') => {
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            // Submit score
            const result = await submitGameScore(
                user?.id || null,
                score,
                undefined,
                { correct: score / 10, total: (score / 10) + (5 - lives), duration: 0 } // Approx stats
            )

            const params = new URLSearchParams()
            params.set("score", score.toString())
            params.set("correct", (score / 10).toString()) // Assuming 10pts per match
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
                // Game Over by Mistakes
                setTimeout(() => {
                    finishGame(currentScore, 'mistakes')
                }, 2000)
            }
            return newLives
        })
    }

    return (
        <main className="min-h-screen p-4 bg-background flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <Button variant="ghost" size="sm" onClick={() => router.push('/')}>Quit</Button>

                <h1 className="font-black text-xl text-primary hidden md:block">Match Madness</h1>

                {/* Lives/Mistakes Display */}
                <div className="flex items-center gap-1 text-slate-700 font-black">
                    <span className="text-xl">❤️</span>
                    <span className="text-xl">{lives}</span>
                </div>
            </div>

            {/* Continent Selector */}
            <div className="w-full overflow-x-auto no-scrollbar pb-2 mb-4 -mx-4 px-4 scroll-smooth">
                <div className="flex gap-2 w-max mx-auto md:mx-0">
                    {CONTINENTS.map((continent) => (
                        <button
                            key={continent}
                            onClick={() => setSelectedContinent(continent)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2 touch-manipulation",
                                selectedContinent === continent
                                    ? "bg-primary border-primary text-primary-foreground shadow-md"
                                    : "bg-background border-border hover:bg-accent/50 text-muted-foreground"
                            )}
                        >
                            {continent}
                        </button>
                    ))}
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
                    onComplete={(stats) => {
                        // Auto-finish on Time Up
                        setCurrentScore(stats.score)
                        finishGame(stats.score, 'time')
                    }}
                />
            )}
        </main>
    )
}
