import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface AssigneeAvatarProps {
    name?: string | null
    email?: string | null
    photoUrl?: string | null
    className?: string
    showName?: boolean
}

export function AssigneeAvatar({ name, email, photoUrl, className, showName = false }: AssigneeAvatarProps) {
    if (!name && !email) return null

    const displayName = name || email?.split('@')[0] || 'User'
    const initials = displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Avatar className="h-6 w-6">
                <AvatarImage src={photoUrl || undefined} alt={displayName} />
                <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
            </Avatar>
            {showName && <span className="text-sm text-muted-foreground">{displayName}</span>}
        </div>
    )
}
