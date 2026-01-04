'use server'

import { getAdminSupabase } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"
import { Question } from "@/types/game"

export async function createQuestion(formData: FormData) {
    const supabase = getAdminSupabase()

    const question = {
        category: formData.get("category"),
        difficulty: parseInt(formData.get("difficulty") as string),
        question_text: formData.get("question_text"),
        answers: [
            formData.get("answer_0"),
            formData.get("answer_1"),
            formData.get("answer_2"),
            formData.get("answer_3"),
        ],
        correct_index: parseInt(formData.get("correct_index") as string),
        explanation: formData.get("explanation"),
        is_active: true
    }

    const { error } = await supabase.from("questions").insert(question)

    if (error) {
        console.error("Error creating question:", error)
        return { error: error.message }
    }

    revalidatePath("/admin")
    return { success: true }
}

import { SEED_QUESTIONS } from "@/lib/questions-data"

export async function seedQuestions() {
    const supabase = getAdminSupabase()

    // Optional: Delete existing to avoid dupes if running multiple times?
    // For safety, let's just insert.

    const { error } = await supabase.from("questions").insert(
        SEED_QUESTIONS.map(q => ({
            ...q,
            is_active: true
        }))
    )

    if (error) {
        console.error("Error seeding questions:", error)
        return { error: error.message }
    }

    revalidatePath("/admin")
    return { success: true, count: SEED_QUESTIONS.length }
}

export async function fetchQuestions(category?: string): Promise<Question[]> {
    const supabase = getAdminSupabase()

    let query = supabase
        .from("questions")
        .select("*")
        .eq("is_active", true)

    if (category && category !== "All") {
        query = query.eq("category", category)
    }

    let { data, error } = await query

    if (error) {
        console.error("Error fetching questions:", error)
        return []
    }

    // AUTO-GENERATION / REFILL LOGIC
    // Only if generalized
    if ((!data || data.length < 5) && (!category || category === "All")) {
        console.log("Low question count detected. Auto-generating more...")
        await seedQuestions()
        const res = await supabase.from("questions").select("*").eq("is_active", true)
        data = res.data
    }

    if (!data) return []

    // Create a copy to sort (Shuffle)
    const shuffled = [...data].sort(() => 0.5 - Math.random())
    // Return a batch of 10
    return shuffled.slice(0, 10) as Question[]
}

export async function fetchCategories(): Promise<string[]> {
    const supabase = getAdminSupabase()
    const { data } = await supabase.from("questions").select("category")
    if (!data) return ["All"]
    const unique = Array.from(new Set(data.map(q => q.category)))
    return ["All", ...unique.sort()]
}

export async function fetchMatchingPairs(): Promise<{ question: string, answer: string }[]> {
    const supabase = getAdminSupabase()
    // Fetch all active
    const { data } = await supabase.from("questions").select("*").eq("is_active", true)
    if (!data) return []

    // Filter in JS for "Short" questions (approx 2-5 words or < 50 chars)
    const shortOnes = data.filter(q => q.question_text.length < 60)

    const pairs = shortOnes.map(q => ({
        // Simplify text
        question: q.question_text
            .replace(/^(What is|Who is|Which is|The|A) /i, '')
            .replace(/\?$/, ''),
        answer: q.answers[q.correct_index]
    }))

    return pairs.sort(() => 0.5 - Math.random()).slice(0, 20)
}
