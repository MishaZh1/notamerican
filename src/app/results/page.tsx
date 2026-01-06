"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Trophy, Home, RotateCcw, Save, TrendingUp } from "lucide-react"
import { Suspense, useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import { registerGuest } from "@/app/actions-social"

function ResultsContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { user } = useAuth()
    const supabase = createClient()

    const score = parseInt(searchParams.get("score") || "0")
    const correct = parseInt(searchParams.get("correct") || "0")
    const sessionId = searchParams.get("sessionId")

    // Guest Form State
    const [guestName, setGuestName] = useState("")
    const [guestEmail, setGuestEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSaved, setIsSaved] = useState(false)

    // User Profile State
    const [profile, setProfile] = useState<any>(null)

    useEffect(() => {
        if (user) {
            // Fetch User Profile Stats
            supabase.from("users").select("*").eq("id", user.id).single().then(({ data }) => {
                if (data) setProfile(data)
            })
        }
    }, [user, supabase])

    const handleGuestSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!sessionId || !guestName) return

        setIsSubmitting(true)
        await registerGuest(sessionId, guestName, guestEmail)
        setIsSubmitting(false)
        setIsSaved(true)
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 via-background to-background">
            <div className="w-full max-w-md space-y-6 animate-in zoom-in duration-500">

                {/* Header */}
                <div className="text-center space-y-2">
                    <Trophy className="w-20 h-20 mx-auto text-yellow-500 animate-bounce" />
                    <h1 className="text-5xl font-black tracking-tighter uppercase text-primary drop-shadow-lg">
                        {score} PTS
                    </h1>
                    <p className="text-muted-foreground font-bold uppercase tracking-widest">
                        {correct} Correct Matches
                    </p>
                </div>

                {/* LEAD GEN / GUEST SECTION */}
                {!user && sessionId && !isSaved && (
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
                {!user && isSaved && (
                    <Card className="bg-green-100 border-green-500 border-2">
                        <CardContent className="p-6 text-center space-y-2">
                            <Save className="w-12 h-12 mx-auto text-green-600" />
                            <h2 className="text-xl font-bold text-green-700">Score Saved!</h2>
                            <p className="text-green-600 text-sm">
                                Check the leaderboard to see how you rank.
                                <br />Want to track your stats properly? <span className="font-bold underline cursor-pointer" onClick={() => router.push('/login')}>Sign Up</span>
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* AUTH USER STATS */}
                {user && profile && (
                    <Card className="border-border bg-card/50">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-muted-foreground uppercase">Current Streak</div>
                                    <div className="text-2xl font-black flex items-center gap-1">
                                        🔥 {profile.streak_current}
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <div className="text-xs font-bold text-muted-foreground uppercase">Total XP</div>
                                    <div className="text-2xl font-black text-primary">
                                        ★ {profile.xp_total}
                                    </div>
                                </div>
                            </div>

                            {/* Fake Graph Visual */}
                            <div className="space-y-2 pt-2 border-t">
                                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                                    <TrendingUp className="w-4 h-4" /> Your Progress
                                </div>
                                <div className="flex items-end gap-1 h-24 pt-4 px-2">
                                    {/* Mock Bars to simulate "Graph with improvements" */}
                                    <div className="w-1/5 bg-primary/30 rounded-t h-[40%]" />
                                    <div className="w-1/5 bg-primary/40 rounded-t h-[30%]" />
                                    <div className="w-1/5 bg-primary/60 rounded-t h-[60%]" />
                                    <div className="w-1/5 bg-primary/80 rounded-t h-[50%]" />
                                    <div className="w-1/5 bg-primary rounded-t h-full relative group">
                                        {/* Tooltipish */}
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-primary">{score}</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ACTIONS */}
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
