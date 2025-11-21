"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FolderOpen, Database, Wrench, Settings, Zap, DollarSign, FolderKanban, LogOut, Sun, Moon } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationBell } from "@/components/notifications/notification-bell"

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: FolderKanban, label: "Projects", href: "/projects" },
    { icon: FolderOpen, label: "Files", href: "/files" },
    { icon: Database, label: "Assets", href: "/assets" },
    { icon: DollarSign, label: "Budget", href: "/budget" },
    { icon: Wrench, label: "Tools", href: "/tools" },
    { icon: Zap, label: "Automations", href: "/automations" },
    { icon: Settings, label: "Settings", href: "/settings" },
]

export function Sidebar() {
    const pathname = usePathname()
    const { user, signOut } = useAuth()
    const { theme, setTheme } = useTheme()

    return (
        <aside className="hidden md:flex w-64 border-r bg-card text-card-foreground h-screen flex-col sticky top-0">
            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between">
                <h1 className="text-xl font-bold tracking-tight text-primary">Project Manager</h1>
                <NotificationBell />
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive 
                                    ? "bg-primary text-primary-foreground shadow-sm" 
                                    : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t space-y-4 bg-muted/10">
                {/* Theme Toggle */}
                <div className="flex items-center justify-between px-2">
                    <span className="text-sm text-muted-foreground font-medium">Theme</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="h-8 w-8 rounded-full"
                    >
                        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </div>

                {/* User Profile & Sign Out */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 border border-border/50">
                    <Avatar className="h-9 w-9 border-2 border-background">
                        <AvatarImage src={user?.photoURL || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                            {user?.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate leading-none mb-1">{user?.displayName || "User"}</p>
                        <p className="text-xs text-muted-foreground truncate leading-none">{user?.email}</p>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                        onClick={() => signOut()}
                        title="Sign Out"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </aside>
    )
}
