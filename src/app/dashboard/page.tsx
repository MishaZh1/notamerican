import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardClient from "./DashboardClient"

export default async function DashboardPage() {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()

    // Fetch user's quiz sessions
    const { data: sessions } = await supabase
        .from("quiz_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(10)

    return <DashboardClient user={user} profile={profile} sessions={sessions || []} />
}
