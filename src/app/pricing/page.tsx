"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Check, Heart, Loader2, Star, Zap, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { StripePriceKey } from "@/lib/stripe/client"
import { createClient } from "@/lib/supabase/client"

interface PricingCardProps {
    title: string
    price: string
    interval?: string
    description: string
    features: string[]
    priceKey: StripePriceKey
    popular?: boolean
    gradient?: string
}

export default function PricingPage() {
    const router = useRouter()
    const [loadingKey, setLoadingKey] = useState<StripePriceKey | null>(null)

    const handleCheckout = async (priceKey: StripePriceKey) => {
        setLoadingKey(priceKey)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                // Save checkout intent and redirect to login
                sessionStorage.setItem('pending_checkout', priceKey)
                router.push('/login?redirect=/pricing')
                return
            }

            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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
        } finally {
            setLoadingKey(null)
        }
    }

    const PricingCard = ({ title, price, interval, description, features, priceKey, popular, gradient }: PricingCardProps) => (
        <div className={cn(
            "relative p-8 rounded-3xl border transition-all duration-300 hover:shadow-xl flex flex-col h-full bg-white/80 backdrop-blur-xl",
            popular ? "border-blue-500 shadow-blue-200 ring-2 ring-blue-500/20" : "border-slate-200 hover:border-slate-300"
        )}>
            {popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg shadow-blue-500/30">
                    Best Value
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm h-10">{description}</p>
            </div>

            <div className="mb-8">
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900">{price}</span>
                    {interval && <span className="text-slate-500 font-medium">/{interval}</span>}
                </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                        <div className={cn("mt-0.5 p-0.5 rounded-full", popular ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500")}>
                            <Check className="w-3 h-3" strokeWidth={3} />
                        </div>
                        {feature}
                    </li>
                ))}
            </ul>

            <button
                onClick={() => handleCheckout(priceKey)}
                disabled={loadingKey !== null}
                className={cn(
                    "w-full py-4 px-6 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2",
                    popular
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                )}
            >
                {loadingKey === priceKey ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        {interval ? "Subscribe Now" : "Buy Now"}
                        {!interval && <Zap className="w-4 h-4" />}
                    </>
                )}
            </button>
        </div>
    )

    return (
        <main className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-3xl" />
            </div>

            {/* Navigation */}
            <div className="relative z-10 p-6">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 pb-20">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-2xl mb-6">
                        <Heart className="w-8 h-8 text-red-500 fill-red-500 animate-pulse" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                        Playing Is Better Without Limits
                    </h1>
                    <p className="text-lg text-slate-600">
                        Never wait for hearts again. Unlock unlimited gameplay and master geography faster with Premium.
                    </p>
                </div>

                {/* Subscriptions Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {/* Monthly */}
                    <PricingCard
                        title="Premium Monthly"
                        price="$4.99"
                        interval="mo"
                        description="Flexible monthly billing. Cancel anytime."
                        priceKey="PREMIUM_MONTHLY"
                        features={[
                            "Unlimited Hearts ❤️",
                            "No Ads",
                            "Premium Leaderboard Badge",
                            "Support Development"
                        ]}
                    />

                    {/* Yearly */}
                    <PricingCard
                        title="Premium Yearly"
                        price="$49.99"
                        interval="yr"
                        priceKey="PREMIUM_YEARLY"
                        description="Commit to mastery. Save ~17% compared to monthly."
                        popular={true}
                        features={[
                            "Unlimited Hearts ❤️",
                            "No Ads",
                            "Premium Leaderboard Badge",
                            "Priority Support",
                            "2 Months Free"
                        ]}
                    />

                    {/* Heart Pack 5 */}
                    <PricingCard
                        title="Starter Pack"
                        price="$0.99"
                        description="Quick refill for casual players."
                        priceKey="HEART_PACK_5"
                        features={[
                            "Get 5 Extra Hearts",
                            "Use anytime",
                            "Never expires"
                        ]}
                    />

                    {/* Heart Pack 20 */}
                    <PricingCard
                        title="Pro Pack"
                        price="$2.99"
                        description="Best value for heart refills."
                        priceKey="HEART_PACK_20"
                        features={[
                            "Get 20 Extra Hearts",
                            "Use anytime",
                            "Never expires",
                            "Save 25%"
                        ]}
                    />
                </div>

                {/* FAQ / Trust Section */}
                <div className="mt-20 text-center max-w-xl mx-auto space-y-8">
                    <div className="flex items-center justify-center gap-8 opacity-60 grayscale">
                        <div className="flex items-center gap-2 font-bold text-slate-400">
                            <span className="text-2xl">🔒</span> Secure Payment
                        </div>
                        <div className="flex items-center gap-2 font-bold text-slate-400">
                            <span className="text-2xl">⚡</span> Powered by Stripe
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm">
                        Prices may vary by region. Subscriptions auto-renew but can be cancelled at any time from your dashboard.
                    </p>
                </div>
            </div>
        </main>
    )
}
