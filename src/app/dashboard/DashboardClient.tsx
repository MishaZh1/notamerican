"use client"

import { User } from "@supabase/supabase-js"
import Link from "next/link"
import Image from "next/image"
import { Trophy, Flame, Award, Play, LogOut, Calendar, Target } from "lucide-react"
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

    const totalGames = sessions.length
    const totalScore = sessions.reduce((acc, s) => acc + s.score, 0)
    const avgScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0

    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pt-6">
                    <Link href="/">
                        <div className="relative w-48 h-12">
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
                        className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white border border-slate-200 rounded-xl text-slate-700 font-medium transition-all shadow-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>

                {/* Profile Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 mb-6">
                    <div className="flex items-center gap-6 mb-6">
                        {/* Avatar */}
                        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                            {profile?.avatar_url ? (
                                <Image
                                    src={profile.avatar_url}
                                    alt={profile.display_name || "User"}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <span>{(profile?.display_name || profile?.email || "U")[0].toUpperCase()}</span>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-slate-800 mb-1">
                                {profile?.display_name || profile?.username || "Geography Explorer"}
                            </h1>
                            <p className="text-slate-600">{profile?.email || user.email}</p>
                            <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center gap-1 text-sm text-slate-500">
                                    <Calendar className="w-4 h-4" />
                                    Joined {new Date(profile?.created_at || user.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* XP */}
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4 border border-yellow-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Trophy className="w-5 h-5 text-yellow-600" />
                                <span className="text-sm font-medium text-yellow-800">Total XP</span>
                            </div>
                            <p className="text-3xl font-bold text-yellow-900">{profile?.xp_total || 0}</p>
                        </div>

                        {/* Current Streak */}
                        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Flame className="w-5 h-5 text-orange-600" />
                                <span className="text-sm font-medium text-orange-800">Streak</span>
                            </div>
                            <p className="text-3xl font-bold text-orange-900">{profile?.streak_current || 0}</p>
                        </div>

                        {/* Best Streak */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Award className="w-5 h-5 text-purple-600" />
                                <span className="text-sm font-medium text-purple-800">Best Streak</span>
                            </div>
                            <p className="text-3xl font-bold text-purple-900">{profile?.streak_best || 0}</p>
                        </div>

                        {/* Games Played */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">Games</span>
                            </div>
                            <p className="text-3xl font-bold text-blue-900">{totalGames}</p>
                        </div>
                    </div>
                </div>

                {/* Recent Games */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-600" />
                        Recent Games
                    </h2>

                    {sessions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-24 h-24 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                                <Play className="w-12 h-12 text-slate-400" />
                            </div>
                            <p className="text-slate-600 mb-4">No games played yet</p>
                            <Link href="/play">
                                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all">
                                    Play Your First Game
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sessions.map((session, index) => (
                                <div
                                    key={session.id}
                                    className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">
                                                Score: {session.score} ({session.correct_count} correct)
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {new Date(session.started_at).toLocaleDateString()} •{" "}
                                                {Math.round(session.duration_ms / 1000)}s
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-blue-600">{session.score}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/play" className="block">
                        <button className="w-full h-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xl rounded-2xl shadow-lg shadow-green-500/30 transition-all flex items-center justify-center gap-2">
                            <Play className="w-6 h-6 fill-current" />
                            Play Now
                        </button>
                    </Link>
                    <Link href="/leaderboard" className="block">
                        <button className="w-full h-16 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold text-xl rounded-2xl shadow-lg shadow-yellow-500/30 transition-all flex items-center justify-center gap-2">
                            <Award className="w-6 h-6" />
                            Leaderboard
                        </button>
                    </Link>
                </div>
            </div>
        </main>
    )
}
