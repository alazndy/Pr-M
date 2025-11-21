import { Bell, Search, Menu, LayoutDashboard, FolderOpen, Settings, Database, Wrench } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import Link from "next/link"
import { cn } from "@/lib/utils"

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: FolderOpen, label: "Files", href: "/files" },
    { icon: Database, label: "Assets", href: "/assets" },
    { icon: Wrench, label: "Tools", href: "/tools" },
    { icon: Settings, label: "Settings", href: "/settings" },
]

export function Header() {
    return (
        <header className="h-16 border-b bg-background px-6 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        <SheetTitle className="p-6 border-b text-xl font-bold tracking-tight">Project Manager</SheetTitle>
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
                    </SheetContent>
                </Sheet>
                <div className="w-full max-w-sm hidden md:block">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search projects..." className="pl-8" />
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                </Button>
            </div>
        </header>
    )
}
