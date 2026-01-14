'use client'

import { useActionState, useState } from 'react'
import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label' // Assuming Label exists, if not I'll use standard label
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Loader2, ArrowLeft } from 'lucide-react'

// Mock Label component if it doesn't exist in ui folder, but usually it does with shadcn.
// Checking `ls` indicated it might NOT exist (only avatar, button, card, input, progress).
// So I will use standard html label with classes.

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [loginState, loginAction, isLoginPending] = useActionState(login, null)
    const [signupState, signupAction, isSignupPending] = useActionState(signup, null)

    const toggleMode = () => setIsLogin(!isLogin)

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative">
            <div className="absolute top-4 left-4">
                <Link href="/">
                    <Button variant="ghost" className="text-slate-500 font-bold hover:bg-slate-200">
                        <ArrowLeft className="mr-2 w-4 h-4" /> Back
                    </Button>
                </Link>
            </div>
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-black text-primary tracking-tighter mb-2">NOTA MERICAN 🌍</h1>
                    <p className="text-muted-foreground">The world is bigger than you think.</p>
                </div>

                <Card className="border-b-4 border-slate-200 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">
                            {isLogin ? 'Welcome Back!' : 'Create Profile'}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {isLogin
                                ? 'Enter your credentials to continue.'
                                : 'Join the global leaderboard today.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AnimatePresence mode="wait">
                            {isLogin ? (
                                <motion.form
                                    key="login-form"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    action={loginAction}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <label htmlFor="email-login" className="text-sm font-bold text-slate-700">Email</label>
                                        <Input id="email-login" name="email" type="email" placeholder="hello@example.com" required className="bg-slate-50 border-2 focus-visible:ring-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="password-login" className="text-sm font-bold text-slate-700">Password</label>
                                        <Input id="password-login" name="password" type="password" required className="bg-slate-50 border-2 focus-visible:ring-primary" />
                                    </div>

                                    {loginState?.error && (
                                        <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                                            {loginState.error}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full btn-3d-primary h-12"
                                        disabled={isLoginPending}
                                    >
                                        {isLoginPending ? <Loader2 className="animate-spin mr-2" /> : 'LOG IN'}
                                    </Button>
                                </motion.form>
                            ) : (
                                <motion.form
                                    key="signup-form"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    action={signupAction}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <label htmlFor="name-signup" className="text-sm font-bold text-slate-700">Display Name</label>
                                        <Input id="name-signup" name="name" type="text" placeholder="Global Explorer" required className="bg-slate-50 border-2 focus-visible:ring-secondary" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email-signup" className="text-sm font-bold text-slate-700">Email</label>
                                        <Input id="email-signup" name="email" type="email" placeholder="hello@example.com" required className="bg-slate-50 border-2 focus-visible:ring-secondary" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="password-signup" className="text-sm font-bold text-slate-700">Password</label>
                                        <Input id="password-signup" name="password" type="password" required className="bg-slate-50 border-2 focus-visible:ring-secondary" />
                                    </div>

                                    {signupState?.error && (
                                        <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                                            {signupState.error}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full btn-3d-secondary h-12"
                                        disabled={isSignupPending}
                                    >
                                        {isSignupPending ? <Loader2 className="animate-spin mr-2" /> : 'CREATE_ACCOUNT'}
                                    </Button>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        <div className="relative w-full my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-muted-foreground font-bold">
                                    Continue with
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                variant="outline"
                                className="w-full h-12 font-bold text-slate-600 border-2 border-slate-200 hover:bg-slate-50 flex items-center gap-3"
                                onClick={() => {
                                    import('@/lib/supabase/client').then(async ({ createClient }) => {
                                        const supabase = createClient()
                                        await supabase.auth.signInWithOAuth({
                                            provider: 'google',
                                            options: {
                                                redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
                                            }
                                        })
                                    })
                                }}
                            >
                                <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                Google
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full h-12 font-bold text-slate-600 border-2 border-slate-200 hover:bg-slate-50 flex items-center gap-3"
                                onClick={() => {
                                    import('@/lib/supabase/client').then(async ({ createClient }) => {
                                        const supabase = createClient()
                                        await supabase.auth.signInWithOAuth({
                                            provider: 'facebook',
                                            options: {
                                                redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
                                            }
                                        })
                                    })
                                }}
                            >
                                <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0 text-[#1877F2] fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                Facebook
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full h-12 font-bold text-slate-600 border-2 border-slate-200 hover:bg-slate-50 flex items-center gap-3"
                                onClick={() => {
                                    import('@/lib/supabase/client').then(async ({ createClient }) => {
                                        const supabase = createClient()
                                        await supabase.auth.signInWithOAuth({
                                            provider: 'apple',
                                            options: {
                                                redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
                                            }
                                        })
                                    })
                                }}
                            >
                                <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0 text-black fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.127 3.688-.543 9.13 1.516 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.403-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" /></svg>
                                Apple
                            </Button>
                        </div>

                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <div className="relative w-full">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-muted-foreground font-bold">
                                    OR
                                </span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                            onClick={toggleMode}
                        >
                            {isLogin ? "I don't have an account" : "I already have an account"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
