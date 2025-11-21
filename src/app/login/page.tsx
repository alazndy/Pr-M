'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, Mail, Loader2 } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
    const [loading, setLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true)
            setError('')
            await signInWithGoogle()
            router.push('/projects')
        } catch (err: any) {
            setError(err.message || 'Failed to sign in with Google')
        } finally {
            setLoading(false)
        }
    }

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setLoading(true)
            setError('')

            if (isSignUp) {
                await signUpWithEmail(email, password)
            } else {
                await signInWithEmail(email, password)
            }

            router.push('/projects')
        } catch (err: any) {
            setError(err.message || `Failed to ${isSignUp ? 'sign up' : 'sign in'}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {isSignUp
                            ? 'Sign up to start managing your projects'
                            : 'Sign in to continue to your projects'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Google Sign-In Button */}
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Github className="mr-2 h-4 w-4" />
                        )}
                        Continue with Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with email
                            </span>
                        </div>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                minLength={6}
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Mail className="mr-2 h-4 w-4" />
                            )}
                            {isSignUp ? 'Sign Up' : 'Sign In'}
                        </Button>
                    </form>

                    {/* Toggle Sign Up / Sign In */}
                    <div className="text-center text-sm">
                        {isSignUp ? (
                            <>
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    className="text-primary hover:underline"
                                    onClick={() => {
                                        setIsSignUp(false)
                                        setError('')
                                    }}
                                >
                                    Sign in
                                </button>
                            </>
                        ) : (
                            <>
                                Don't have an account?{' '}
                                <button
                                    type="button"
                                    className="text-primary hover:underline"
                                    onClick={() => {
                                        setIsSignUp(true)
                                        setError('')
                                    }}
                                >
                                    Sign up
                                </button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
