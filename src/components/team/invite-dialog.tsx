"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { TeamService, type MemberRole } from "@/lib/services/team.service"
import { Loader2, Mail } from "lucide-react"

interface InviteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projectId: string
    projectName: string
    currentUserId: string
    currentUserName: string
}

export function InviteDialog({
    open,
    onOpenChange,
    projectId,
    projectName,
    currentUserId,
    currentUserName
}: InviteDialogProps) {
    const [email, setEmail] = useState("")
    const [role, setRole] = useState<Exclude<MemberRole, 'owner'>>("member")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleInvite = async () => {
        if (!email) {
            setError("Please enter an email address")
            return
        }

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setError("Please enter a valid email address")
            return
        }

        setLoading(true)
        setError("")

        try {
            await TeamService.inviteMember(
                projectId,
                projectName,
                email,
                role,
                currentUserId,
                currentUserName
            )
            
            setEmail("")
            setRole("member")
            onOpenChange(false)
            alert(`Invitation sent to ${email}`)
        } catch (err: any) {
            setError(err.message || "Failed to send invitation")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                        Send an invitation to join {projectName}. They'll receive an email with a link to accept.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <div className="relative">
                            <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="colleague@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-8"
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="role">Role *</Label>
                        <Select value={role} onValueChange={(value) => setRole(value as Exclude<MemberRole, 'owner'>)} disabled={loading}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">
                                    <div>
                                        <div className="font-medium">Admin</div>
                                        <div className="text-xs text-muted-foreground">Can manage members and settings</div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="member">
                                    <div>
                                        <div className="font-medium">Member</div>
                                        <div className="text-xs text-muted-foreground">Can create and edit tasks</div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="viewer">
                                    <div>
                                        <div className="font-medium">Viewer</div>
                                        <div className="text-xs text-muted-foreground">Can only view project</div>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {error && (
                        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                            {error}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleInvite} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Invitation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
