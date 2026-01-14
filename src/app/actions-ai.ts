"use server"

import { exec } from "child_process"
import { promisify } from "util"
import { Question } from "@/types/game"
import { getAdminSupabase } from "@/lib/supabase-admin"
import fs from "fs/promises"
import path from "path"

const execPromise = promisify(exec)

export async function generateCustomTrivia(category: string, difficulty: number = 3): Promise<Question[]> {
    console.log(`Generating custom trivia for: ${category}`)

    // We'll use a unique temp file for the output
    const outputFileName = `trivia_${Date.now()}_${category.replace(/\s+/g, '_')}.json`
    const outputPath = path.join(process.cwd(), '.tmp', outputFileName)

    try {
        // Ensure .tmp exists
        await fs.mkdir(path.join(process.cwd(), '.tmp'), { recursive: true })

        // Call the Python script
        // Note: In production, python3 path might differ.
        const command = `python3 execution/generate_trivia.py --category "${category}" --difficulty ${difficulty} --count 10 --output "${outputPath}"`
        await execPromise(command)

        // Read the result
        const data = await fs.readFile(outputPath, 'utf8')
        const questions: Question[] = JSON.parse(data)

        // Clean up
        await fs.unlink(outputPath)

        // Optionally: Insert into DB for future use
        const supabase = getAdminSupabase()
        await supabase.from("questions").insert(
            questions.map(q => ({
                ...q,
                is_active: true
            }))
        )

        return questions
    } catch (error) {
        console.error("AI Generation failed:", error)
        throw new Error("Could not generate trivia. Check if Python/OpenAI API is configured.")
    }
}
