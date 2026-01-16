"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { X, Crown, Check } from "lucide-react"

interface UpgradeModalProps {
    isOpen: boolean
    onClose: () => void
    onSelectPlan: (plan: 'monthly' | 'yearly') => void
    trigger?: 'games_3' | 'games_5' | 'games_10' | 'out_of_hearts'
}

/**
 * Premium upgrade modal
 * Shows pricing and benefits
 */
export function UpgradeModal({
    isOpen,
    onClose,
    onSelectPlan,
    trigger = 'games_3'
}: UpgradeModalProps) {
    const getTriggerMessage = () => {
        switch (trigger) {
            case 'games_3':
                return "Enjoying the game? 🎉"
            case 'games_5':
                return "You're on fire! 🔥"
            case 'games_10':
                return "Amazing streak! 🌟"
            case 'out_of_hearts':
                return "Never run out of hearts!"
            default:
                return "Upgrade to Premium"
        }
    }

    const benefits = [
        "Unlimited hearts (always 5 per game)",
        "No ads, ever",
        "Exclusive avatars & badges",
        "Priority leaderboard placement",
        "Early access to new features"
    ]

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="pointer-events-auto w-full max-w-md"
                        >
                            <Card className="border-4 border-indigo-500 shadow-2xl overflow-hidden">
                                {/* Header */}
                                <div className="relative bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white p-8">
                                    <button
                                        onClick={onClose}
                                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>

                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white/40">
                                            <Crown className="w-10 h-10" />
                                        </div>
                                        <h2 className="text-3xl font-black mb-2">{getTriggerMessage()}</h2>
                                        <p className="text-indigo-100 text-sm">
                                            Unlock the full NotAmerican experience
                                        </p>
                                    </div>
                                </div>

                                <CardContent className="p-6 space-y-6">
                                    {/* Benefits */}
                                    <div className="space-y-3">
                                        {benefits.map((benefit, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="flex items-start gap-3"
                                            >
                                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <Check className="w-4 h-4 text-green-600" />
                                                </div>
                                                <span className="text-slate-700 font-medium">{benefit}</span>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Pricing Cards */}
                                    <div className="space-y-3">
                                        {/* Monthly */}
                                        <button
                                            onClick={() => onSelectPlan('monthly')}
                                            className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="text-left">
                                                    <div className="font-black text-slate-700 group-hover:text-indigo-600 transition-colors">
                                                        Monthly Plan
                                                    </div>
                                                    <div className="text-xs text-slate-500">Billed monthly, cancel anytime</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-black text-indigo-600">$4.99</div>
                                                    <div className="text-xs text-slate-500">/month</div>
                                                </div>
                                            </div>
                                        </button>

                                        {/* Yearly */}
                                        <button
                                            onClick={() => onSelectPlan('yearly')}
                                            className="w-full p-4 rounded-xl border-2 border-indigo-500 bg-indigo-50 hover:bg-indigo-100 transition-all group relative overflow-hidden"
                                        >
                                            <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-1 rounded-full">
                                                SAVE 33%
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-left">
                                                    <div className="font-black text-slate-700 group-hover:text-indigo-600 transition-colors">
                                                        Yearly Plan
                                                    </div>
                                                    <div className="text-xs text-slate-500">Best value - $3.33/month</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-black text-indigo-600">$39.99</div>
                                                    <div className="text-xs text-slate-500">/year</div>
                                                </div>
                                            </div>
                                        </button>
                                    </div>

                                    {/* Footer */}
                                    <div className="text-center">
                                        <p className="text-xs text-slate-400 mb-3">
                                            7-day free trial • Cancel anytime • No commitments
                                        </p>
                                        <Button
                                            variant="ghost"
                                            onClick={onClose}
                                            className="text-slate-500"
                                        >
                                            Maybe Later
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
