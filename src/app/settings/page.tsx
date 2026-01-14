
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Shield, FileText, Trash2, LogOut } from 'lucide-react'
import { signOut } from '../login/actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-slate-50 p-4 pb-20">
            <header className="flex items-center gap-4 mb-6">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-black text-slate-800">Settings</h1>
            </header>

            <div className="space-y-6 max-w-lg mx-auto">
                <Card className="border-b-4 border-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" /> Privacy & Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-slate-100 rounded-lg text-sm text-slate-600">
                            <p className="font-bold mb-2">Data Privacy</p>
                            <p>We take your privacy seriously. Your data is stored securely and never sold to third parties. We use industry-standard encryption to protect your personal information.</p>
                        </div>
                        <Button variant="outline" className="w-full justify-start text-slate-600 font-bold">
                            Review Privacy Policy
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-b-4 border-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" /> Legal
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="ghost" className="w-full justify-start text-slate-600">
                            Terms of Service
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-slate-600">
                            Community Guidelines
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-b-4 border-slate-200 border-red-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="w-5 h-5" /> Danger Zone
                        </CardTitle>
                        <CardDescription>
                            Irreversible actions for your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive" className="w-full font-bold">
                            Delete Account
                        </Button>
                    </CardContent>
                </Card>

                <form action={signOut}>
                    <Button variant="outline" className="w-full h-14 border-2 border-slate-200 text-slate-500 font-bold flex items-center gap-2 hover:bg-slate-100 hover:text-slate-700">
                        <LogOut className="w-5 h-5" /> Log Out
                    </Button>
                </form>

                <div className="text-center text-xs text-slate-400 font-mono pt-4">
                    NOTE MERICAN v0.1.0 (Beta)
                </div>
            </div>
        </div>
    )
}
