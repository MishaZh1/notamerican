"use server"

import { readdir } from "fs/promises"
import { join } from "path"

export async function fetchFlagPairs(): Promise<{ question: string, answer: string, type: 'flag' }[]> {
    try {
        const flagsDir = join(process.cwd(), 'public', 'flags')
        const files = await readdir(flagsDir)

        // Filter for SVGs
        const svgFiles = files.filter(f => f.endsWith('.svg'))

        // Setup Region Names
        const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })

        const pairs = svgFiles.map(file => {
            const code = file.replace('.svg', '').toUpperCase() // "us" -> "US"

            let displayName = code
            try {
                // Try to get real name: "US" -> "United States"
                displayName = regionNames.of(code) || code
            } catch (e) {
                // Fallback if code is weird (like gb-eng)
                displayName = code
            }

            return {
                question: displayName,
                answer: `/flags/${file}`,
                type: 'flag' as const
            }
        })

        // Return random 20
        return pairs.sort(() => 0.5 - Math.random()).slice(0, 20)
    } catch (e) {
        console.error("Error reading flags:", e)
        return []
    }
}
