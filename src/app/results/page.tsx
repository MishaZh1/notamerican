"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Home, RotateCcw, Share2 } from "lucide-react"
import { Suspense } from "react"

function ResultsContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const score = searchParams.get("score") || "0"
    const correct = searchParams.get("correct") || "0"
    const total = searchParams.get("total") || "0"

    const percentage = Math.round((parseInt(correct) / parseInt(total)) * 100) || 0

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 via-background to-background">
            <div className="w-full max-w-md space-y-8 animate-in zoom-in duration-500">

                <div className="text-center space-y-2">
                    <Trophy className="w-24 h-24 mx-auto text-yellow-500 animate-bounce" />
                    <h1 className="text-4xl font-black tracking-tighter uppercase">
                        Quiz Complete!
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        Review your performance
                    </p>
                </div>

                <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-8 space-y-6 text-center">
                        <div className="space-y-2">
                            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Total Score</span>
                            <div className="text-6xl font-black text-primary drop-shadow-lg">
                                {score}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-muted-foreground uppercase">Correct</span>
                                <div className="text-2xl font-bold text-green-500">{correct}/{total}</div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-muted-foreground uppercase">Time</span>
                                <div className="text-2xl font-bold">{searchParams.get("time") || "0"}s</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4">
                    <Button size="lg" className="w-full text-lg h-14" onClick={() => router.push('/play')}>
                        <RotateCcw className="mr-2 w-5 h-5" />
                        Play Again
                    </Button>

                    <div className="flex gap-4">
                        <Button variant="secondary" className="flex-1" onClick={() => router.push('/')}>
                            <Home className="mr-2 w-4 h-4" />
                            Home
                        </Button>
                        <Button variant="outline" className="flex-1">
                            <Share2 className="mr-2 w-4 h-4" />
                            Share
                        </Button>
                    </div>
                </div>

            </div>
        </main>
    )
}

export default function ResultsPage() {
    return (
        <Suspense fallback={<div>Loading result...</div>}>
            <ResultsContent />
        </Suspense>
    )
}
