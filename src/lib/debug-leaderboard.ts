
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
    console.error("Missing ENV variables:", { supabaseUrl: !!supabaseUrl, serviceKey: !!serviceKey })
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

async function test() {
    console.log("Testing Admin Client...")

    // 1. Insert Dummy Session
    const dummy = {
        score: 999,
        guest_name: "DebugBot",
        ended_at: new Date().toISOString()
    }

    console.log("Inserting...", dummy)
    const { data: inserted, error: insertError } = await supabase
        .from("quiz_sessions")
        .insert(dummy)
        .select()
        .single()

    if (insertError) {
        console.error("Insert Error:", insertError)
        return
    }
    console.log("Insert Success:", inserted.id)

    // 2. Fetch Leaderboard Query
    console.log("Fetching Leaderboard...")
    const { data: leaderboard, error: fetchError } = await supabase
        .from("quiz_sessions")
        .select(`
            id,
            score,
            guest_name,
            ended_at,
            user:users (
                username,
                display_name,
                avatar_url
            )
        `)
        .order("score", { ascending: false })
        .limit(5)

    if (fetchError) {
        console.error("Fetch Error:", fetchError)
        return
    }

    console.log("Leaderboard Data:", JSON.stringify(leaderboard, null, 2))
}

test()
