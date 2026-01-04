"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { fetchQuestions, fetchCategories } from "@/app/actions"
import { Question } from "@/types/game"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { Timer, ArrowRight, BookOpen } from "lucide-react"
import { FeedbackSheet } from "@/components/game/FeedbackSheet"

export default function PlayPage() {
    const router = useRouter()

    // States: 'selecting' | 'loading' | 'playing' | 'finished'
    const [gameState, setGameState] = useState<'selecting' | 'loading' | 'playing'>('selecting')
    const [categories, setCategories] = useState<string[]>([])

    const [questions, setQuestions] = useState<Question[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(12)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [isAnswered, setIsAnswered] = useState(false)
    const [streak, setStreak] = useState(0)

    // Feedback Sheet State
    const [showFeedback, setShowFeedback] = useState(false)

    // Load Categories on Mount
    useEffect(() => {
        fetchCategories().then(cats => setCategories(cats))
    }, [])

    // Timer Effect
    useEffect(() => {
        if (gameState !== 'playing' || isAnswered) return

        if (timeLeft <= 0) {
            handleTimeUp()
            return
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft, isAnswered, gameState])

    async function startGame(category: string) {
        setGameState('loading')
        const data = await fetchQuestions(category)
        setQuestions(data)
        setGameState('playing')
        setTimeLeft(12)
    }

    function handleTimeUp() {
        setIsAnswered(true)
        setShowFeedback(true)
        // Don't advance immediately, show feedback for "Time's Up" (simulated as wrong)
    }

    function handleAnswer(index: number) {
        if (isAnswered) return
        setSelectedAnswer(index)
        setIsAnswered(true)

        const isCorrect = index === questions[currentIndex].correct_index
        if (isCorrect) {
            setScore(s => s + 100 + (timeLeft * 10))
            setStreak(s => s + 1)
        } else {
            setStreak(0)
        }

        // Show Bottom Sheet instead of direct internal transition
        setShowFeedback(true)
    }

    function handleNextQuestion() {
        setShowFeedback(false)
        setIsAnswered(false)
        setSelectedAnswer(null)
        setTimeLeft(12)

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1)
        } else {
            router.push(`/results?score=${score}&total=${questions.length}`)
        }
    }

    // --- RENDER: LOADING ---
    if (gameState === 'loading' || (gameState === 'selecting' && categories.length === 0)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-slate-200 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                </div>
            </div>
        )
    }

    // --- RENDER: TOPIC SELECTION ---
    if (gameState === 'selecting') {
        return (
            <main className="min-h-screen p-4 bg-background max-w-md mx-auto flex flex-col">
                <div className="py-8 text-center space-y-2">
                    <h1 className="text-2xl font-black text-slate-700">Choose a Topic</h1>
                    <p className="text-slate-500 font-bold">What do you want to master?</p>
                </div>

                <div className="grid grid-cols-1 gap-3 overflow-y-auto pb-8">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => startGame(cat)}
                            className="btn-3d-outline h-16 text-lg flex items-center px-6 justify-between group hover:border-primary hover:text-primary transition-all"
                        >
                            <span className="font-bold">{cat}</span>
                            <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}
                </div>
            </main>
        )
    }

    // --- RENDER: GAMEPLAY ---
    const currentQuestion = questions[currentIndex]
    const progress = ((currentIndex) / questions.length) * 100

    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col max-w-md mx-auto relative overflow-hidden">

            {/* Top Bar */}
            <div className="p-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="text-slate-400">
                    <span className="text-2xl font-black">✕</span>
                </Button>
                <div className="flex-1">
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-primary rounded-full"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 text-rose-500 font-black">
                    <span>❤️ 5</span>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 flex flex-col justify-center gap-8 pb-32">

                {/* Question Bubble */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-slate-700 leading-tight">
                        {currentQuestion.question_text}
                    </h2>
                    {currentQuestion.category && (
                        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-400 text-xs font-bold rounded-lg uppercase tracking-wider">
                            {currentQuestion.category}
                        </span>
                    )}
                </div>

                {/* Answer Grid */}
                <div className="grid grid-cols-1 gap-3">
                    {currentQuestion.answers.map((answer, index) => {
                        const isSelected = selectedAnswer === index
                        const isRefCorrect = index === currentQuestion.correct_index

                        // Dynamic Style based on state
                        let btnClass = "btn-3d-outline h-16 text-left px-4 text-base normal-case"

                        if (isAnswered) {
                            if (isRefCorrect) btnClass = "btn-3d-primary h-16 px-4" // Show correct
                            else if (isSelected) btnClass = "btn-3d-danger h-16 px-4" // Show wrong
                            else btnClass += " opacity-50" // Dim others
                        } else if (isSelected) {
                            btnClass = "btn-3d-secondary h-16 px-4 border-b-0 translate-y-1" // Pressed state
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswer(index)}
                                disabled={isAnswered}
                                className={btnClass}
                            >
                                {answer}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Bottom Sheet Feedback */}
            <FeedbackSheet
                isOpen={showFeedback}
                isCorrect={selectedAnswer === currentQuestion.correct_index}
                correctAnswer={currentQuestion.answers[currentQuestion.correct_index]}
                explanation={currentQuestion.explanation}
                onContinue={handleNextQuestion}
            />

        </main>
    )
}
