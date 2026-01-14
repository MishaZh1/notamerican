"use client"

import Link from "next/link"
import Image from "next/image"
import { Award, Play, User } from "lucide-react"

export default function Home() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 bg-gradient-to-b from-slate-50 to-white max-w-md mx-auto">

      {/* Top Bar - Minimal */}
      <div className="w-full flex justify-end py-4 px-2 min-h-[40px]">
        <Link href="/dashboard">
          <button className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 transition-colors">
            <User className="w-6 h-6 text-slate-400" />
          </button>
        </Link>
      </div>

      {/* Center Content - Logo and Mascot */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 w-full">
        {/* Logo - Centered and Bigger */}
        <div className="relative w-96 h-32">
          <Image
            src="/logo.png"
            alt="Nota Merican"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* 3D Mascot Image */}
        <div className="relative w-52 h-52 mx-auto animate-bounce-slow rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/80">
          <Image
            src="/mascot-new.png"
            alt="Agent Marco - Nota Merican Mascot"
            fill
            className="object-cover"
            priority
          />
        </div>

        <p className="text-lg text-slate-600 font-bold max-w-[280px] mx-auto leading-relaxed text-center">
          Learn geography the fun way! 🌍
        </p>
      </div>

      {/* Bottom Navigation - Buttons */}
      <div className="w-full space-y-3 pb-8">
        {/* Primary Action */}
        <Link href="/play" className="w-full block">
          <button className="w-full h-16 btn-3d-primary text-2xl shadow-green-600/30 shadow-lg flex items-center justify-center gap-2">
            PLAY <Play className="w-6 h-6 fill-current" />
          </button>
        </Link>

        {/* Secondary Actions */}
        <Link href="/leaderboard" className="w-full block">
          <button className="w-full h-14 btn-3d-outline text-base flex items-center justify-center gap-2">
            <Award className="w-5 h-5" /> RANKS
          </button>
        </Link>
      </div>
    </main>
  )
}
