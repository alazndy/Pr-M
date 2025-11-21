"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { TeamService, type ProjectMember, type MemberRole } from "@/lib/services/team.service"
import { UserPlus, Crown, Shield, User, Eye, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TeamListProps {
    projectId: string
    currentUserId: string
    currentUserRole: MemberRole
    onInviteClick: () => void
}

export function TeamList({ projectId, currentUserId, currentUserRole, onInviteClick }: TeamListProps) {
    const [members, setMembers] = useState<ProjectMember[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = TeamService.subscribeToProjectMembers(projectId, (updatedMembers) => {
            setMembers(updatedMembers)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [projectId])

    const handleRoleChange = async (memberId: string, newRole: MemberRole) => {
        try {
            await TeamService.updateMemberRole(projectId, memberId, newRole)
        } catch (error) {
            console.error("Failed to update role:", error)
            alert("Failed to update member role")
        }
    }

    const handleRemoveMember = async (memberId: string, memberName: string) => {
        if (!confirm(`Are you sure you want to remove ${memberName} from this project?`)) {
            return
        }

        try {
            await TeamService.removeMember(projectId, memberId)
        } catch (error) {
            console.error("Failed to remove member:", error)
            alert("Failed to remove member")
        }
    }

    const getRoleIcon = (role: MemberRole) => {
        switch (role) {
            case 'owner':
                return <Crown className="h-4 w-4 text-yellow-500" />
            case 'admin':
                return <Shield className="h-4 w-4 text-blue-500" />
            case 'member':
                return <User className="h-4 w-4 text-green-500" />
            case 'viewer':
                return <Eye className="h-4 w-4 text-gray-500" />
        }
    }

    const getRoleBadgeColor = (role: MemberRole) => {
        switch (role) {
            case 'owner':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            case 'admin':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            case 'member':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            case 'viewer':
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        }
    }

    const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin'
    const canChangeRole = (memberRole: MemberRole) => {
        if (currentUserRole === 'owner') return true
        if (currentUserRole === 'admin' && memberRole !== 'owner') return true
        return false
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <div className="text-muted-foreground">Loading team members...</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>
                        {members.length} {members.length === 1 ? 'member' : 'members'}
                    </CardDescription>
                </div>
                {canManageMembers && (
                    <Button onClick={onInviteClick}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite Member
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {members.length === 0 ? (
                    <div className="text-center py-12">
                        <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">No team members yet</p>
                        <p className="text-sm text-muted-foreground">
                            Invite team members to collaborate on this project
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <Avatar>
                                        <AvatarImage src={member.photoURL} />
                                        <AvatarFallback>
                                            {member.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium truncate">{member.displayName}</p>
                                            {member.userId === currentUserId && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Joined {member.joinedAt.toDate().toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {canChangeRole(member.role) && member.userId !== currentUserId ? (
                                        <Select
                                            value={member.role}
                                            onValueChange={(value) => handleRoleChange(member.id, value as MemberRole)}
                                        >
                                            <SelectTrigger className="w-[130px]">
                                                <div className="flex items-center gap-2">
                                                    {getRoleIcon(member.role)}
                                                    <SelectValue />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {currentUserRole === 'owner' && (
                                                    <SelectItem value="owner">
                                                        <div className="flex items-center gap-2">
                                                            <Crown className="h-4 w-4" />
                                                            Owner
                                                        </div>
                                                    </SelectItem>
                                                )}
                                                <SelectItem value="admin">
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="h-4 w-4" />
                                                        Admin
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="member">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4" />
                                                        Member
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="viewer">
                                                    <div className="flex items-center gap-2">
                                                        <Eye className="h-4 w-4" />
                                                        Viewer
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium",
                                            getRoleBadgeColor(member.role)
                                        )}>
                                            {getRoleIcon(member.role)}
                                            <span className="capitalize">{member.role}</span>
                                        </div>
                                    )}
                                    {canManageMembers && member.userId !== currentUserId && member.role !== 'owner' && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveMember(member.id, member.displayName)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
