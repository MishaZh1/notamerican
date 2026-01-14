"use client"

import { useCallback } from "react"

export function useSound() {
    const playSound = useCallback((type: 'correct' | 'wrong' | 'xp' | 'streak') => {
        const audio = new Audio(`/sfx/${type}.mp3`)
        audio.play().catch(err => console.log("Sound play prevented by browser policy", err))
    }, [])

    return { playSound }
}
