"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShoppingCart, Crown } from "lucide-react"

interface OutOfHeartsModalProps {
    isOpen: boolean
    onClose: () => void
    onBuyHeartPack: (packSize: 5 | 20) => void
    onUpgradeToPremium: () => void
    gamesPlayedTotal: number
}

/**
 * Modal shown when user runs out of hearts
 * Offers heart packs or premium upgrade
 */
export function OutOfHeartsModal({
    isOpen,
    onClose,
    onBuyHeartPack,
    onUpgradeToPremium,
    gamesPlayedTotal
}: OutOfHeartsModalProps) {
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
                            <Card className="border-4 border-rose-500 shadow-2xl">
                                <CardHeader className="relative bg-gradient-to-br from-rose-500 to-pink-600 text-white pb-8">
                                    <button
                                        onClick={onClose}
                                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>

                                    <div className="text-center">
                                        <div className="text-6xl mb-3">💔</div>
                                        <CardTitle className="text-2xl font-black">Out of Hearts!</CardTitle>
                                        <p className="text-rose-100 text-sm mt-2">
                                            {gamesPlayedTotal < 3
                                                ? "You've used all 5 hearts for this game"
                                                : "You only get 1 heart per game now"}
                                        </p>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-6 space-y-4">
                                    {/* Heart Packs */}
                                    <div className="space-y-3">
                                        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Buy Hearts</h3>

                                        {/* 5-Pack */}
                                        <button
                                            onClick={() => onBuyHeartPack(5)}
                                            className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-2xl">
                                                        ❤️
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-black text-slate-700 group-hover:text-primary transition-colors">
                                                            5 Heart Pack
                                                        </div>
                                                        <div className="text-xs text-slate-500">5 games with 5 hearts each</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-black text-primary">$0.99</div>
                                                </div>
                                            </div>
                                        </button>

                                        {/* 20-Pack */}
                                        <button
                                            onClick={() => onBuyHeartPack(20)}
                                            className="w-full p-4 rounded-xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-all group relative overflow-hidden"
                                        >
                                            <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-1 rounded-full">
                                                BEST VALUE
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-2xl">
                                                        ❤️
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-black text-slate-700 group-hover:text-primary transition-colors">
                                                            20 Heart Pack
                                                        </div>
                                                        <div className="text-xs text-slate-500">20 games with 5 hearts each</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-black text-primary">$2.99</div>
                                                    <div className="text-xs text-green-600 font-bold">Save 40%</div>
                                                </div>
                                            </div>
                                        </button>
                                    </div>

                                    {/* Divider */}
                                    <div className="relative py-2">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-slate-200"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-white px-2 text-slate-500 font-bold">Or</span>
                                        </div>
                                    </div>

                                    {/* Premium Upgrade */}
                                    <button
                                        onClick={onUpgradeToPremium}
                                        className="w-full p-5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Crown className="w-8 h-8" />
                                                <div className="text-left">
                                                    <div className="font-black text-lg">Go Premium</div>
                                                    <div className="text-xs text-indigo-100">Unlimited hearts forever</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-black">$4.99</div>
                                                <div className="text-xs text-indigo-200">/month</div>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Close button */}
                                    <Button
                                        variant="ghost"
                                        onClick={onClose}
                                        className="w-full text-slate-500"
                                    >
                                        Maybe Later
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
