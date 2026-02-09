"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, Clock, ShieldCheck, Star } from "lucide-react"
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
    const [selectedPlan, setSelectedPlan] = useState<'starter' | 'monthly' | 'yearly'>('monthly')
    const [timeLeft, setTimeLeft] = useState(timeRemaining > 0 ? timeRemaining : 9 * 60 * 1000 + 45000) // 9:45 default

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
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        return { minutes, seconds }
    }

    const t = formatTime(timeLeft)

    const handleCheckout = async () => {
        let priceKey = ''
        switch (selectedPlan) {
            case 'starter': priceKey = 'HEART_PACK_20'; break;
            case 'monthly': priceKey = 'PREMIUM_MONTHLY'; break;
            case 'yearly': priceKey = 'PREMIUM_YEARLY'; break;
        }

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
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
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
                        className="relative w-full max-w-sm sm:max-w-md bg-white sm:rounded-3xl rounded-t-[32px] overflow-hidden shadow-2xl max-h-[95vh] flex flex-col"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 left-4 z-20 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="overflow-y-auto scrollbar-hide pb-6">
                            {/* HEADER SECTION */}
                            <div className="pt-12 px-6 pb-2 text-center">
                                {/* Timer (Top styled like screenshot 1/2 header) */}
                                <div className="flex justify-center items-end gap-1 mb-4 font-variant-numeric">
                                    <span className="text-4xl font-black text-slate-900 tracking-tighter">
                                        {String(t.minutes).padStart(2, '0')} : {String(t.seconds).padStart(2, '0')}
                                    </span>
                                    <div className="text-[10px] font-bold text-slate-400 pb-1.5 flex gap-4">
                                        <span>minutes</span>
                                        <span>seconds</span>
                                    </div>
                                </div>

                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-2">
                                    Get your Personal Geography Plan for <span className="text-[#4e46e5]">less than a cup of coffee</span> ☕
                                </h2>
                            </div>

                            {/* URGENCY BAR */}
                            <div className="bg-[#ef4444] text-white py-3 px-6 mx-6 rounded-xl flex items-center justify-between shadow-lg shadow-red-500/20 mb-6">
                                <span className="text-sm font-bold uppercase tracking-wider">THIS OFFER ENDS IN</span>
                                <span className="font-mono font-black text-xl tabular-nums">
                                    {String(t.minutes).padStart(2, '0')} : {String(t.seconds).padStart(2, '0')}
                                </span>
                            </div>

                            {/* PLAN SELECTION */}
                            <div className="px-5 space-y-2 mb-6">
                                {/* Starter (Heart Pack) */}
                                <div className="relative group pt-4">
                                    <div
                                        onClick={() => setSelectedPlan('starter')}
                                        className={cn(
                                            "relative border-2 rounded-2xl p-4 cursor-pointer transition-all flex items-center gap-4 bg-white z-10",
                                            selectedPlan === 'starter'
                                                ? "border-[#4e46e5] ring-1 ring-[#4e46e5]"
                                                : "border-slate-200 hover:border-slate-300"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                                            selectedPlan === 'starter' ? "border-[#4e46e5]" : "border-slate-300"
                                        )}>
                                            {selectedPlan === 'starter' && <div className="w-3 h-3 rounded-full bg-[#4e46e5]" />}
                                        </div>

                                        <div className="flex-1">
                                            <div className="font-bold text-slate-800 text-sm uppercase tracking-wide">Starter Pack</div>
                                            <div className="text-xs text-slate-400">20 Hearts • One-time</div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* <div className="text-slate-400 line-through text-xs font-bold">$5.99</div> */}
                                            <div className="bg-slate-100 rounded-lg px-3 py-2 text-center min-w-[80px]">
                                                <div className="text-xl font-black text-slate-700 leading-none">$2.99</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Monthly (Most Popular) */}
                                <div className="relative group pt-4">
                                    <div className="absolute top-0 left-0 right-0 h-6 bg-[#4e46e5] rounded-t-xl z-0 flex items-center justify-center -mt-0.5">
                                        <div className="flex items-center gap-1 text-[10px] font-black text-white uppercase tracking-widest pt-0.5">
                                            <Star className="w-3 h-3 fill-white" />
                                            Most Popular
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => setSelectedPlan('monthly')}
                                        className={cn(
                                            "relative border-2 rounded-2xl rounded-t-xl p-4 cursor-pointer transition-all flex items-center gap-4 bg-white z-10",
                                            selectedPlan === 'monthly'
                                                ? "border-[#4e46e5] ring-1 ring-[#4e46e5]"
                                                : "border-slate-200 hover:border-slate-300"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                                            selectedPlan === 'monthly' ? "border-[#4e46e5]" : "border-slate-300"
                                        )}>
                                            {selectedPlan === 'monthly' && <div className="w-3 h-3 rounded-full bg-[#4e46e5]" />}
                                        </div>

                                        <div className="flex-1">
                                            <div className="font-bold text-slate-800 text-sm uppercase tracking-wide">Monthly Plan</div>
                                            <div className="text-xs text-slate-400">$4.99 billed monthly</div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="bg-slate-100 rounded-lg px-3 py-1 text-center min-w-[80px]">
                                                <div className="text-xl font-black text-slate-700 leading-none flex items-start justify-center">
                                                    <span className="text-xs mt-1">$</span>
                                                    0<span className="text-sm mt-1">.16</span>
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase">per day</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Yearly (Best Offer) */}
                                <div className="relative group pt-4">
                                    <div className="absolute top-0 left-0 right-0 h-6 bg-slate-200 rounded-t-xl z-0 flex items-center justify-center -mt-0.5">
                                        <div className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-widest pt-0.5">
                                            Best Offer
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => setSelectedPlan('yearly')}
                                        className={cn(
                                            "relative border-2 rounded-2xl rounded-t-xl p-4 cursor-pointer transition-all flex items-center gap-4 bg-white z-10",
                                            selectedPlan === 'yearly'
                                                ? "border-[#4e46e5] ring-1 ring-[#4e46e5]"
                                                : "border-slate-200 hover:border-slate-300"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                                            selectedPlan === 'yearly' ? "border-[#4e46e5]" : "border-slate-300"
                                        )}>
                                            {selectedPlan === 'yearly' && <div className="w-3 h-3 rounded-full bg-[#4e46e5]" />}
                                        </div>

                                        <div className="flex-1">
                                            <div className="font-bold text-slate-800 text-sm uppercase tracking-wide">Yearly Plan</div>
                                            <div className="text-xs text-slate-400">$49.99 billed yearly</div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="bg-slate-100 rounded-lg px-3 py-1 text-center min-w-[80px]">
                                                <div className="text-xl font-black text-slate-700 leading-none flex items-start justify-center">
                                                    <span className="text-xs mt-1">$</span>
                                                    0<span className="text-sm mt-1">.13</span>
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase">per day</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* GUARANTEE & FOOTER */}
                            <div className="px-6 space-y-4">
                                <div className="flex items-center justify-center gap-2 text-[#059669]">
                                    <div className="bg-[#d1fae5] p-1 rounded-full">
                                        <ShieldCheck className="w-5 h-5 fill-[#059669] text-white" />
                                    </div>
                                    <span className="text-sm font-bold underline decoration-2 decoration-[#059669]/30">30-day money-back guarantee</span>
                                </div>

                                <Button
                                    size="lg"
                                    className="w-full h-14 text-lg font-black rounded-full shadow-xl shadow-[#4e46e5]/30 bg-[#4e46e5] hover:bg-[#4338ca] transition-all hover:scale-[1.02] active:scale-95"
                                    onClick={handleCheckout}
                                >
                                    CONTINUE
                                </Button>

                                <div className="text-[10px] text-center text-slate-400 leading-relaxed px-4">
                                    By choosing a payment method, you agree to the <span className="font-bold text-slate-500">Terms & Conditions</span>. Subscription auto-renews. Cancel anytime.
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
