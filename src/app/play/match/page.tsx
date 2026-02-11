"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { MatchingGame } from "@/components/game/MatchingGame"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { CONTINENTS } from "@/lib/data/continent-mapping"
import { TOP_CAPITALS } from "@/lib/data/capitals"
import { cn } from "@/lib/utils"
// Import these for score submission
import { submitGameScore } from "@/app/actions-social"
import { createClient } from "@/lib/supabase/client"

// ... (keep existing imports)
import { canPlayGame, getHeartsForCurrentGame, startGame } from "@/app/actions-hearts"
// ... (existing imports)

// ... (existing state)

const handleGameStart = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const result = await startGame(user?.id || null)

    if (result.success) {
        // Optimistically update local hearts UI if we had it (we use lives/score here, maybe add hearts to header later)
        return true
    }

    if (result.reason === 'out_of_hearts') {
        setModalType('OUT_OF_HEARTS')
        // Fetch time remaining? ideally result includes it, or we rely on re-fetch
        setShowPremiumModal(true)
        return false
    }

    return false
}

return (
    <main className="min-h-screen p-4 bg-background flex flex-col">
        {/* ... (existing Modal and Header) */}

        {loading ? (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
        ) : (
            <MatchingGame
                key={gameKey}
                pairs={filteredPairs}
                onWrongMatch={handleWrongMatch}
                onStartGame={handleGameStart}
                onComplete={(stats) => {
                    setCurrentScore(stats.score)
                    finishGame(stats.score, 'time')
                }}
            />
        )}
    </main>
)
}
