"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { fetchFlagPairs } from "@/app/actions-flags"
import { MatchingGame } from "@/components/game/MatchingGame"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function FlagsPage() {
    const router = useRouter()
    const [pairs, setPairs] = useState<{ question: string, answer: string, type?: 'flag' | 'text' }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const data = await fetchFlagPairs()
            setPairs(data)
            setLoading(false)
        }
        load()
    }, [])

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <main className="min-h-screen p-4 bg-background flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" onClick={() => router.push('/')}>Quit</Button>
                <h1 className="font-black text-xl text-primary">Flags</h1>
                <div className="w-10" />
            </div>

            <MatchingGame
                pairs={pairs}
                onComplete={(stats) => {
                    const params = new URLSearchParams()
                    params.set("score", stats.score.toString())
                    params.set("correct", stats.matches.toString())
                    params.set("total", stats.total.toString())
                    params.set("time", stats.duration.toString())
                    router.push(`/results?${params.toString()}`)
                }}
            />
        </main>
    )
}
