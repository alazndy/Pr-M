import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    arrayUnion,
    arrayRemove,
    getDocs
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export interface Subtask {
    id: string
    title: string
    completed: boolean
}

export interface Requirement {
    id: string
    description: string
    met: boolean
}

export interface Task {
    id: string
    projectId: string
    title: string
    description: string
    status: 'todo' | 'in-progress' | 'review' | 'completed'
    priority: 'low' | 'medium' | 'high' | 'critical'
    deadline?: Timestamp
    assignedTo?: string // userId
    assignedToName?: string
    assignedToEmail?: string
    assignedToPhoto?: string
    assignedBy?: string
    assignedAt?: Timestamp
    createdBy: string
    createdAt: Timestamp
    updatedAt: Timestamp
    subtasks: Subtask[]
    requirements: Requirement[]
    progress: number
    estimatedHours?: number
    actualHours?: number
}

export class TasksService {
    private static collectionName = 'tasks'

    static async createTask(
        projectId: string,
        taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks' | 'requirements' | 'progress'>
    ) {
        const collectionRef = collection(db, this.collectionName)
        const docRef = await addDoc(collectionRef, {
            ...taskData,
            projectId,
            subtasks: [],
            requirements: [],
            progress: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        })
        return docRef.id
    }

    static async updateTask(taskId: string, updates: Partial<Task>) {
        const docRef = doc(db, this.collectionName, taskId)
        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        })
    }

    static async deleteTask(taskId: string) {
        const docRef = doc(db, this.collectionName, taskId)
        await deleteDoc(docRef)
    }

    static async getTasksByProject(projectId: string): Promise<Task[]> {
        const q = query(
            collection(db, this.collectionName),
            where('projectId', '==', projectId)
        )
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Task))
    }

    static subscribeToTasks(projectId: string, callback: (tasks: Task[]) => void) {
        const q = query(
            collection(db, this.collectionName),
            where('projectId', '==', projectId)
        )

        return onSnapshot(q, (snapshot) => {
            const tasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Task))
            callback(tasks)
        })
    }

    static async addSubtask(taskId: string, subtask: Omit<Subtask, 'id'>) {
        const newSubtask: Subtask = {
            id: Date.now().toString(),
            ...subtask
        }
        const docRef = doc(db, this.collectionName, taskId)
        await updateDoc(docRef, {
            subtasks: arrayUnion(newSubtask),
            updatedAt: serverTimestamp()
        })
    }

    static async toggleSubtask(taskId: string, subtaskId: string, task: Task) {
        const updatedSubtasks = task.subtasks.map(st =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
        )
        const completedCount = updatedSubtasks.filter(st => st.completed).length
        const progress = updatedSubtasks.length > 0 
            ? Math.round((completedCount / updatedSubtasks.length) * 100)
            : 0

        const docRef = doc(db, this.collectionName, taskId)
        await updateDoc(docRef, {
            subtasks: updatedSubtasks,
            progress,
            updatedAt: serverTimestamp()
        })
    }

    static async removeSubtask(taskId: string, subtaskId: string, task: Task) {
        const updatedSubtasks = task.subtasks.filter(st => st.id !== subtaskId)
        const completedCount = updatedSubtasks.filter(st => st.completed).length
        const progress = updatedSubtasks.length > 0 
            ? Math.round((completedCount / updatedSubtasks.length) * 100)
            : 0

        const docRef = doc(db, this.collectionName, taskId)
        await updateDoc(docRef, {
            subtasks: updatedSubtasks,
            progress,
            updatedAt: serverTimestamp()
        })
    }

    static async addRequirement(taskId: string, requirement: Omit<Requirement, 'id'>) {
        const newRequirement: Requirement = {
            id: Date.now().toString(),
            ...requirement
        }
        const docRef = doc(db, this.collectionName, taskId)
        await updateDoc(docRef, {
            requirements: arrayUnion(newRequirement),
            updatedAt: serverTimestamp()
        })
    }

    static async toggleRequirement(taskId: string, requirementId: string, task: Task) {
        const updatedRequirements = task.requirements.map(req =>
            req.id === requirementId ? { ...req, met: !req.met } : req
        )

        const docRef = doc(db, this.collectionName, taskId)
        await updateDoc(docRef, {
            requirements: updatedRequirements,
            updatedAt: serverTimestamp()
        })
    }

    static async removeRequirement(taskId: string, requirementId: string, task: Task) {
        const updatedRequirements = task.requirements.filter(req => req.id !== requirementId)

        const docRef = doc(db, this.collectionName, taskId)
        await updateDoc(docRef, {
            requirements: updatedRequirements,
            updatedAt: serverTimestamp()
        })
    }

    // Task Assignment Methods
    static async assignTask(
        taskId: string,
        userId: string,
        userName: string,
        userEmail: string,
        userPhoto: string | undefined,
        assignedBy: string
    ) {
        const docRef = doc(db, this.collectionName, taskId)
        await updateDoc(docRef, {
            assignedTo: userId,
            assignedToName: userName,
            assignedToEmail: userEmail,
            assignedToPhoto: userPhoto,
            assignedBy,
            assignedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        })
    }

    static async unassignTask(taskId: string) {
        const docRef = doc(db, this.collectionName, taskId)
        await updateDoc(docRef, {
            assignedTo: null,
            assignedToName: null,
            assignedToEmail: null,
            assignedToPhoto: null,
            assignedBy: null,
            assignedAt: null,
            updatedAt: serverTimestamp()
        })
    }

    static async getMyTasks(userId: string): Promise<Task[]> {
        const q = query(
            collection(db, this.collectionName),
            where('assignedTo', '==', userId)
        )
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Task))
    }

    static async getUnassignedTasks(projectId: string): Promise<Task[]> {
        const q = query(
            collection(db, this.collectionName),
            where('projectId', '==', projectId),
            where('assignedTo', '==', null)
        )
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Task))
    }

    static subscribeToMyTasks(userId: string, callback: (tasks: Task[]) => void) {
        const q = query(
            collection(db, this.collectionName),
            where('assignedTo', '==', userId)
        )

        return onSnapshot(q, (snapshot) => {
            const tasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Task))
            callback(tasks)
        })
    }
}
