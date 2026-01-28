"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, Star, Zap, Clock, ShieldCheck, Gem } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
// We'll assume a checkout server action exists or use a direct fetch
import { loadStripe } from "@stripe/stripe-js"

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_SANDBOX_API

type ModalType = 'OUT_OF_HEARTS' | 'REGION_LOCKED' | 'GENERIC_UPGRADE'

interface PremiumModalProps {
    isOpen: boolean
    onClose: () => void
    type: ModalType
    timeRemaining?: number // in ms, for OUT_OF_HEARTS
}

export function PremiumModal({ isOpen, onClose, type, timeRemaining = 0 }: PremiumModalProps) {
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')
    const [timeLeft, setTimeLeft] = useState(timeRemaining > 0 ? timeRemaining : 10 * 60 * 1000) // Default 10 min for effect

    // Countdown Timer Effect
    useEffect(() => {
        if (!isOpen) return
        const timer = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1000))
        }, 1000)
        return () => clearInterval(timer)
    }, [isOpen])

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60
        return { hours, minutes, seconds }
    }

    const t = formatTime(timeLeft)

    const handleCheckout = async (priceKey: string) => {
        try {
            // Call API endpoint to create session
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceKey })
            })
            const { sessionId } = await response.json()
            if (sessionId) {
                const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY!)
                if (stripe) {
                    await (stripe as any).redirectToCheckout({ sessionId })
                }
            }
        } catch (error) {
            console.error("Checkout failed", error)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md bg-white sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl max-h-[95vh] overflow-y-auto"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 left-4 z-10 p-2 bg-white/50 hover:bg-white rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-800" />
                        </button>

                        {/* HERO SECTION */}
                        <div className="bg-slate-50 pt-12 pb-6 px-6 relative overflow-hidden">
                            {/* Confetti / Decoration */}
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Star className="w-32 h-32 fill-purple-500 text-purple-500 rotate-12" />
                            </div>

                            {type === 'OUT_OF_HEARTS' && (
                                <div className="text-center space-y-2">
                                    <div className="inline-flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold mb-2">
                                        <Clock className="w-3 h-3" />
                                        <span>Hearts Refill in {String(t.hours).padStart(2, '0')}:{String(t.minutes).padStart(2, '0')}:{String(t.seconds).padStart(2, '0')}</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-800 leading-tight">
                                        Out of Hearts?
                                    </h2>
                                    <p className="text-slate-500 font-medium">
                                        Don't wait! Get unlimited hearts and keep playing now.
                                    </p>
                                </div>
                            )}

                            {type === 'REGION_LOCKED' && (
                                <div className="text-center space-y-2">
                                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold mb-2">
                                        <Gem className="w-3 h-3" />
                                        <span>Unlock Global Content</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-800 leading-tight">
                                        Unlock This Region
                                    </h2>
                                    <p className="text-slate-500 font-medium">
                                        Get instant access to all continents and regions.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* PLANS SECTION */}
                        <div className="p-6 space-y-4">

                            {/* OFFER TIMER */}
                            <div className="flex items-center justify-between bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg shadow-red-500/20">
                                <span className="font-bold text-sm tracking-wide">SPECIAL OFFER ENDS IN</span>
                                <span className="font-mono font-black text-xl tabular-nums">
                                    {String(t.minutes).padStart(2, '0')} : {String(t.seconds).padStart(2, '0')}
                                </span>
                            </div>

                            <div className="space-y-3 pt-2">
                                {/* Yearly Plan */}
                                <div
                                    onClick={() => setSelectedPlan('yearly')}
                                    className={cn(
                                        "relative border-2 rounded-2xl p-4 cursor-pointer transition-all flex items-center gap-4",
                                        selectedPlan === 'yearly'
                                            ? "border-purple-600 bg-purple-50 ring-1 ring-purple-600 shadow-xl shadow-purple-100"
                                            : "border-slate-100 bg-white hover:border-slate-200"
                                    )}
                                >
                                    {/* Discount Badge */}
                                    <div className="absolute -top-3 right-4 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
                                        SAVE 75%
                                    </div>

                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                                        selectedPlan === 'yearly' ? "border-purple-600 bg-purple-600" : "border-slate-300"
                                    )}>
                                        {selectedPlan === 'yearly' && <Check className="w-3 h-3 text-white" />}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-800">12-Month Plan</span>
                                            <span className="font-bold text-xl text-purple-700">$49.99</span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium line-through">$199.99</p>
                                        <p className="text-xs text-purple-600 font-bold mt-1">Best Value • $4.16/mo</p>
                                    </div>
                                </div>

                                {/* Monthly Plan */}
                                <div
                                    onClick={() => setSelectedPlan('monthly')}
                                    className={cn(
                                        "relative border-2 rounded-2xl p-4 cursor-pointer transition-all flex items-center gap-4",
                                        selectedPlan === 'monthly'
                                            ? "border-purple-600 bg-purple-50 ring-1 ring-purple-600"
                                            : "border-slate-100 bg-white hover:border-slate-200"
                                    )}
                                >
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                                        selectedPlan === 'monthly' ? "border-purple-600 bg-purple-600" : "border-slate-300"
                                    )}>
                                        {selectedPlan === 'monthly' && <Check className="w-3 h-3 text-white" />}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-800">Monthly Plan</span>
                                            <span className="font-bold text-xl text-slate-700">$4.99</span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium">Standard access</p>
                                    </div>
                                </div>
                            </div>

                            {/* Features List */}
                            <div className="py-4 space-y-2">
                                {[
                                    "Unlimited Hearts & Plays",
                                    "Unlock All Regions (Europe, Asia, etc.)",
                                    "No Ads",
                                    "Premium Leaderboard Badge"
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                                            <Check className="w-3 h-3" />
                                        </div>
                                        {feature}
                                    </div>
                                ))}
                            </div>

                            {/* CTA Button */}
                            <Button
                                size="lg"
                                className="w-full h-14 text-lg font-black rounded-xl shadow-lg shadow-purple-500/20 bg-purple-600 hover:bg-purple-700 transition-all hover:scale-[1.02] active:scale-95"
                                onClick={() => handleCheckout(selectedPlan === 'monthly' ? 'PREMIUM_MONTHLY' : 'PREMIUM_YEARLY')}
                            >
                                CONTINUE
                            </Button>

                            {/* Heart Pack Alternative (Small purchase) */}
                            {type === 'OUT_OF_HEARTS' && (
                                <div className="text-center pt-2">
                                    <button
                                        className="text-xs font-bold text-slate-400 hover:text-purple-600 underline transition-colors"
                                        onClick={() => handleCheckout('HEART_PACK_5')}
                                    >
                                        Or just buy 5 hearts for $0.99
                                    </button>
                                </div>
                            )}

                            {/* Guarantee */}
                            <div className="flex items-center justify-center gap-2 pt-2 opacity-60">
                                <ShieldCheck className="w-4 h-4 text-slate-400" />
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Secure Payment via Stripe</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
