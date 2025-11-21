import { 
    collection, 
    addDoc, 
    query, 
    where, 
    onSnapshot,
    serverTimestamp,
    Timestamp,
    orderBy,
    limit
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export interface Notification {
    id: string
    userId: string
    message: string
    read: boolean
    createdAt: Timestamp
    type: 'info' | 'success' | 'warning' | 'error'
}

export class NotificationService {
    private static collectionName = 'notifications'
    private static mailQueueName = 'mail_queue'

    /**
     * Send an in-app notification to a user
     */
    static async sendInAppNotification(userId: string, message: string, type: Notification['type'] = 'info') {
        const collectionRef = collection(db, this.collectionName)
        await addDoc(collectionRef, {
            userId,
            message,
            read: false,
            type,
            createdAt: serverTimestamp()
        })
    }

    /**
     * Queue an email to be sent by a backend trigger
     */
    static async queueEmail(to: string, subject: string, body: string) {
        const collectionRef = collection(db, this.mailQueueName)
        await addDoc(collectionRef, {
            to,
            message: {
                subject,
                text: body,
                html: body // Simple text-to-html for now
            },
            createdAt: serverTimestamp(),
            status: 'pending'
        })
    }

    /**
     * Subscribe to user's notifications
     */
    static subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
        const q = query(
            collection(db, this.collectionName),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(50)
        )

        return onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Notification))
            callback(notifications)
        })
    }
}
