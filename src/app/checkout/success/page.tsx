"use client"

import Link from "next/link"
import { Check, ArrowRight } from "lucide-react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CheckoutSuccessPage() {
    const router = useRouter()

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 text-center border border-slate-100 relative overflow-hidden">
                {/* Background Sparkles */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500" />

                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
                </div>

                <h1 className="text-2xl font-black text-slate-900 mb-2">
                    Payment Successful!
                </h1>
                <p className="text-slate-600 mb-8">
                    Thank you for your purchase. Your account has been updated and you're ready to play!
                </p>

                <div className="space-y-3">
                    <Link
                        href="/play"
                        className="block w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
                    >
                        Start Playing Now
                        <ArrowRight className="w-5 h-5" />
                    </Link>

                    <Link
                        href="/dashboard"
                        className="block w-full py-3 text-slate-500 hover:text-slate-800 font-medium transition-colors"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </main>
    )
}
