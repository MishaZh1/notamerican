"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, ShieldCheck, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { StripePriceKey } from "@/lib/stripe/client"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export default function PricingPage() {
    const router = useRouter()
    const [selectedPlan, setSelectedPlan] = useState<'starter' | 'monthly' | 'yearly'>('monthly')
    const [timeLeft, setTimeLeft] = useState(9 * 60 * 1000 + 45000) // 9:45 default

    // Countdown Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1000))
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        return { minutes, seconds }
    }

    const t = formatTime(timeLeft)

    const handleCheckout = async () => {
        let priceKey: StripePriceKey = 'PREMIUM_MONTHLY'
        switch (selectedPlan) {
            case 'starter': priceKey = 'HEART_PACK_20'; break;
            case 'monthly': priceKey = 'PREMIUM_MONTHLY'; break;
            case 'yearly': priceKey = 'PREMIUM_YEARLY'; break;
        }

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                sessionStorage.setItem('pending_checkout', priceKey)
                router.push('/login?redirect=/pricing')
                return
            }

            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceKey }),
            })

            const data = await response.json()

            if (data.url) {
                window.location.href = data.url
            } else {
                console.error('Checkout error:', data.error)
                alert('Failed to start checkout. Please try again.')
            }
        } catch (error) {
            console.error('Checkout error:', error)
            alert('An unexpected error occurred.')
        }
    }

    return (
        <main className="min-h-screen bg-slate-50 relative overflow-x-hidden">
            {/* Navigation */}
            <div className="relative z-10 p-6 max-w-2xl mx-auto w-full">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>
            </div>

            <div className="relative z-10 container mx-auto px-4 pb-12 max-w-md">

                {/* Header Section */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight leading-tight">
                        Playing Is Better <span className="text-[#4e46e5]">Without Limits</span>
                    </h1>
                    <p className="text-slate-600 font-medium">
                        Never wait for hearts again. Unlock unlimited gameplay and master geography faster.
                    </p>
                </div>

                {/* URGENCY BAR */}
                <div className="bg-[#ef4444] text-white py-3 px-6 rounded-xl flex items-center justify-between shadow-lg shadow-red-500/20 mb-8 transform hover:scale-[1.02] transition-transform">
                    <span className="text-sm font-bold uppercase tracking-wider">OFFER ENDS IN</span>
                    <span className="font-mono font-black text-xl tabular-nums">
                        {String(t.minutes).padStart(2, '0')} : {String(t.seconds).padStart(2, '0')}
                    </span>
                </div>

                {/* PLAN SELECTION */}
                <div className="space-y-4 mb-8">
                    {/* Starter (Heart Pack) */}
                    <div
                        onClick={() => setSelectedPlan('starter')}
                        className={cn(
                            "relative border-2 rounded-2xl p-4 cursor-pointer transition-all flex items-center gap-4 bg-white shadow-sm",
                            selectedPlan === 'starter'
                                ? "border-[#4e46e5] ring-1 ring-[#4e46e5] shadow-[#4e46e5]/10 z-10"
                                : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                        )}
                    >
                        <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                            selectedPlan === 'starter' ? "border-[#4e46e5]" : "border-slate-300"
                        )}>
                            {selectedPlan === 'starter' && <div className="w-3 h-3 rounded-full bg-[#4e46e5]" />}
                        </div>

                        <div className="flex-1">
                            <div className="font-bold text-slate-800 text-sm uppercase tracking-wide">Starter Pack</div>
                            <div className="text-xs text-slate-400">20 Hearts • One-time purchase</div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="bg-slate-100 rounded-lg px-3 py-2 text-center min-w-[80px]">
                                <div className="text-xl font-black text-slate-700 leading-none">$2.99</div>
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
                                "relative border-2 rounded-2xl rounded-t-xl p-4 cursor-pointer transition-all flex items-center gap-4 bg-white shadow-sm z-10",
                                selectedPlan === 'monthly'
                                    ? "border-[#4e46e5] ring-1 ring-[#4e46e5] shadow-lg shadow-[#4e46e5]/10"
                                    : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                            )}
                        >
                            <div className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                                selectedPlan === 'monthly' ? "border-[#4e46e5]" : "border-slate-300"
                            )}>
                                {selectedPlan === 'monthly' && <div className="w-3 h-3 rounded-full bg-[#4e46e5]" />}
                            </div>

                            <div className="flex-1">
                                <div className="font-bold text-slate-800 text-sm uppercase tracking-wide">Monthly Plan</div>
                                <div className="text-xs text-slate-400">$4.99 billed monthly</div>
                            </div>

                            <div className="bg-slate-100 rounded-lg px-3 py-1 text-center min-w-[80px]">
                                <div className="text-xl font-black text-slate-700 leading-none flex items-start justify-center">
                                    <span className="text-xs mt-1">$</span>
                                    0<span className="text-sm mt-1">.16</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase">per day</div>
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
                                "relative border-2 rounded-2xl rounded-t-xl p-4 cursor-pointer transition-all flex items-center gap-4 bg-white shadow-sm z-10",
                                selectedPlan === 'yearly'
                                    ? "border-[#4e46e5] ring-1 ring-[#4e46e5] shadow-lg shadow-[#4e46e5]/10"
                                    : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                            )}
                        >
                            <div className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                                selectedPlan === 'yearly' ? "border-[#4e46e5]" : "border-slate-300"
                            )}>
                                {selectedPlan === 'yearly' && <div className="w-3 h-3 rounded-full bg-[#4e46e5]" />}
                            </div>

                            <div className="flex-1">
                                <div className="font-bold text-slate-800 text-sm uppercase tracking-wide">Yearly Plan</div>
                                <div className="text-xs text-slate-400">$49.99 billed yearly</div>
                            </div>

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

                {/* Features List */}
                <div className="grid grid-cols-2 gap-3 mb-8 px-2">
                    {[
                        "Unlimited Hearts",
                        "Unlock All Regions",
                        "No Ads",
                        "Golden Name",
                        "Support Development"
                    ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                                <Check className="w-3 h-3" strokeWidth={3} />
                            </div>
                            {feature}
                        </div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-[#059669]">
                        <div className="bg-[#d1fae5] p-1 rounded-full">
                            <ShieldCheck className="w-5 h-5 fill-[#059669] text-white" />
                        </div>
                        <span className="text-sm font-bold underline decoration-2 decoration-[#059669]/30">30-day money-back guarantee</span>
                    </div>

                    <Button
                        size="lg"
                        className="w-full h-14 text-xl font-black rounded-full shadow-xl shadow-[#4e46e5]/30 bg-[#4e46e5] hover:bg-[#4338ca] transition-all hover:scale-[1.02] active:scale-95"
                        onClick={handleCheckout}
                    >
                        CONTINUE
                    </Button>

                    <p className="text-xs text-center text-slate-400 leading-relaxed px-4">
                        By continuing, you agree to the Terms & Conditions. Subscription auto-renews. Cancel anytime.
                    </p>
                </div>

                {/* Trust Badges */}
                <div className="mt-12 flex items-center justify-center gap-8 opacity-40 grayscale pb-8">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                        <span className="text-xl">🔒</span> Secure Payment
                    </div>
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                        <span className="text-xl">⚡</span> Powered by Stripe
                    </div>
                </div>
            </div>
        </main>
    )
}
