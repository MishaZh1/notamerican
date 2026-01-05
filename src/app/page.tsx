"use client"
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Zap, Award, User, LogIn, Flag, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  username: string
  xp_total: number
  streak_current: number
  avatar_url?: string
  display_name?: string
}

export default function Home() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (user) {
      const supabase = createClient()
      supabase
        .from('users')
        .select('username, xp_total, streak_current, avatar_url, display_name')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data)
        })
    }
  }, [user])

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-background max-w-md mx-auto">

      {/* Header / Hero */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-6 w-full py-12">
        <div className="text-center space-y-4 relative w-full">
          <h1 className="text-4xl font-black text-slate-700 tracking-tighter">
            Nota<span className="text-primary">M</span>
          </h1>

          {/* Streak Indicator */}
          <div className="absolute top-0 right-0 md:right-10 flex items-center gap-1 text-orange-500 font-black animate-in fade-in zoom-in duration-1000">
            <span className="text-lg">🔥</span>
            <span className="text-xl">{profile?.streak_current || 0}</span>
          </div>

          {/* User Info - Show when logged in */}
          {user && profile && (
            <div className="absolute top-0 left-0 md:left-10 flex items-center gap-2">
              <UserAvatar
                src={profile.avatar_url}
                name={profile.display_name || profile.username}
                size="sm"
              />
              <div className="text-left">
                <div className="text-xs font-bold text-slate-700">{profile.display_name || profile.username}</div>
                <div className="text-xs text-slate-400">{profile.xp_total} XP</div>
              </div>
            </div>
          )}

          {/* 3D Mascot Image - Styled as Icon */}
          <div className="relative w-48 h-48 mx-auto animate-bounce-slow rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/80">
            <Image
              src="/mascot.png"
              alt="NotaMerican Mascot"
              fill
              className="object-cover"
              priority
            />
          </div>

          <p className="text-lg text-slate-500 font-bold max-w-[250px] mx-auto leading-relaxed">
            The free, fun, and effective way to learn trivia!
          </p>
        </div>
      </div>

      {/* Action Buttons - Fixed Width & Consistent */}
      <div className="w-full space-y-3 pb-8">

        <Link href="/play" className="w-full block">
          <button className="w-full h-14 btn-3d-primary text-xl shadow-green-600/30 shadow-lg">
            GET STARTED
          </button>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/play/match" className="w-full block">
            <button className="w-full h-14 btn-3d-secondary text-base flex flex-col items-center justify-center leading-none gap-1">
              <Zap className="fill-white w-5 h-5" />
              <span>MATCH</span>
            </button>
          </Link>
          <Link href="/play/flags" className="w-full block">
            <button className="w-full h-14 btn-3d-secondary text-base flex flex-col items-center justify-center leading-none gap-1 border-b-cyan-600 bg-cyan-500">
              <Flag className="fill-white w-5 h-5" />
              <span>FLAGS</span>
            </button>
          </Link>
        </div>

        {/* Secondary Actions Row */}
        <div className="flex gap-3 mt-2">
          <Link href="/leaderboard" className="flex-1">
            <button className="w-full h-12 btn-3d-outline text-sm flex items-center justify-center gap-2">
              <Award className="w-5 h-5" /> RANKS
            </button>
          </Link>
          {user ? (
            <button
              onClick={() => signOut()}
              className="flex-1 h-12 btn-3d-outline text-sm flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" /> LOGOUT
            </button>
          ) : (
            <Link href="/login" className="flex-1">
              <button className="w-full h-12 btn-3d-outline text-sm flex items-center justify-center gap-2">
                <LogIn className="w-5 h-5" /> LOGIN
              </button>
            </Link>
          )}
        </div>

      </div>
    </main>
  );
}
