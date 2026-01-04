"use client"

import { useState } from "react"
import { createQuestion, seedQuestions } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, CheckCircle, AlertCircle, Database } from "lucide-react"

export default function AdminPage() {
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    async function handleSeed() {
        if (!confirm("Are you sure you want to add sample questions?")) return
        setLoading(true)
        const res = await seedQuestions()
        setLoading(false)
        if (res?.error) {
            setMsg({ type: 'error', text: res.error })
        } else {
            setMsg({ type: 'success', text: `Added ${res.count} questions!` })
        }
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setMsg(null)

        // Validate that answers are filled (basic check)
        // Server action handles the database insert
        const res = await createQuestion(formData)

        setLoading(false)
        if (res?.error) {
            setMsg({ type: 'error', text: res.error })
        } else {
            setMsg({ type: 'success', text: "Question created successfully!" })
            // Optional: Reset form here
            // (e.target as HTMLFormElement).reset() 
        }
    }

    return (
        <main className="min-h-screen p-8 bg-background max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black tracking-tighter">Admin Panel</h1>
                <Button variant="outline" onClick={handleSeed} disabled={loading} className="gap-2">
                    <Database className="w-4 h-4" />
                    Seed DB (Dev)
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Add New Question</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <input name="category" required placeholder="e.g. History" className="w-full p-2 rounded-md bg-secondary text-secondary-foreground" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Difficulty (1-5)</label>
                                <input name="difficulty" type="number" min="1" max="5" defaultValue="1" required className="w-full p-2 rounded-md bg-secondary text-secondary-foreground" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Question Text</label>
                            <textarea name="question_text" required rows={3} className="w-full p-2 rounded-md bg-secondary text-secondary-foreground" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[0, 1, 2, 3].map((i) => (
                                <div key={i} className="space-y-2">
                                    <label className="text-sm font-medium">Answer Option {String.fromCharCode(65 + i)}</label>
                                    <input name={`answer_${i}`} required className="w-full p-2 rounded-md bg-secondary text-secondary-foreground" />
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Correct Answer</label>
                            <select name="correct_index" className="w-full p-2 rounded-md bg-secondary text-secondary-foreground">
                                <option value="0">Option A</option>
                                <option value="1">Option B</option>
                                <option value="2">Option C</option>
                                <option value="3">Option D</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Explanation</label>
                            <textarea name="explanation" required rows={2} className="w-full p-2 rounded-md bg-secondary text-secondary-foreground" />
                        </div>

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Create Question
                        </Button>

                        {msg && (
                            <div className={`p-4 rounded-md flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {msg.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                                {msg.text}
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>

        </main>
    )
}
