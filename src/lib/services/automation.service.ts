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
    increment
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export interface AutomationTrigger {
    type: 'time' | 'event' | 'file'
    config: string
}

export interface AutomationAction {
    type: 'notification' | 'email' | 'file'
    config: string
}

export interface Automation {
    id: string
    name: string
    description?: string
    enabled: boolean
    trigger: AutomationTrigger
    actions: AutomationAction[]
    userId: string
    createdAt: Timestamp
    updatedAt: Timestamp
    lastRun?: Timestamp
    runsCount: number
    status: 'success' | 'failed' | 'never'
}

export class AutomationService {
    private static collectionName = 'automations'

    static async createAutomation(automation: Omit<Automation, 'id' | 'createdAt' | 'updatedAt' | 'runsCount' | 'status'>) {
        const collectionRef = collection(db, this.collectionName)
        const docRef = await addDoc(collectionRef, {
            ...automation,
            runsCount: 0,
            status: 'never',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        })
        return docRef.id
    }

    static async updateAutomation(id: string, updates: Partial<Automation>) {
        const docRef = doc(db, this.collectionName, id)
        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        })
    }

    static async deleteAutomation(id: string) {
        const docRef = doc(db, this.collectionName, id)
        await deleteDoc(docRef)
    }

    static subscribeToAutomations(userId: string, callback: (automations: Automation[]) => void) {
        const q = query(
            collection(db, this.collectionName),
            where('userId', '==', userId)
        )

        return onSnapshot(q, (snapshot) => {
            const automations = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Automation))
            callback(automations)
        })
    }

    static async logRun(id: string, status: 'success' | 'failed') {
        const docRef = doc(db, this.collectionName, id)
        await updateDoc(docRef, {
            lastRun: serverTimestamp(),
            status,
            runsCount: increment(1)
        })
    }
}
