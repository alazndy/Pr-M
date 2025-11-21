import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp,
    onSnapshot,
    Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export type ProjectData = {
    id?: string
    userId: string
    name: string
    description: string
    type: "github" | "manual"
    url?: string
    branch?: string
    language?: string
    createdAt: Date | Timestamp
    updatedAt: Date | Timestamp
    driveFileIds?: string[]
    readme?: {
        projectName?: string
        projectDescription?: string
        installation?: string
        usage?: string
        features?: string
        requirements?: string
        configuration?: string
        contributors?: string
    }
}

export class ProjectsService {
    private static collectionName = 'projects'

    /**
     * Get all projects for a user
     */
    static async getAllProjects(userId: string): Promise<ProjectData[]> {
        const q = query(
            collection(db, this.collectionName),
            where('userId', '==', userId)
        )
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as ProjectData))
    }

    /**
     * Get a single project by ID
     */
    static async getProject(projectId: string): Promise<ProjectData | null> {
        const docRef = doc(db, this.collectionName, projectId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            } as ProjectData
        }
        return null
    }

    /**
     * Create a new project
     */
    static async createProject(
        userId: string,
        projectData: Omit<ProjectData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
    ): Promise<string> {
        const docRef = await addDoc(collection(db, this.collectionName), {
            ...projectData,
            userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        })
        return docRef.id
    }

    /**
     * Update an existing project
     */
    static async updateProject(
        projectId: string,
        projectData: Partial<Omit<ProjectData, 'id' | 'userId' | 'createdAt'>>
    ): Promise<void> {
        const docRef = doc(db, this.collectionName, projectId)
        await updateDoc(docRef, {
            ...projectData,
            updatedAt: serverTimestamp()
        })
    }

    /**
     * Delete a project
     */
    static async deleteProject(projectId: string): Promise<void> {
        const docRef = doc(db, this.collectionName, projectId)
        await deleteDoc(docRef)
    }

    /**
     * Subscribe to real-time updates for user's projects
     */
    static subscribeToProjects(
        userId: string,
        callback: (projects: ProjectData[]) => void
    ): () => void {
        const q = query(
            collection(db, this.collectionName),
            where('userId', '==', userId)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const projects = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ProjectData))
            callback(projects)
        })

        return unsubscribe
    }
}
