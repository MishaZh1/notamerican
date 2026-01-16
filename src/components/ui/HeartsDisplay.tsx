"use client"

import { motion } from "framer-motion"

interface HeartsDisplayProps {
    hearts: number
    maxHearts: number
    isPremium?: boolean
    className?: string
}

/**
 * Displays hearts in game header
 * Shows ∞ for premium users
 */
export function HeartsDisplay({ hearts, maxHearts, isPremium = false, className = "" }: HeartsDisplayProps) {
    if (isPremium) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <span className="text-2xl">❤️</span>
                <span className="text-xl font-black text-rose-500">∞</span>
            </div>
        )
    }

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {Array.from({ length: maxHearts }).map((_, i) => (
                <motion.span
                    key={i}
                    initial={{ scale: 1 }}
                    animate={{
                        scale: i < hearts ? 1 : 0.7,
                        opacity: i < hearts ? 1 : 0.3
                    }}
                    transition={{ duration: 0.2 }}
                    className="text-xl"
                >
                    {i < hearts ? '❤️' : '🖤'}
                </motion.span>
            ))}
            <span className="ml-1 text-sm font-bold text-rose-500">
                {hearts}/{maxHearts}
            </span>
        </div>
    )
}
