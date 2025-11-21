"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TeamService, type Invitation } from "@/lib/services/team.service"
import { Mail, Check, X, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { Badge } from "@/components/ui/badge"

export function InvitationsDropdown() {
    const { user } = useAuth()
    const [invitations, setInvitations] = useState<Invitation[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)

    useEffect(() => {
        if (!user?.email) return

        const unsubscribe = TeamService.subscribeToUserInvitations(user.email, (invites) => {
            setInvitations(invites)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [user?.email])

    const handleAccept = async (invitation: Invitation) => {
        if (!user || !user.email) return
        setProcessingId(invitation.id)
        try {
            await TeamService.acceptInvitation(
                invitation.id,
                user.uid,
                user.email,
                user.displayName || user.email.split('@')[0],
                user.photoURL || undefined
            )
            // Invitation will be removed from list automatically via subscription
        } catch (error) {
            console.error("Failed to accept invitation:", error)
            alert("Failed to accept invitation")
        } finally {
            setProcessingId(null)
        }
    }

    const handleDecline = async (invitationId: string) => {
        setProcessingId(invitationId)
        try {
            await TeamService.declineInvitation(invitationId)
        } catch (error) {
            console.error("Failed to decline invitation:", error)
            alert("Failed to decline invitation")
        } finally {
            setProcessingId(null)
        }
    }

    if (!user) return null

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Mail className="h-5 w-5" />
                    {invitations.length > 0 && (
                        <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
                        >
                            {invitations.length}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Invitations</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {loading ? (
                    <div className="p-4 flex justify-center">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                ) : invitations.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No pending invitations
                    </div>
                ) : (
                    <div className="max-h-[300px] overflow-y-auto">
                        {invitations.map((invitation) => (
                            <div key={invitation.id} className="p-3 border-b last:border-0">
                                <div className="flex flex-col gap-1 mb-2">
                                    <span className="font-medium text-sm">
                                        Join {invitation.projectName}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Invited by {invitation.invitedByName} as {invitation.role}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        size="sm" 
                                        className="flex-1 h-8" 
                                        onClick={() => handleAccept(invitation)}
                                        disabled={!!processingId}
                                    >
                                        {processingId === invitation.id ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            <>
                                                <Check className="mr-1 h-3 w-3" /> Accept
                                            </>
                                        )}
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="flex-1 h-8"
                                        onClick={() => handleDecline(invitation.id)}
                                        disabled={!!processingId}
                                    >
                                        <X className="mr-1 h-3 w-3" /> Decline
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
