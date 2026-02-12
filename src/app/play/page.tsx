"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { fetchQuestions } from "@/app/actions"
import { submitGameScore, unlockStamp } from "@/app/actions-social"
import { Question } from "@/types/game"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

import { motion, AnimatePresence } from "framer-motion"
import { Timer, ArrowRight } from "lucide-react"
import { FeedbackSheet } from "@/components/game/FeedbackSheet"
import { useSound } from "@/lib/hooks/use-sound"

export default function PlayPage() {
    const router = useRouter()

    // States: 'selecting' | 'loading' | 'playing' | 'finished'
    const [gameState, setGameState] = useState<'selecting' | 'loading' | 'playing'>('selecting')

    const [questions, setQuestions] = useState<Question[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(12)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [isAnswered, setIsAnswered] = useState(false)
    const [streak, setStreak] = useState(0)

    // State for Hearts
    const [hearts, setHearts] = useState(5)
    const { playSound } = useSound()
    const [showFeedback, setShowFeedback] = useState(false)



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
    }, [timeLeft, isAnswered, gameState, playSound])

    async function startGame(category: string) {
        setGameState('loading')
        const data = await fetchQuestions(category)
        setQuestions(data)
        setGameState('playing')
        setTimeLeft(12)
        setHearts(5) // Reset hearts
    }



    function handleTimeUp() {
        setIsAnswered(true)
        setHearts(prev => {
            const newHearts = Math.max(0, prev - 1)
            if (newHearts === 0) {
                // Trigger score submission immediately or wait for continue?
                // Let's do it in handleNextQuestion.
            }
            return newHearts
        })
        playSound('wrong')
        setShowFeedback(true)
    }

    function handleAnswer(index: number) {
        if (isAnswered) return
        setSelectedAnswer(index)
        setIsAnswered(true)

        const isCorrect = index === questions[currentIndex].correct_index
        if (isCorrect) {
            setScore(s => s + 100 + (timeLeft * 10))
            setStreak(s => s + 1)
            playSound('correct')
        } else {
            const isGameOver = hearts <= 1
            setStreak(0)
            setHearts(prev => Math.max(0, prev - 1))
            playSound('wrong')
        }

        setShowFeedback(true)
    }

    async function handleNextQuestion() {
        setShowFeedback(false)
        setIsAnswered(false)
        setSelectedAnswer(null)
        setTimeLeft(12)

        const isGameOver = hearts <= 0
        const isFinished = currentIndex >= questions.length - 1

        if (isGameOver || isFinished) {
            setGameState('loading')

            const stats = {
                correct: score / 100, // rough estimate for now or track properly
                total: questions.length,
                duration: 60 // placeholder
            }

            try {
                const result = await submitGameScore(
                    null, // No user
                    score,
                    undefined,
                    stats
                )

                router.push(`/results?score=${score}&correct=${stats.correct}&sessionId=${result.sessionId}${isGameOver ? '&out=true' : ''}`)
            } catch (err) {
                console.error("Failed to submit score", err)
                router.push(`/results?score=${score}&correct=${stats.correct}${isGameOver ? '&out=true' : ''}`)
            }
            return
        }

        setCurrentIndex(prev => prev + 1)
    }




    // --- RENDER: LOADING ---
    if (gameState === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-slate-200 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase mt-4">Consulting Agent Marco...</p>
                </div>
            </div>
        )
    }


    // --- RENDER: GAME MODE SELECTION ---
    if (gameState === 'selecting') {
        return (
            <main className="min-h-screen p-4 bg-background max-w-md mx-auto flex flex-col">
                {/* Header */}
                <div className="py-8 text-center space-y-2">
                    <h1 className="text-2xl font-black text-slate-700">Choose Your Challenge</h1>
                    <p className="text-slate-500 font-bold text-sm">Pick a game mode to test your geography skills!</p>
                </div>

                {/* Game Mode Cards */}
                <div className="flex-1 flex flex-col gap-4 pb-8">
                    {/* Flags Match */}
                    <button
                        onClick={() => router.push('/play/flags')}
                        className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-primary transition-all shadow-sm hover:shadow-md group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                🏳️
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="text-lg font-black text-slate-700 group-hover:text-primary transition-colors">
                                    FLAGS MATCH
                                </h3>
                                <p className="text-sm font-bold text-slate-400">Match flags to countries</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-yellow-500">⭐</span>
                                    <span className="text-yellow-500">⭐</span>
                                    <span className="text-slate-300">⭐</span>
                                </div>
                            </div>
                            <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                    </button>

                    {/* Capitals Match */}
                    <button
                        onClick={() => router.push('/play/match')}
                        className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-primary transition-all shadow-sm hover:shadow-md group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                🏛️
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="text-lg font-black text-slate-700 group-hover:text-primary transition-colors">
                                    CAPITALS MATCH
                                </h3>
                                <p className="text-sm font-bold text-slate-400">Match capitals to countries</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-yellow-500">⭐</span>
                                    <span className="text-yellow-500">⭐</span>
                                    <span className="text-yellow-500">⭐</span>
                                </div>
                            </div>
                            <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                    </button>

                    {/* Map Quiz - Coming Soon */}
                    <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 opacity-60 relative">
                        <div className="absolute top-3 right-3 bg-yellow-100 text-yellow-700 text-xs font-black px-3 py-1 rounded-full uppercase">
                            Coming Soon
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-3xl">
                                🗺️
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="text-lg font-black text-slate-700">MAP QUIZ</h3>
                                <p className="text-sm font-bold text-slate-400">Find countries on the map</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-yellow-500">⭐</span>
                                    <span className="text-yellow-500">⭐</span>
                                    <span className="text-yellow-500">⭐</span>
                                    <span className="text-yellow-500">⭐</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Guess the Country - Coming Soon */}
                    <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 opacity-60 relative">
                        <div className="absolute top-3 right-3 bg-yellow-100 text-yellow-700 text-xs font-black px-3 py-1 rounded-full uppercase">
                            Coming Soon
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-3xl">
                                🌍
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="text-lg font-black text-slate-700">GUESS THE COUNTRY</h3>
                                <p className="text-sm font-bold text-slate-400">Identify country from clues</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-yellow-500">⭐</span>
                                    <span className="text-yellow-500">⭐</span>
                                    <span className="text-yellow-500">⭐</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.push('/')}
                    className="w-full h-12 font-bold"
                >
                    ← BACK TO HOME
                </Button>
            </main>
        )
    }


    // --- RENDER: GAMEPLAY ---
    const currentQuestion = questions[currentIndex]
    const progress = ((currentIndex) / questions.length) * 100

    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col max-w-md mx-auto relative">

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
                    <motion.span
                        key={hearts}
                        initial={{ scale: 1.5 }}
                        animate={{ scale: 1 }}
                        className="text-xl"
                    >
                        ❤️ {hearts}
                    </motion.span>
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
                        let btnClass = "btn-3d-outline h-16 text-left px-4 text-base normal-case w-full"

                        if (isAnswered) {
                            if (isRefCorrect) btnClass = "btn-3d-primary h-16 px-4 w-full" // Show correct
                            else if (isSelected) btnClass = "btn-3d-danger h-16 px-4 w-full" // Show wrong
                            else btnClass += " opacity-50" // Dim others
                        } else if (isSelected) {
                            btnClass = "btn-3d-secondary h-16 px-4 border-b-0 translate-y-1 w-full" // Pressed state
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

