"use client"

import { useState, useEffect, useCallback } from 'react'
import { getHeartsForCurrentGame, useHeartPack as useHeartPackAction } from '@/app/actions-hearts'
import { createClient } from '@/lib/supabase/client'

interface UseHeartsReturn {
    heartsForCurrentGame: number
    gamesPlayedTotal: number
    heartPacksOwned: number
    isPremium: boolean
    isLoading: boolean
    canUseHeartPack: boolean
    useHeartPack: () => Promise<boolean>
    refreshHearts: () => Promise<void>
}

/**
 * Hook to manage hearts for the current game
 * 
 * Progressive difficulty model:
 * - Games 1-3: 5 hearts
 * - Games 4+: 1 heart (unless premium or has heart packs)
 * 
 * Premium users: Always 5 hearts
 */
export function useHearts(): UseHeartsReturn {
    const [heartsForCurrentGame, setHeartsForCurrentGame] = useState(5)
    const [gamesPlayedTotal, setGamesPlayedTotal] = useState(0)
    const [heartPacksOwned, setHeartPacksOwned] = useState(0)
    const [isPremium, setIsPremium] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)

    // Get user ID
    useEffect(() => {
        async function getUserId() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setUserId(user?.id || null)
        }
        getUserId()
    }, [])

    // Fetch hearts data
    const refreshHearts = useCallback(async () => {
        setIsLoading(true)
        try {
            // For guests, check localStorage
            if (!userId) {
                const gamesPlayed = parseInt(localStorage.getItem('nota_games_played') || '0')
                setGamesPlayedTotal(gamesPlayed)
                setHeartsForCurrentGame(gamesPlayed < 3 ? 5 : 1)
                setHeartPacksOwned(0)
                setIsPremium(false)
                setIsLoading(false)
                return
            }

            // For authenticated users, fetch from database
            const data = await getHeartsForCurrentGame(userId)
            setHeartsForCurrentGame(data.hearts)
            setGamesPlayedTotal(data.gamesPlayedTotal)
            setHeartPacksOwned(data.heartPacksOwned)
            setIsPremium(data.isPremium)
        } catch (error) {
            console.error('Error fetching hearts:', error)
            // Fallback to safe defaults
            setHeartsForCurrentGame(5)
        } finally {
            setIsLoading(false)
        }
    }, [userId])

    // Initial load
    useEffect(() => {
        refreshHearts()
    }, [refreshHearts])

    // Use a heart pack
    const useHeartPack = useCallback(async (): Promise<boolean> => {
        if (!userId || heartPacksOwned === 0) {
            return false
        }

        try {
            const result = await useHeartPackAction(userId)
            if (result.success) {
                // Refresh hearts data
                await refreshHearts()
                return true
            }
            return false
        } catch (error) {
            console.error('Error using heart pack:', error)
            return false
        }
    }, [userId, heartPacksOwned, refreshHearts])

    return {
        heartsForCurrentGame,
        gamesPlayedTotal,
        heartPacksOwned,
        isPremium,
        isLoading,
        canUseHeartPack: heartPacksOwned > 0,
        useHeartPack,
        refreshHearts
    }
}
