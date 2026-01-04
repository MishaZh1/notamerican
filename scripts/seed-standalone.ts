
import { createClient } from '@supabase/supabase-js'
import { SEED_QUESTIONS } from '../src/lib/questions-data'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

async function main() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hcwqciztjzsvjhkcxhmg.supabase.co"
    // FALLBACK for script execution only
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_secret_Y0pTbwfQp1-9Fk50L5MRHg_JXT6QW_i"

    const supabase = createClient(supabaseUrl, serviceKey)

    console.log(`Seeding ${SEED_QUESTIONS.length} questions...`)

    const { error } = await supabase.from('questions').insert(
        SEED_QUESTIONS.map(q => ({
            ...q,
            is_active: true
        }))
    )

    if (error) {
        console.error("Error seeding:", error)
        process.exit(1)
    }

    console.log("✅ Successfully seeded database!")
}

main()
