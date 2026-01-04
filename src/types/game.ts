export type Question = {
    id: string
    category: string
    difficulty: number
    question_text: string
    answers: string[]
    correct_index: number
    explanation: string
    source_url?: string
    tags?: string[]
}

export type QuizSession = {
    id: string
    score: number
    correct_count: number
    duration_ms: number
    answers_log: {
        question_id: string
        is_correct: boolean
        time_taken: number
    }[]
}
