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

    return (
        <main className="min-h-screen p-4 bg-background flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <Button variant="ghost" onClick={() => router.push('/')}>Quit</Button>
                <h1 className="font-bold text-xl text-primary">Match Madness</h1>
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
                    onComplete={(stats) => {
                        const params = new URLSearchParams()
                        params.set("score", stats.score.toString())
                        params.set("correct", stats.matches.toString())
                        params.set("total", stats.total.toString())
                        params.set("time", stats.duration.toString())

                        // Submit Score
                        import("@/lib/supabase/client").then(async ({ createClient }) => {
                            const supabase = createClient()
                            const { data: { user } } = await supabase.auth.getUser()
                            if (user) {
                                import("@/app/actions-social").then(({ submitGameScore }) => {
                                    submitGameScore(user.id, stats.score)
                                })
                            }
                        })

                        router.push(`/results?${params.toString()}`)
                    }}
                />
            )}
        </main>
    )
}
