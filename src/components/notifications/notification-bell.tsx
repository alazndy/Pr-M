"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationService, type Notification } from "@/lib/services/notification.service"
import { useAuth } from "@/components/auth/AuthProvider"

export function NotificationBell() {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        if (!user) return

        const unsubscribe = NotificationService.subscribeToNotifications(user.uid, (data) => {
            setNotifications(data)
            setUnreadCount(data.filter(n => !n.read).length)
        })

        return () => unsubscribe()
    }, [user])

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No notifications
                    </div>
                ) : (
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                            <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
                                <div className="flex items-center gap-2 w-full">
                                    {!notification.read && (
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                    )}
                                    <span className="text-sm flex-1">{notification.message}</span>
                                </div>
                                <span className="text-xs text-muted-foreground mt-1">
                                    {notification.createdAt?.toDate?.()?.toLocaleString() || 'Just now'}
                                </span>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
