import { auth } from '@/lib/firebase/config'

declare global {
    var google: any
}

export class DriveService {
    private static gapiLoaded = false
    private static initializationPromise: Promise<void> | null = null
    private static tokenClient: any = null



    static async init() {
        if (this.initializationPromise) {
            return this.initializationPromise
        }

        this.initializationPromise = (async () => {
            // Check if credentials are available
            const clientId = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY

            if (!clientId || !apiKey) {
                console.warn('Google Drive API credentials not configured. File browser will be disabled.')
                console.warn('To enable Google Drive integration, add the following to your .env.local file:')
                console.warn('NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID=your_client_id')
                console.warn('NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY=your_api_key')
                this.gapiLoaded = false
                return
            }

            // Load GAPI script if not already loaded
            if (typeof gapi === 'undefined') {
                await new Promise<void>((resolve) => {
                    const script = document.createElement('script')
                    script.src = 'https://apis.google.com/js/api.js'
                    script.onload = () => resolve()
                    document.body.appendChild(script)
                })
            }

            // Load GSI script (for token client) if not already loaded
            if (typeof google === 'undefined') {
                 await new Promise<void>((resolve) => {
                    const script = document.createElement('script')
                    script.src = 'https://accounts.google.com/gsi/client'
                    script.onload = () => resolve()
                    document.body.appendChild(script)
                })
            }

            await new Promise<void>((resolve) => {
                gapi.load('client:picker', async () => {
                    await gapi.client.init({
                        apiKey: apiKey,
                        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
                    })
                    resolve()
                })
            })
            
            // Initialize Token Client
            // @ts-ignore
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: 'https://www.googleapis.com/auth/drive.file',
                callback: '', // Defined at request time
            });
            
            this.gapiLoaded = true
        })()

        return this.initializationPromise
    }
    
    private static async getAccessToken(): Promise<string> {
        // Since we are using Firebase Auth with Google, we might already have a token.
        // However, for Drive API calls directly from the client using GAPI, 
        // we often need to request a fresh access token if the Firebase one isn't sufficient or compatible for GAPI calls directly.
        // BUT, since we added the scope to Firebase Auth, we can try to get the token from the current user.
        
        const user = auth.currentUser;
        if (user) {
            // This gets the Firebase Auth token, which is NOT the Google Access Token for Drive.
            // To get the Google Access Token, we typically need to use the credential from the sign-in result.
            // But that is only available at sign-in time.
            // For persistent access, we should use the GSI Token Client to request an access token.
            // This will trigger a popup if needed, or silently succeed if authorized.
            
            return new Promise((resolve, reject) => {
                this.tokenClient.callback = (resp: any) => {
                    if (resp.error !== undefined) {
                        reject(resp);
                    }
                    resolve(resp.access_token);
                };
                this.tokenClient.requestAccessToken({ prompt: '' });
            });
        }
        throw new Error("User not authenticated");
    }

    // Alias for compatibility with FileBrowser
    static async createProjectFolder(projectId: string): Promise<string> {
        await this.init()
        const accessToken = await this.getAccessToken()
        return this.getOrCreateProjectFolder(projectId, accessToken)
    }

    static async uploadFile(file: File, folderId: string): Promise<any> {
        await this.init()
        const accessToken = await this.getAccessToken()
        
        const metadata = {
            name: file.name,
            mimeType: file.type,
            parents: [folderId]
        }
        
        const form = new FormData()
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
        form.append('file', file)
        
        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink,iconLink,size', {
            method: 'POST',
            headers: new Headers({ Authorization: 'Bearer ' + accessToken }),
            body: form
        })
        
        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        // Invalidate cache
        this.fileCache.clear()
        
        return {
            id: data.id,
            name: data.name,
            mimeType: data.mimeType,
            webViewLink: data.webViewLink,
            webContentLink: data.webContentLink,
            iconLink: data.iconLink,
            size: data.size
        }
    }
    
    static async getOrCreateProjectFolder(projectId: string, accessToken: string): Promise<string> {
        // Search for existing folder
        const query = `mimeType='application/vnd.google-apps.folder' and name='Project_${projectId}' and trashed=false`
        const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`, {
             headers: { Authorization: 'Bearer ' + accessToken }
        })
        const data = await response.json()
        
        if (data.files && data.files.length > 0) {
            return data.files[0].id
        }

        // Create new folder
        const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: `Project_${projectId}`,
                mimeType: 'application/vnd.google-apps.folder'
            })
        })
        
        const createData = await createResponse.json()
        return createData.id
    }
    
    // Cache for listFiles to improve performance
    private static fileCache: Map<string, { data: any[], timestamp: number }> = new Map()
    private static CACHE_DURATION = 60000 // 1 minute

    static async listFiles(projectId: string) {
        // Check cache first
        const cacheKey = `files_${projectId}`
        const cached = this.fileCache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached.data
        }

        await this.init()
        const accessToken = await this.getAccessToken()
        const folderId = await this.getOrCreateProjectFolder(projectId, accessToken)
        
        const response = await fetch(`https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false&fields=files(id, name, mimeType, webViewLink, webContentLink, iconLink, size)`, {
            headers: { Authorization: 'Bearer ' + accessToken }
        })
        
        const data = await response.json()
        const files = data.files || []
        
        // Update cache
        this.fileCache.set(cacheKey, { data: files, timestamp: Date.now() })
        
        return files
    }
    
    static async deleteFile(fileId: string): Promise<void> {
        await this.init()
        const accessToken = await this.getAccessToken()
        
        await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
            method: 'DELETE',
            headers: { Authorization: 'Bearer ' + accessToken }
        })
        
        // Invalidate cache
        this.fileCache.clear()
    }

    static async copyFile(fileId: string, newName: string): Promise<string> {
        await this.init()
        const accessToken = await this.getAccessToken()
        
        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/copy`, {
            method: 'POST',
            headers: { 
                Authorization: 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: newName })
        })
        
        if (!response.ok) {
            throw new Error(`Copy failed: ${response.statusText}`)
        }

        const data = await response.json()
        
        // Invalidate cache
        this.fileCache.clear()
        
        return data.id
    }
}
