"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { fetchLeaderboard, UserProfile } from "@/app/actions-social"
import { Button } from "@/components/ui/button"
import { Loader2, Trophy, ArrowLeft, Flame } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { UserAvatar } from "@/components/ui/UserAvatar"
import { useAuth } from "@/contexts/auth-context"

export default function LeaderboardPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const data = await fetchLeaderboard()
            setUsers(data)
            setLoading(false)
        }
        load()
    }, [])

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <main className="min-h-screen bg-slate-50 relative pb-20">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b z-10 p-4 shadow-sm flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                    <ArrowLeft className="w-6 h-6 text-slate-400" />
                </Button>
                <h1 className="font-black text-xl text-slate-700 uppercase tracking-widest flex-1 text-center pr-10">
                    Leaderboard
                </h1>
            </div>

            <div className="max-w-md mx-auto p-4 space-y-4">

                {/* Top 3 Podium (Visual) - If we have enough users */}
                {users.length >= 3 && (
                    <div className="flex justify-center items-end gap-4 py-8 mb-4">
                        {/* 2nd Place */}
                        <div className="flex flex-col items-center">
                            <UserAvatar src={users[1].avatar_url} name={users[1].display_name || users[1].username} size="md" className="mb-2" />
                            <div className="text-slate-500 font-bold mb-1 text-sm">{users[1].display_name || users[1].username}</div>
                            <div className="w-20 h-24 bg-slate-200 rounded-t-lg border-x-4 border-t-4 border-slate-300 flex items-center justify-center text-2xl font-black text-slate-400">
                                2
                            </div>
                        </div>
                        {/* 1st Place */}
                        <div className="flex flex-col items-center">
                            <Trophy className="w-8 h-8 text-yellow-500 mb-2 animate-bounce" />
                            <UserAvatar src={users[0].avatar_url} name={users[0].display_name || users[0].username} size="lg" className="mb-2" />
                            <div className="text-slate-700 font-bold mb-1 text-sm">{users[0].display_name || users[0].username}</div>
                            <div className="w-24 h-32 bg-yellow-100 rounded-t-lg border-x-4 border-t-4 border-yellow-300 flex items-center justify-center text-4xl font-black text-yellow-600">
                                1
                            </div>
                        </div>
                        {/* 3rd Place */}
                        <div className="flex flex-col items-center">
                            <UserAvatar src={users[2].avatar_url} name={users[2].display_name || users[2].username} size="md" className="mb-2" />
                            <div className="text-slate-500 font-bold mb-1 text-sm">{users[2].display_name || users[2].username}</div>
                            <div className="w-20 h-20 bg-orange-100 rounded-t-lg border-x-4 border-t-4 border-orange-200 flex items-center justify-center text-2xl font-black text-orange-400">
                                3
                            </div>
                        </div>
                    </div>
                )}

                {/* List View */}
                <div className="space-y-2">
                    {users.map((userItem, index) => (
                        <Card key={userItem.id} className={cn(
                            "border-2 hover:bg-slate-50 transition-colors",
                            index < 3 ? "border-yellow-400 bg-yellow-50" : "border-slate-200",
                            user?.id === userItem.id && "ring-2 ring-primary ring-offset-2"
                        )}>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className={cn(
                                    "w-8 h-8 flex items-center justify-center font-black rounded-full",
                                    index < 3 ? "text-yellow-700" : "text-slate-400"
                                )}>
                                    {index + 1}
                                </div>
                                <UserAvatar src={userItem.avatar_url} name={userItem.display_name || userItem.username} size="sm" />
                                <div className="flex-1">
                                    <div className="font-bold text-slate-700">
                                        {userItem.display_name || userItem.username}
                                        {user?.id === userItem.id && <span className="ml-2 text-primary text-xs">(You)</span>}
                                    </div>
                                    <div className="text-xs text-slate-400 font-bold uppercase">{userItem.xp_total} XP</div>
                                </div>
                                {userItem.streak_current > 0 && (
                                    <div className="flex items-center gap-1 text-orange-500 font-bold">
                                        <Flame className="w-4 h-4 fill-current" />
                                        {userItem.streak_current}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </main>
    )
}
