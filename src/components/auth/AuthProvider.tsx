'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
    User,
    onAuthStateChanged,
    signInWithPopup,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from 'firebase/auth'
import { auth } from '@/lib/firebase/config'

type AuthContextType = {
    user: User | null
    loading: boolean
    githubToken: string | null
    signInWithGoogle: () => Promise<void>
    signInWithGithub: () => Promise<void>
    signInWithEmail: (email: string, password: string) => Promise<void>
    signUpWithEmail: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [githubToken, setGithubToken] = useState<string | null>(null)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user)
            setLoading(false)
        })

        return unsubscribe
    }, [])

    const handleSignInWithGoogle = async () => {
        const provider = new GoogleAuthProvider()
        // Add Google Drive scope for file access
        provider.addScope('https://www.googleapis.com/auth/drive.file')
        await signInWithPopup(auth, provider)
    }

    const handleSignInWithGithub = async () => {
        const provider = new GithubAuthProvider()
        provider.addScope('repo') // Request access to private repos if needed
        const result = await signInWithPopup(auth, provider)
        const credential = GithubAuthProvider.credentialFromResult(result)
        if (credential?.accessToken) {
            setGithubToken(credential.accessToken)
            // Persist token to localStorage
            localStorage.setItem('github_token', credential.accessToken)
        }
    }

    const handleSignInWithEmail = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password)
    }

    const handleSignUpWithEmail = async (email: string, password: string) => {
        await createUserWithEmailAndPassword(auth, email, password)
    }

    const handleSignOut = async () => {
        await firebaseSignOut(auth)
        setGithubToken(null)
        // Clear token from localStorage
        localStorage.removeItem('github_token')
    }

    // Load GitHub token from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('github_token')
        if (storedToken) {
            setGithubToken(storedToken)
        }
    }, [])

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                githubToken,
                signInWithGoogle: handleSignInWithGoogle,
                signInWithGithub: handleSignInWithGithub,
                signInWithEmail: handleSignInWithEmail,
                signUpWithEmail: handleSignUpWithEmail,
                signOut: handleSignOut
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
