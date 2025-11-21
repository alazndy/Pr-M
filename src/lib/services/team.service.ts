import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    onSnapshot,
    Timestamp,
    serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer'
export type MemberStatus = 'active' | 'invited' | 'removed'
export type InvitationStatus = 'pending' | 'accepted' | 'declined'

export interface ProjectMember {
    id: string
    userId: string
    email: string
    displayName: string
    photoURL?: string
    role: MemberRole
    joinedAt: Timestamp
    invitedBy: string
    status: MemberStatus
}

export interface Invitation {
    id: string
    projectId: string
    projectName: string
    invitedBy: string
    invitedByName: string
    invitedEmail: string
    role: Exclude<MemberRole, 'owner'>
    status: InvitationStatus
    createdAt: Timestamp
    expiresAt: Timestamp
}

export class TeamService {
    // Invite a new member to the project
    static async inviteMember(
        projectId: string,
        projectName: string,
        email: string,
        role: Exclude<MemberRole, 'owner'>,
        invitedBy: string,
        invitedByName: string
    ): Promise<string> {
        // Check if user is already a member
        const membersRef = collection(db, 'projects', projectId, 'members')
        const existingMemberQuery = query(membersRef, where('email', '==', email))
        const existingMembers = await getDocs(existingMemberQuery)
        
        if (!existingMembers.empty) {
            throw new Error('User is already a member of this project')
        }

        // Create invitation
        const invitationsRef = collection(db, 'invitations')
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

        const invitation: Omit<Invitation, 'id'> = {
            projectId,
            projectName,
            invitedBy,
            invitedByName,
            invitedEmail: email,
            role,
            status: 'pending',
            createdAt: Timestamp.now(),
            expiresAt: Timestamp.fromDate(expiresAt)
        }

        const docRef = await addDoc(invitationsRef, invitation)
        return docRef.id
    }

    // Accept an invitation
    static async acceptInvitation(
        invitationId: string,
        userId: string,
        userEmail: string,
        displayName: string,
        photoURL?: string
    ): Promise<void> {
        const invitationRef = doc(db, 'invitations', invitationId)
        const invitationDoc = await getDoc(invitationRef)

        if (!invitationDoc.exists()) {
            throw new Error('Invitation not found')
        }

        const invitation = { id: invitationDoc.id, ...invitationDoc.data() } as Invitation

        if (invitation.status !== 'pending') {
            throw new Error('Invitation is no longer valid')
        }

        if (invitation.invitedEmail !== userEmail) {
            throw new Error('This invitation is for a different email address')
        }

        // Check if invitation has expired
        if (invitation.expiresAt.toDate() < new Date()) {
            throw new Error('Invitation has expired')
        }

        // Add user as member
        const membersRef = collection(db, 'projects', invitation.projectId, 'members')
        const member: Omit<ProjectMember, 'id'> = {
            userId,
            email: userEmail,
            displayName,
            photoURL,
            role: invitation.role,
            joinedAt: Timestamp.now(),
            invitedBy: invitation.invitedBy,
            status: 'active'
        }

        await addDoc(membersRef, member)

        // Update invitation status
        await updateDoc(invitationRef, {
            status: 'accepted'
        })
    }

    // Decline an invitation
    static async declineInvitation(invitationId: string): Promise<void> {
        const invitationRef = doc(db, 'invitations', invitationId)
        await updateDoc(invitationRef, {
            status: 'declined'
        })
    }

    // Remove a member from the project
    static async removeMember(projectId: string, memberId: string): Promise<void> {
        const memberRef = doc(db, 'projects', projectId, 'members', memberId)
        await updateDoc(memberRef, {
            status: 'removed'
        })
    }

    // Update member role
    static async updateMemberRole(
        projectId: string,
        memberId: string,
        newRole: MemberRole
    ): Promise<void> {
        const memberRef = doc(db, 'projects', projectId, 'members', memberId)
        await updateDoc(memberRef, {
            role: newRole
        })
    }

    // Get all project members
    static async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
        const membersRef = collection(db, 'projects', projectId, 'members')
        const q = query(membersRef, where('status', '==', 'active'))
        const snapshot = await getDocs(q)
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as ProjectMember))
    }

    // Subscribe to project members
    static subscribeToProjectMembers(
        projectId: string,
        callback: (members: ProjectMember[]) => void
    ): () => void {
        const membersRef = collection(db, 'projects', projectId, 'members')
        const q = query(membersRef, where('status', '==', 'active'))
        
        return onSnapshot(q, (snapshot) => {
            const members = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ProjectMember))
            callback(members)
        })
    }

    // Get user's pending invitations
    static async getUserInvitations(userEmail: string): Promise<Invitation[]> {
        const invitationsRef = collection(db, 'invitations')
        const q = query(
            invitationsRef,
            where('invitedEmail', '==', userEmail),
            where('status', '==', 'pending')
        )
        const snapshot = await getDocs(q)
        
        // Filter out expired invitations
        const now = new Date()
        return snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Invitation))
            .filter(inv => inv.expiresAt.toDate() > now)
    }

    // Subscribe to user's invitations
    static subscribeToUserInvitations(
        userEmail: string,
        callback: (invitations: Invitation[]) => void
    ): () => void {
        const invitationsRef = collection(db, 'invitations')
        const q = query(
            invitationsRef,
            where('invitedEmail', '==', userEmail),
            where('status', '==', 'pending')
        )
        
        return onSnapshot(q, (snapshot) => {
            const now = new Date()
            const invitations = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Invitation))
                .filter(inv => inv.expiresAt.toDate() > now)
            callback(invitations)
        })
    }

    // Check if user is a member of the project
    static async isMember(projectId: string, userId: string): Promise<boolean> {
        const membersRef = collection(db, 'projects', projectId, 'members')
        const q = query(
            membersRef,
            where('userId', '==', userId),
            where('status', '==', 'active')
        )
        const snapshot = await getDocs(q)
        return !snapshot.empty
    }

    // Get user's role in the project
    static async getUserRole(projectId: string, userId: string): Promise<MemberRole | null> {
        const membersRef = collection(db, 'projects', projectId, 'members')
        const q = query(
            membersRef,
            where('userId', '==', userId),
            where('status', '==', 'active')
        )
        const snapshot = await getDocs(q)
        
        if (snapshot.empty) {
            return null
        }
        
        const member = snapshot.docs[0].data() as ProjectMember
        return member.role
    }
}
