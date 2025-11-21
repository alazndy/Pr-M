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
    getDocs
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export interface Equipment {
    id: string
    projectId: string
    name: string
    description?: string
    category: string
    quantity: number
    status: 'available' | 'in-use' | 'maintenance' | 'unavailable'
    location?: string
    purchaseDate?: Timestamp
    cost?: number
    notes?: string
    createdAt: Timestamp
    updatedAt: Timestamp
}

export class EquipmentService {
    private static collectionName = 'equipment'

    static async createEquipment(
        projectId: string,
        equipmentData: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>
    ) {
        const collectionRef = collection(db, this.collectionName)
        const docRef = await addDoc(collectionRef, {
            ...equipmentData,
            projectId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        })
        return docRef.id
    }

    static async updateEquipment(equipmentId: string, updates: Partial<Equipment>) {
        const docRef = doc(db, this.collectionName, equipmentId)
        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        })
    }

    static async deleteEquipment(equipmentId: string) {
        const docRef = doc(db, this.collectionName, equipmentId)
        await deleteDoc(docRef)
    }

    static async getEquipmentByProject(projectId: string): Promise<Equipment[]> {
        const q = query(
            collection(db, this.collectionName),
            where('projectId', '==', projectId)
        )
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Equipment))
    }

    static subscribeToEquipment(projectId: string, callback: (equipment: Equipment[]) => void) {
        const q = query(
            collection(db, this.collectionName),
            where('projectId', '==', projectId)
        )

        return onSnapshot(q, (snapshot) => {
            const equipment = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Equipment))
            callback(equipment)
        })
    }
}
