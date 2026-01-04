"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { fetchQuestions } from "@/app/actions"
import { MatchingGame } from "@/components/game/MatchingGame"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MatchPage() {
    const router = useRouter()
    const [pairs, setPairs] = useState<{ question: string, answer: string }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const data = await fetchQuestions()
            if (data) {
                // Convert Questions to Pairs
                const newPairs = data.map(q => ({
                    question: q.question_text.length > 50 ? q.question_text.substring(0, 47) + "..." : q.question_text, // Truncate long
                    answer: q.answers[q.correct_index]
                }))
                setPairs(newPairs)
            }
            setLoading(false)
        }
        load()
    }, [])

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <main className="min-h-screen p-4 bg-background flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" onClick={() => router.push('/')}>Quit</Button>
                <h1 className="font-bold text-xl text-primary">Match Madness</h1>
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
