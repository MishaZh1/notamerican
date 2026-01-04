import { createClient } from '@supabase/supabase-js'

// Note: This client should ONLY be used in Server Components or Server Actions
// to avoid exposing the service role key to the browser.
export const getAdminSupabase = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}
