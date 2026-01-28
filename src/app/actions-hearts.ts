"use server"

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

/**
 * Get hearts allocation for the current game
 * Based on progressive difficulty model:
 * - Games 1-3: 5 hearts
 * - Games 4+: 1 heart (unless premium or has heart packs)
 */
export async function getHeartsForCurrentGame(userId: string | null) {
    if (!userId) {
        // Guest users: always 5 hearts for first 3 games tracked in localStorage
        return { hearts: 5, isPremium: false, gamesPlayedTotal: 0, heartPacksOwned: 0 }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
        .rpc('get_hearts_for_game', { user_id_param: userId })

    if (error) {
        console.error('Error getting hearts:', error)
        return { hearts: 5, isPremium: false, gamesPlayedTotal: 0, heartPacksOwned: 0 }
    }

    // Also fetch user data for context
    const { data: userData } = await supabase
        .from('users')
        .select('games_played_total, heart_packs_owned, subscription_tier, subscription_expires_at')
        .eq('id', userId)
        .single()

    const isPremium = userData?.subscription_tier !== 'free' &&
        (!userData?.subscription_expires_at || new Date(userData.subscription_expires_at) > new Date())

    return {
        hearts: data as number,
        isPremium,
        gamesPlayedTotal: userData?.games_played_total || 0,
        heartPacksOwned: userData?.heart_packs_owned || 0
    }
}

/**
 * Increment games played counter
 * Called when a game starts
 */
export async function incrementGamesPlayed(userId: string | null) {
    if (!userId) {
        // For guests, increment in localStorage (handled client-side)
        return { success: true }
    }

    const supabase = await createClient()

    const { error } = await supabase
        .rpc('increment_games_played', { user_id_param: userId })

    if (error) {
        console.error('Error incrementing games:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

/**
 * Use a heart pack (consumes 1 pack, gives 5 hearts for current game)
 */
export async function useHeartPack(userId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .rpc('use_heart_pack', { user_id_param: userId })

    if (error) {
        console.error('Error using heart pack:', error)
        return { success: false, error: error.message }
    }

    return { success: data as boolean }
}

/**
 * Check if user can play a game
 * Checks both hearts and daily limits
 */
export async function canPlayGame(userId: string | null) {
    if (!userId) {
        // Guests can always play (limits enforced client-side via localStorage)
        return { canPlay: true, reason: null }
    }

    const supabase = await createClient()

    const { data: userData } = await supabase
        .from('users')
        .select('games_played_today, daily_limit_reset_at, subscription_tier, subscription_expires_at')
        .eq('id', userId)
        .single()

    if (!userData) {
        return { canPlay: true, reason: null }
    }

    const isPremium = userData.subscription_tier !== 'free' &&
        (!userData.subscription_expires_at || new Date(userData.subscription_expires_at) > new Date())

    // Premium users have no limits
    if (isPremium) {
        return { canPlay: true, reason: null }
    }

    // Check daily limit (3 games per day for free users)
    const DAILY_LIMIT = 3
    if (userData.games_played_today >= DAILY_LIMIT) {
        const now = new Date()
        const resetTime = userData.daily_limit_reset_at ? new Date(userData.daily_limit_reset_at) : new Date(now.setHours(24, 0, 0, 0))
        const timeRemaining = Math.max(0, resetTime.getTime() - Date.now())

        return {
            canPlay: false,
            reason: 'daily_limit_reached',
            gamesPlayedToday: userData.games_played_today,
            dailyLimit: DAILY_LIMIT,
            timeRemaining // in ms
        }
    }

    return { canPlay: true, reason: null, gamesPlayedToday: userData.games_played_today, dailyLimit: DAILY_LIMIT }
}

/**
 * Get user's subscription status
 */
export async function getSubscriptionStatus(userId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('users')
        .select('subscription_tier, subscription_expires_at, stripe_customer_id')
        .eq('id', userId)
        .single()

    if (error || !data) {
        return {
            tier: 'free' as const,
            isActive: false,
            expiresAt: null
        }
    }

    const isActive = data.subscription_tier !== 'free' &&
        (!data.subscription_expires_at || new Date(data.subscription_expires_at) > new Date())

    return {
        tier: data.subscription_tier as 'free' | 'premium_monthly' | 'premium_yearly',
        isActive,
        expiresAt: data.subscription_expires_at,
        stripeCustomerId: data.stripe_customer_id
    }
}

/**
 * Record a transaction
 */
export async function recordTransaction(
    userId: string,
    type: 'subscription_monthly' | 'subscription_yearly' | 'heart_pack_5' | 'heart_pack_20',
    amountCents: number,
    stripePaymentId: string,
    stripeSessionId?: string
) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('transactions')
        .insert({
            user_id: userId,
            type,
            amount_cents: amountCents,
            stripe_payment_id: stripePaymentId,
            stripe_session_id: stripeSessionId,
            status: 'completed'
        })
        .select()
        .single()

    if (error) {
        console.error('Error recording transaction:', error)
        return { success: false, error: error.message }
    }

    return { success: true, transaction: data }
}
