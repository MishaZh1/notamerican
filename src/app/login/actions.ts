"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function signInWithEmail(email: string, password: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true }
}

export async function signUpWithEmail(email: string, password: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true }
}

export async function signInWithGoogle() {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    if (data.url) {
        redirect(data.url) // Redirect to Google OAuth
    }

    return { success: true }
}

export async function signOut() {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    redirect("/")
}

export async function getCurrentUser() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    return user
}

export async function getUserProfile(userId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

    if (error) {
        return { error: error.message }
    }

    return { data }
}
