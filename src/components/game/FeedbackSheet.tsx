"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FeedbackSheetProps {
    isOpen: boolean
    isCorrect: boolean
    correctAnswer?: string
    explanation?: string
    onContinue: () => void
}

export function FeedbackSheet({
    isOpen,
    isCorrect,
    correctAnswer,
    explanation,
    onContinue,
}: FeedbackSheetProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className={cn(
                        "fixed bottom-0 left-0 right-0 z-50 p-6 pt-8 rounded-t-3xl shadow-2xl border-t-2",
                        isCorrect
                            ? "bg-green-100 border-green-500 text-green-900"
                            : "bg-red-100 border-red-500 text-red-900"
                    )}
                >
                    <div className="max-w-md mx-auto flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            {isCorrect ? (
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            ) : (
                                <XCircle className="w-8 h-8 text-red-600" />
                            )}
                            <div>
                                <h3 className="text-xl font-black">
                                    {isCorrect ? "Excellent!" : "Not quite..."}
                                </h3>
                                {!isCorrect && correctAnswer && (
                                    <p className="text-sm font-medium opacity-90 mt-1">
                                        Correct answer: <span className="font-bold">{correctAnswer}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {(isCorrect || explanation) && explanation && (
                            <div className="text-sm opacity-80 pl-11">
                                {explanation}
                            </div>
                        )}

                        <Button
                            onClick={onContinue}
                            className={cn(
                                "w-full py-6 text-lg font-bold border-b-4 active:border-b-0 active:translate-y-1 transition-all",
                                isCorrect
                                    ? "bg-green-500 hover:bg-green-600 border-green-700 text-white"
                                    : "bg-red-500 hover:bg-red-600 border-red-700 text-white"
                            )}
                        >
                            CONTINUE
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
