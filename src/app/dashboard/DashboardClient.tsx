"use client"

import { User } from "@supabase/supabase-js"
import Link from "next/link"
import Image from "next/image"
import { Trophy, Flame, Award, Play, LogOut, Calendar, Target, Crown, CreditCard, Heart, TrendingUp, BarChart3, Globe2 } from "lucide-react"
import { signOut } from "../login/actions"

interface Profile {
    id: string
    username: string | null
    email: string | null
    display_name: string | null
    avatar_url: string | null
    xp_total: number
    streak_current: number
    streak_best: number
    last_active_date: string | null
    created_at: string
    subscription_tier?: 'free' | 'premium_monthly' | 'premium_yearly'
    subscription_expires_at?: string | null
    heart_packs_owned?: number
}

interface Session {
    id: string
    score: number
    correct_count: number
    duration_ms: number
    started_at: string
    ended_at: string | null
}

interface DashboardClientProps {
    user: User
    profile: Profile | null
    sessions: Session[]
}

export default function DashboardClient({ user, profile, sessions }: DashboardClientProps) {
    const handleSignOut = async () => {
        await signOut()
    }

    // Helper: Format Name (First Name + Last Initial)
    const formatName = (fullName: string | null, email: string | null) => {
        if (!fullName) return email?.split('@')[0] || "Explorer"
        const parts = fullName.trim().split(' ')
        if (parts.length === 1) return parts[0]
        return `${parts[0]} ${parts[parts.length - 1][0]}.`
    }

    // Stats Calculation
    const totalGames = sessions.length
    const totalScore = sessions.reduce((acc, s) => acc + s.score, 0)
    // Approximate accuracy (assuming 10 pts per correct answer usually, but best if we had total questions. We'll use a heuristic or just show Average Score which is safer)
    // Actually, sessions has `correct_count`. Let's assume typical game has ~20-30 attempts? 
    // Let's stick to Average Score for reliability unless we fix tracking.
    const avgScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0

    // Activity Chart Data (Last 7 Days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return d.toISOString().split('T')[0]
    })

    const activityData = last7Days.map(date => {
        const count = sessions.filter(s => s.started_at.startsWith(date)).length
        return { date, count }
    })
    const maxActivity = Math.max(...activityData.map(d => d.count), 5) // Scale max

    // Rank Logic (Mock)
    const ranks = ["Rookie", "Explorer", "Navigator", "Cartographer", "Global Master"]
    const rankIndex = Math.min(Math.floor((profile?.xp_total || 0) / 1000), ranks.length - 1)
    const currentRank = ranks[rankIndex]
    const nextRank = ranks[rankIndex + 1] || "Legend"
    const progressToNext = Math.min(100, (((profile?.xp_total || 0) % 1000) / 1000) * 100)

    return (
        <main className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
                    <Link href="/">
                        <div className="relative w-40 h-10">
                            <Image
                                src="/logo.png"
                                alt="Nota Merican"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-medium text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Sign Out</span>
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN: Profile & Stats */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Hero */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                            <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full border-4 border-white/30 bg-white/10 flex items-center justify-center text-3xl font-bold shadow-inner">
                                        {profile?.avatar_url ? (
                                            <Image
                                                src={profile.avatar_url}
                                                alt="Avatar"
                                                fill
                                                className="object-cover rounded-full"
                                            />
                                        ) : (
                                            (profile?.display_name || profile?.email || "U")[0].toUpperCase()
                                        )}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full border-2 border-indigo-600">
                                        Lvl {Math.floor((profile?.xp_total || 0) / 500) + 1}
                                    </div>
                                </div>
                                <div className="text-center sm:text-left flex-1">
                                    <h1 className="text-3xl font-black mb-1">
                                        {formatName(profile?.display_name, profile?.email)}
                                    </h1>
                                    <div className="flex items-center justify-center sm:justify-start gap-2 text-indigo-100 text-sm font-medium mb-4">
                                        <Crown className="w-4 h-4 text-yellow-400" />
                                        <span>{currentRank}</span>
                                        <span className="w-1 h-1 bg-white/40 rounded-full" />
                                        <span>Joined {new Date(profile?.created_at || user.created_at).toLocaleDateString()}</span>
                                    </div>

                                    {/* Rank Progress */}
                                    <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)] transition-all duration-1000"
                                            style={{ width: `${progressToNext}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-indigo-200 mt-1 font-medium">
                                        <span>{profile?.xp_total} XP</span>
                                        <span>Next: {nextRank}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                                <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center mb-3">
                                    <Flame className="w-5 h-5 text-orange-600" />
                                </div>
                                <div className="text-3xl font-black text-slate-800">{profile?.streak_current || 0}</div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Day Streak</div>
                            </div>
                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                                <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center mb-3">
                                    <Target className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="text-3xl font-black text-slate-800">{totalGames}</div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Games Played</div>
                            </div>
                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                                <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center mb-3">
                                    <Trophy className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="text-3xl font-black text-slate-800">{profile?.streak_best || 0}</div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Best Streak</div>
                            </div>
                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                                <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center mb-3">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="text-3xl font-black text-slate-800">{avgScore}</div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Avg Score</div>
                            </div>
                        </div>

                        {/* Recent History */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-slate-400" />
                                    Recent Activity
                                </h2>
                                <Link href="/play" className="text-indigo-600 font-bold text-sm hover:underline">
                                    Play New Game
                                </Link>
                            </div>

                            {sessions.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 italic">No games played yet. Start your journey!</div>
                            ) : (
                                <div className="space-y-4">
                                    {sessions.slice(0, 5).map((session) => (
                                        <div key={session.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex flex-col items-center justify-center font-bold">
                                                    <span className="text-xs uppercase opacity-70">SCR</span>
                                                    <span>{session.score}</span>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-700">Match Madness</div>
                                                    <div className="text-xs text-slate-400">
                                                        {new Date(session.started_at).toLocaleDateString()} • {Math.round(session.duration_ms / 1000)}s
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-green-600">+{Math.round(session.score / 10)} XP</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Charts & Status */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Globe2 className="w-5 h-5 text-indigo-500" />
                                Weekly Activity
                            </h3>
                            <div className="h-40 flex items-end justify-between gap-2">
                                {activityData.map((d, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="w-full bg-slate-100 rounded-t-lg relative h-32 overflow-hidden flex items-end">
                                            <div
                                                className="w-full bg-indigo-500 group-hover:bg-indigo-600 transition-all rounded-t-lg"
                                                style={{ height: `${(d.count / maxActivity) * 100}%` }}
                                            />
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                                            {new Date(d.date).toLocaleDateString('en-US', { weekday: 'narrow' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Global Rank (Mock) */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-8 -mt-8" />
                            <h3 className="font-bold text-slate-300 mb-1 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" />
                                Global Ranking
                            </h3>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-4xl font-black text-white">#1,420</span>
                                <span className="text-green-400 text-sm font-bold mb-1">Top 15%</span>
                            </div>
                            <p className="text-xs text-slate-400 mb-4">You're doing better than 85% of players this week!</p>
                            <Link href="/leaderboard">
                                <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all border border-white/10">
                                    View Leaderboard
                                </button>
                            </Link>
                        </div>

                        {/* Subscription & Hearts */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800">Hearts</div>
                                        <div className="text-xs text-slate-500">
                                            {profile?.heart_packs_owned || 0} packs available
                                        </div>
                                    </div>
                                </div>
                                <Link href="/pricing" className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-red-100 transition-colors">
                                    + ADD
                                </Link>
                            </div>

                            <hr className="border-slate-100 my-4" />

                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800">Plan</div>
                                        <div className="text-xs text-slate-500 capitalize">
                                            {(profile?.subscription_tier || 'free').replace('_', ' ')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {(!profile?.subscription_tier || profile.subscription_tier === 'free') ? (
                                <Link href="/pricing">
                                    <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all text-sm">
                                        Upgrade to Premium
                                    </button>
                                </Link>
                            ) : (
                                <button
                                    onClick={() => window.open('https://billing.stripe.com/p/login/test', '_blank')}
                                    className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm"
                                >
                                    Manage Subscription
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
