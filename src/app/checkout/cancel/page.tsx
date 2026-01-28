"use client"

import Link from "next/link"
import { X, ArrowLeft } from "lucide-react"

export default function CheckoutCancelPage() {
    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 text-center border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-slate-300 to-slate-400" />

                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <X className="w-10 h-10 text-slate-500" strokeWidth={3} />
                </div>

                <h1 className="text-2xl font-black text-slate-900 mb-2">
                    Payment Cancelled
                </h1>
                <p className="text-slate-600 mb-8">
                    No charges were made. You can try again whenever you're ready.
                </p>

                <div className="space-y-3">
                    <Link
                        href="/pricing"
                        className="block w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Pricing
                    </Link>

                    <Link
                        href="/"
                        className="block w-full py-3 text-slate-500 hover:text-slate-800 font-medium transition-colors"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        </main>
    )
}
