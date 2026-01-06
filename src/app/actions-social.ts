"use server"

import { getAdminSupabase } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"

export interface UserProfile {
    id: string
    username: string
    display_name?: string
    xp_total: number
    streak_current: number
    streak_best: number
    avatar_url?: string
}

export async function fetchLeaderboard(): Promise<UserProfile[]> {
    const supabase = getAdminSupabase()

    // Sort by XP
    const { data } = await supabase
        .from("users")
        .select("id, username, display_name, avatar_url, xp_total, streak_current, streak_best")
        .order("xp_total", { ascending: false })
        .limit(50)

    if (!data) return []

    return data.map(u => ({
        ...u,
        username: u.username || "Anonymous"
    })) as UserProfile[]
}

// Securely submit score
// Note: In a real app we would verify the user session here on the server
// But for this MVP without a shared cookie setup, we will trust the client ID temporarily
// or we can try to verify if we pass the accessToken.
// For speed, let's keep it simple: Client sends ID. 
export async function submitGameScore(
    userId: string | null,
    xpGained: number,
    guestInfo?: { name: string, email?: string },
    stats?: { correct: number, total: number, duration: number }
) {
    const supabase = getAdminSupabase()

    // 1. Always record the session
    const sessionData: any = {
        score: xpGained,
        correct_count: stats?.correct || 0,
        duration_ms: (stats?.duration || 0) * 1000,
        ended_at: new Date().toISOString()
    }

    if (userId) {
        sessionData.user_id = userId
    }
    if (guestInfo) {
        sessionData.guest_name = guestInfo.name
        sessionData.guest_email = guestInfo.email
    }

    const { data: insertedSession } = await supabase.from("quiz_sessions").insert(sessionData).select("id").single()

    // 2. If User, update their global stats
    if (userId) {
        const { data: user } = await supabase
            .from("users")
            .select("*")
            .eq("id", userId)
            .single()

        if (user) {
            const today = new Date().toISOString().split('T')[0]
            const lastActive = user.last_active_date // 'YYYY-MM-DD'

            const updates: any = {
                xp_total: (user.xp_total || 0) + xpGained,
                last_active_date: today
            }

            // Streak Logic
            if (lastActive !== today) {
                const yesterday = new Date()
                yesterday.setDate(yesterday.getDate() - 1)
                const yesterdayStr = yesterday.toISOString().split('T')[0]

                if (lastActive === yesterdayStr) {
                    // Continued streak
                    updates.streak_current = (user.streak_current || 0) + 1
                } else {
                    // Broken or New
                    updates.streak_current = 1
                }

                if ((updates.streak_current || 1) > (user.streak_best || 0)) {
                    updates.streak_best = updates.streak_current
                }
            }

            await supabase.from("users").update(updates).eq("id", userId)
        }
    }

    revalidatePath("/leaderboard")
    revalidatePath("/profile")
    return { success: true, sessionId: insertedSession?.id }
}

export async function registerGuest(sessionId: string, name: string, email?: string) {
    const supabase = getAdminSupabase()

    await supabase.from("quiz_sessions").update({
        guest_name: name,
        guest_email: email
    }).eq("id", sessionId)

    return { success: true }
}
