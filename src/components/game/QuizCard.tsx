"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Question } from "@/types/game"
import { CheckCircle2, XCircle, Timer } from "lucide-react"

interface QuizCardProps {
    question: Question
    onAnswer: (index: number) => void
    timeLeft: number
    totalTime: number
}

export function QuizCard({ question, onAnswer, timeLeft, totalTime }: QuizCardProps) {
    const [selected, setSelected] = useState<number | null>(null)

    const handleSelect = (idx: number) => {
        if (selected !== null) return // Prevent multiple clicks
        setSelected(idx)
        onAnswer(idx)
    }

    // Reset state when question changes
    useEffect(() => {
        setSelected(null)
    }, [question.id])

    const progress = (timeLeft / totalTime) * 100
    const isCritical = progress < 30

    return (
        <div className="w-full max-w-md space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Timer Bar */}
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                    className={cn(
                        "h-full transition-all duration-100 ease-linear rounded-full",
                        isCritical ? "bg-destructive" : "bg-primary"
                    )}
                    style={{ width: `${progress}%` }}
                />
            </div>

            <Card className="border-2 border-border/50 shadow-xl backdrop-blur-md bg-card/90">
                <CardContent className="p-6 space-y-6">

                    <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        <span>{question.category}</span>
                        <span className="flex items-center gap-1">
                            <Timer className="w-3 h-3" /> {Math.ceil(timeLeft)}s
                        </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-center leading-tight">
                        {question.question_text}
                    </h2>

                    <div className="grid gap-3">
                        {question.answers.map((answer, idx) => (
                            <Button
                                key={idx}
                                variant={selected === idx ? "default" : "secondary"}
                                className={cn(
                                    "w-full justify-start text-left h-auto py-4 px-5 text-base font-semibold transition-all transform active:scale-[0.98]",
                                    selected === idx && "ring-2 ring-primary ring-offset-2"
                                )}
                                onClick={() => handleSelect(idx)}
                                disabled={selected !== null}
                            >
                                <div className="flex items-center w-full">
                                    <span className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center mr-3 text-sm font-bold opacity-70">
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    {answer}
                                </div>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
