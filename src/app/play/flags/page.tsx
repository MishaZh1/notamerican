"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { fetchFlagPairs } from "@/app/actions-flags"
import { MatchingGame } from "@/components/game/MatchingGame"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { CONTINENTS } from "@/lib/data/continent-mapping"
import { cn } from "@/lib/utils"

export default function FlagsPage() {
    const router = useRouter()
    const [pairs, setPairs] = useState<{ question: string, answer: string, type?: 'flag' | 'text' }[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedContinent, setSelectedContinent] = useState("All")
    const [gameKey, setGameKey] = useState(0) // Used to reset the game component
    const [passports, setPassports] = useState(5) // Passport system

    const load = useCallback(async (continent: string) => {
        setLoading(true)
        const data = await fetchFlagPairs(continent)
        setPairs(data)
        setLoading(false)
        setGameKey(prev => prev + 1)
        setPassports(5) // Reset passports on new game
    }, [])

    useEffect(() => {
        load(selectedContinent)
    }, [selectedContinent, load])

    const handleWrongMatch = () => {
        setPassports(prev => {
            const newPassports = Math.max(0, prev - 1)
            if (newPassports === 0) {
                import("@/lib/supabase/client").then(async ({ createClient }) => {
                    const supabase = createClient()
                    const { data: { user } } = await supabase.auth.getUser()

                    import("@/app/actions-social").then(async ({ submitGameScore }) => {
                        // Submit with 0 score but valid session
                        const result = await submitGameScore(
                            user?.id || null,
                            0,
                            undefined,
                            { correct: 0, total: 5, duration: 0 }
                        )

                        const params = new URLSearchParams()
                        params.set("score", "0")
                        params.set("correct", "0")
                        params.set("out", "true")
                        if (result?.sessionId) params.set("sessionId", result.sessionId)

                        router.push(`/results?${params.toString()}`)
                    })
                })
            }
            return newPassports
        })
    }

    return (
        <main className="min-h-screen p-4 bg-background flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <Button variant="ghost" size="sm" onClick={() => router.push('/')}>Quit</Button>
                <h1 className="font-black text-xl text-primary">Flags</h1>
                {/* Passports Display */}
                <div className="flex items-center gap-1 text-slate-700 font-black">
                    <span className="text-lg">🛂</span>
                    <span className="text-lg">{passports}</span>
                </div>
            </div>

            {/* Continent Selector - Mobile Optimized */}
            <div className="w-full overflow-x-auto no-scrollbar pb-2 mb-2 -mx-4 px-4 scroll-smooth">
                <div className="flex gap-3 w-max mx-auto md:mx-0">
                    {CONTINENTS.map((continent) => (
                        <button
                            key={continent}
                            onClick={() => setSelectedContinent(continent)}
                            className={cn(
                                "px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2 touch-manipulation",
                                selectedContinent === continent
                                    ? "bg-primary border-primary text-primary-foreground shadow-md scale-105"
                                    : "bg-background border-border hover:bg-accent/50 text-muted-foreground hover:scale-105"
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
                    pairs={pairs}
                    passports={passports}
                    onWrongMatch={handleWrongMatch}
                    onComplete={(stats) => {
                        // Submit Score
                        import("@/lib/supabase/client").then(async ({ createClient }) => {
                            const supabase = createClient()
                            const { data: { user } } = await supabase.auth.getUser()

                            // Dynamically import action to use server action from client
                            import("@/app/actions-social").then(async ({ submitGameScore }) => {
                                const result = await submitGameScore(
                                    user?.id || null,
                                    stats.score,
                                    undefined, // No guest info yet
                                    { correct: stats.matches, total: stats.total, duration: stats.duration }
                                )

                                const params = new URLSearchParams()
                                params.set("score", stats.score.toString())
                                params.set("correct", stats.matches.toString())
                                if (result?.sessionId) params.set("sessionId", result.sessionId)

                                router.push(`/results?${params.toString()}`)
                            })
                        })
                    }}
                />
            )}
        </main>
    )
}
