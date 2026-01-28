"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Trophy, Home, RotateCcw, Save, TrendingUp, Crown } from "lucide-react"
import { Suspense, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { registerGuest } from "@/app/actions-social"

function ResultsContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const score = parseInt(searchParams.get("score") || "0")
    const correct = parseInt(searchParams.get("correct") || "0")
    const sessionId = searchParams.get("sessionId")
    const isOutOfHearts = searchParams.get("out") === "true"


    // Guest Form State
    const [guestName, setGuestName] = useState("")
    const [guestEmail, setGuestEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSaved, setIsSaved] = useState(false)

    // Subscription Modal
    const [showSubscription, setShowSubscription] = useState(false)

    // Load persisted name / Track Games
    useEffect(() => {
        // Load name
        const storedName = localStorage.getItem("nota_user_name")
        const storedEmail = localStorage.getItem("nota_user_email")
        if (storedName) setGuestName(storedName)
        if (storedEmail) setGuestEmail(storedEmail)

        // Track Games
        const gamesPlayed = parseInt(localStorage.getItem("nota_games_played") || "0") + 1
        localStorage.setItem("nota_games_played", gamesPlayed.toString())

        if (gamesPlayed >= 3) {
            setShowSubscription(true)
        }
    }, [])


    const handleGuestSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!sessionId || !guestName) return

        setIsSubmitting(true)
        try {
            await registerGuest(sessionId, guestName, guestEmail)
            setIsSaved(true)

            // Persist
            localStorage.setItem("nota_user_name", guestName)
            if (guestEmail) localStorage.setItem("nota_user_email", guestEmail)

        } catch (error) {
            console.error(error)
            alert("Failed to save score. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 via-background to-background relative">
            <div className="w-full max-w-md space-y-6 animate-in zoom-in duration-500">

                {/* Header */}
                <div className="text-center space-y-2">
                    {isOutOfHearts ? (
                        <div className="space-y-2">
                            <div className="text-6xl mb-2">💔</div>
                            <h2 className="text-2xl font-black text-rose-500 uppercase tracking-tighter">Out of Hearts!</h2>
                        </div>
                    ) : (
                        <Trophy className="w-20 h-20 mx-auto text-yellow-500 animate-bounce" />
                    )}
                    <h1 className="text-5xl font-black tracking-tighter uppercase text-primary drop-shadow-lg">
                        {score} PTS
                    </h1>
                    <p className="text-muted-foreground font-bold uppercase tracking-widest">
                        {correct} Correct Answers
                    </p>

                </div>

                {/* LEAD GEN / GUEST SECTION */}
                {sessionId && !isSaved && (
                    <Card className="border-2 border-primary shadow-lg bg-card/80 backdrop-blur">
                        <CardHeader>
                            <CardTitle>Save your Score!</CardTitle>
                            <CardDescription>
                                Add your name to the leaderboard history. <br />
                                <span className="text-xs opacity-75">(Email optional - get deals & track progress)</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleGuestSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                                    <Input
                                        placeholder="Your Name (e.g. Captain America)"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email <span className="text-muted-foreground text-xs">(Optional)</span></label>
                                    <Input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={guestEmail}
                                        onChange={(e) => setGuestEmail(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? "Saving..." : "Save to Leaderboard"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* SAVED SUCCESS STATE */}
                {isSaved && (
                    <Card className="bg-green-100 border-green-500 border-2">
                        <CardContent className="p-6 text-center space-y-2">
                            <Save className="w-12 h-12 mx-auto text-green-600" />
                            <h2 className="text-xl font-bold text-green-700">Score Saved!</h2>
                            <p className="text-green-600 text-sm">
                                Check the leaderboard to see how you rank.
                            </p>
                        </CardContent>
                    </Card>
                )}



                {/* ACTIONS */}
                <div className="w-full">
                    {/* Upgrade Banner */}
                    <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg cursor-pointer transition-transform hover:scale-105 mb-6"
                        onClick={() => setShowSubscription(true)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg"><Crown className="w-6 h-6" /></div>
                                <div>
                                    <h3 className="font-bold text-lg">Go Premium</h3>
                                    <p className="text-xs opacity-90">Unlimited hearts & no ads</p>
                                </div>
                            </div>
                            <Button size="sm" variant="secondary" className="font-bold text-indigo-600 h-8">
                                Upgrade
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        <Button size="lg" className="w-full text-lg h-14 shadow-xl" onClick={() => router.push('/play/flags')}>
                            <RotateCcw className="mr-2 w-5 h-5" />
                            Play Again (Blitz)
                        </Button>

                        <div className="flex gap-3">
                            <Button variant="secondary" className="flex-1" onClick={() => router.push('/')}>
                                <Home className="mr-2 w-4 h-4" />
                                Home
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => router.push('/leaderboard')}>
                                <Trophy className="mr-2 w-4 h-4" />
                                Leaderboard
                            </Button>
                        </div>
                    </div>

                </div>

                {/* SUBSCRIPTION MODAL */}
                {showSubscription && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                        <Card className="w-full max-w-sm border-4 border-indigo-500 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-indigo-500 to-purple-600" />
                            <CardContent className="pt-20 px-6 pb-6 text-center relative pointer-events-auto">
                                <div className="w-20 h-20 bg-white rounded-full mx-auto shadow-lg flex items-center justify-center mb-4 border-4 border-indigo-100">
                                    <span className="text-4xl">👑</span>
                                </div>
                                <h2 className="text-2xl font-black text-indigo-900 mb-2">Become a Pro Explorer!</h2>
                                <p className="text-slate-600 mb-6 text-sm">
                                    You've played 3 games! Unlock unlimited hearts, ad-free experience, and exclusive avatars.
                                </p>

                                <div className="space-y-3">
                                    <Button
                                        onClick={() => router.push('/pricing')}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 text-lg"
                                    >
                                        View Plans & Pricing
                                    </Button>
                                    <Button variant="ghost" className="text-slate-400 btn-sm" onClick={() => setShowSubscription(false)}>
                                        Maybe later
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </main>
    )
}

export default function ResultsPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading result...</div>}>
            <ResultsContent />
        </Suspense>
    )
}
