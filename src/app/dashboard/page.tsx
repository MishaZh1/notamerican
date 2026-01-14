
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { signOut } from '../login/actions'
import { LogOut, Award, Settings, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch Public Profile (XP, Streak, etc.)
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    // Data Derivation
    let displayName = user.user_metadata.full_name || profile?.display_name || user.email?.split('@')[0] || 'Explorer'

    // Format Name
    if (user.user_metadata.full_name) {
        const parts = user.user_metadata.full_name.trim().split(' ')
        if (parts.length > 1) {
            const firstName = parts[0]
            const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase()
            displayName = `${firstName} ${lastInitial}.`
        }
    }

    // Avatar Logic
    // prioritize: user_metadata (oauth) -> profile (custom) -> null
    const avatarUrl = user.user_metadata.avatar_url || profile?.avatar_url

    // Level Logic
    const xp = profile?.xp_total || 0
    const level = Math.floor(xp / 100) + 1
    const progress = xp % 100
    const nextLevelXp = level * 100
    const xpNeeded = 100 - progress

    // Fetch Total Games
    const { count: gamesPlayed } = await supabase
        .from('quiz_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    return (
        <div className="min-h-screen bg-slate-50 p-4 pb-20">
            {/* Header */}
            <header className="flex justify-between items-center mb-6">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-700">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-black text-slate-800">Dashboard</h1>
                <div className="w-10" /> {/* Spacer for centering */}
            </header>

            {/* Profile Section */}
            <div className="flex flex-col items-center mb-8 relative">
                <div className="relative mb-3">
                    {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-28 h-28 rounded-full border-4 border-white shadow-xl object-cover bg-slate-200"
                        />
                    ) : (
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-4xl text-white font-black border-4 border-white shadow-xl">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                    )}

                    {/* Settings Link */}
                    <Link href="/settings">
                        <button className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-md border border-slate-200 text-slate-600 hover:text-primary transition-colors cursor-pointer">
                            <Settings className="w-4 h-4" />
                        </button>
                    </Link>
                </div>

                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{displayName}</h2>
                <p className="text-slate-500 font-bold text-sm uppercase tracking-wide">Level {level} Explorer</p>

                {/* Level Progress */}
                <div className="w-full max-w-xs mt-4">
                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                        <span>{progress} XP</span>
                        <span>{100} XP (Lvl {level + 1})</span>
                    </div>
                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-center text-xs text-slate-400 mt-2 font-medium">
                        {xpNeeded} XP needed for next level
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <Card className="border-b-4 border-slate-200 shadow-sm">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <Award className="w-8 h-8 text-yellow-500 mb-2" />
                        <span className="text-3xl font-black text-slate-700">{xp}</span>
                        <span className="text-xs uppercase font-bold text-slate-400">Total XP</span>
                    </CardContent>
                </Card>
                <Card className="border-b-4 border-slate-200 shadow-sm">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-slate-700">#{profile?.rank || '--'}</span>
                        <span className="text-xs uppercase font-bold text-slate-400">Global Rank</span>
                    </CardContent>
                </Card>
                <Card className="border-b-4 border-slate-200 shadow-sm">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-slate-700">🔥 {profile?.streak_current || 0}</span>
                        <span className="text-xs uppercase font-bold text-slate-400">Day Streak</span>
                    </CardContent>
                </Card>
                <Card className="border-b-4 border-slate-200 shadow-sm">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-slate-700">{gamesPlayed || 0}</span>
                        <span className="text-xs uppercase font-bold text-slate-400">Games Played</span>
                    </CardContent>
                </Card>
            </div>

            {/* Upgrade Banner */}
            <div className="mb-8 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-white/10 rotate-12 scale-150 transform origin-top-left -translate-y-1/2" />
                <div className="relative z-10">
                    <h3 className="text-xl font-black mb-1">GO PREMIUM</h3>
                    <p className="text-indigo-100 text-sm font-medium mb-4">Unlimited hearts, no ads, and exclusive avatars.</p>
                    <Button className="w-full bg-white text-indigo-600 font-black border-none hover:bg-white/90">
                        UPGRADE NOW
                    </Button>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pb-8">
                <Button asChild className="w-full btn-3d-secondary h-14 text-lg cursor-pointer">
                    <Link href="/">
                        PLAY NOW
                    </Link>
                </Button>
                <Button asChild variant="outline" className="w-full h-12 border-2 border-slate-200 font-bold text-slate-500">
                    <Link href="/settings">
                        <Settings className="mr-2 w-4 h-4" /> All Settings
                    </Link>
                </Button>
            </div>
        </div>
    )
}
