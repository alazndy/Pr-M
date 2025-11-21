"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FolderOpen, Database, Wrench, Settings, Zap, DollarSign, FolderKanban } from "lucide-react"

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
    return (
        <aside className="hidden md:flex w-64 border-r bg-card text-card-foreground h-screen flex-col sticky top-0">
            <div className="p-6 border-b">
                <h1 className="text-xl font-bold tracking-tight">Project Manager</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {sidebarItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            "hover:bg-accent hover:text-accent-foreground",
                            "text-muted-foreground"
                        )}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10" />
                    <div className="text-sm">
                        <p className="font-medium">User Name</p>
                        <p className="text-xs text-muted-foreground">Admin</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
