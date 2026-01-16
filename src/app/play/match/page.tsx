"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TOP_CAPITALS } from "@/lib/data/capitals"
import { MatchingGame } from "@/components/game/MatchingGame"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MatchPage() {
    const router = useRouter()
    const [pairs, setPairs] = useState<{ question: string, answer: string }[]>([])
    const [loading, setLoading] = useState(true)

    const [selectedContinent, setSelectedContinent] = useState("All")
    const [gameKey, setGameKey] = useState(0)

    // Import CONTINENTS
    const { CONTINENTS } = require("@/lib/data/continent-mapping")

    useEffect(() => {
        setLoading(true)

        let filtered = [...TOP_CAPITALS]
        if (selectedContinent !== "All") {
            filtered = TOP_CAPITALS.filter(c => c.continent === selectedContinent)
        }

        // Randomly select 6 pairs
        const shuffled = filtered.sort(() => 0.5 - Math.random())
        const selected = shuffled.slice(0, 6)

        const newPairs = selected.map(item => ({
            question: item.country,
            answer: item.capital
        }))

        setPairs(newPairs)
        setLoading(false)
        setGameKey(prev => prev + 1)
    }, [selectedContinent]) // Re-run when continent changes

    const [hearts, setHearts] = useState(3) // Start with 3 hearts for Match

    useEffect(() => {
        // Reset hearts when game resets
        setHearts(3)
    }, [gameKey])

    return (
        <main className="min-h-screen p-4 bg-background flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <Button variant="ghost" onClick={() => router.push('/')}>Quit</Button>
                <div className="flex flex-col items-center">
                    <h1 className="font-bold text-xl text-primary">Match Madness</h1>
                    <div className="text-rose-500 font-black animate-pulse">
                        {"❤️".repeat(hearts)}
                    </div>
                </div>
                <div className="w-10" />
            </div>

            {/* Continent Selector */}
            <div className="w-full overflow-x-auto no-scrollbar pb-2 mb-2 -mx-4 px-4 scroll-smooth">
                <div className="flex gap-3 w-max mx-auto md:mx-0">
                    {CONTINENTS.map((continent: string) => (
                        <button
                            key={continent}
                            onClick={() => setSelectedContinent(continent)}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2 touch-manipulation
                                ${selectedContinent === continent
                                    ? "bg-primary border-primary text-primary-foreground shadow-md scale-105"
                                    : "bg-background border-border hover:bg-accent/50 text-muted-foreground hover:scale-105"
                                }`
                            }
                        >
                            {continent}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="h-[50vh] flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary w-8 h-8" />
                </div>
            ) : (
                <MatchingGame
                    key={gameKey}
                    pairs={pairs}
                    passports={hearts}
                    onWrongMatch={() => {
                        setHearts(prev => Math.max(0, prev - 1))
                    }}
                    onComplete={(stats) => {
                        if (hearts === 0) {
                            // If we completed due to time but hearts were 0, or just regular complete
                            // Actually, let's assume we want to push to results even if hearts > 0
                        }

                        // Submit Score (Guest Friendly)
                        import("@/app/actions-social").then(async ({ submitGameScore }) => {
                            // Try to get user, else null
                            import("@/lib/supabase/client").then(async ({ createClient }) => {
                                const supabase = createClient()
                                const { data: { user } } = await supabase.auth.getUser()

                                const result = await submitGameScore(
                                    user?.id || null,
                                    stats.score,
                                    undefined,
                                    { correct: stats.matches, total: stats.total, duration: stats.duration }
                                )

                                const params = new URLSearchParams()
                                params.set("score", stats.score.toString())
                                params.set("correct", stats.matches.toString())
                                params.set("total", stats.total.toString())
                                params.set("time", stats.duration.toString())
                                if (result.sessionId) params.set("sessionId", result.sessionId)
                                if (hearts <= 0) params.set("out", "true")

                                router.push(`/results?${params.toString()}`)
                            })
                        })
                    }}
                />
            )}


        </main>
    )
}
