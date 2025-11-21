'use client'

import { usePathname, useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        if (!loading) {
            if (!user && pathname !== '/login') {
                router.push('/login')
            } else if (user && pathname === '/login') {
                router.push('/projects')
            }
        }
    }, [user, loading, pathname, router])

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // If on login page, just render children (which is the login form)
    if (pathname === '/login') {
        return <>{children}</>
    }

    // For other pages, require user
    if (!user) {
        return null // Will redirect in useEffect
    }

    // Authenticated layout
    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AuthGuard>{children}</AuthGuard>
        </AuthProvider>
    )
}
