"use client"

import { useState, useEffect, useRef } from "react"
import { DriveService } from "@/lib/services/drive.service"
import { ProjectsService } from "@/lib/services/projects.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload, File as FileIcon, Trash2, ExternalLink, RefreshCw, Eye } from "lucide-react"
import { formatBytes } from "@/lib/utils"
import { FilePreviewDialog } from "@/components/files/file-preview-dialog"

interface FileBrowserProps {
    projectId: string
}

interface DriveFile {
    id: string
    name: string
    mimeType: string
    webViewLink: string
    webContentLink?: string
    iconLink: string
    size?: string
}

export function FileBrowser({ projectId }: FileBrowserProps) {
    const [files, setFiles] = useState<DriveFile[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [credentialsConfigured, setCredentialsConfigured] = useState(true)
    const [previewFile, setPreviewFile] = useState<DriveFile | null>(null)
    const [previewOpen, setPreviewOpen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const loadFiles = async () => {
        setLoading(true)
        try {
            // Check if credentials are configured
            if (!process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID || !process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY) {
                setCredentialsConfigured(false)
                setLoading(false)
                return
            }

            const driveFiles = await DriveService.listFiles(projectId)
            setFiles(driveFiles)
        } catch (error) {
            console.error("Error loading files:", error)
            // If error is about missing credentials, show the message
            if (error instanceof Error && error.message.includes('credentials')) {
                setCredentialsConfigured(false)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadFiles()
    }, [projectId])

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileToUpload = event.target.files?.[0]
        if (!fileToUpload) return

        setUploading(true)
        try {
            // Ensure project folder exists
            const folderId = await DriveService.createProjectFolder(projectId)
            if (!folderId) throw new Error("Failed to create project folder")

            const file = await DriveService.uploadFile(fileToUpload, folderId)
            if (file) {
                setFiles(prev => [...prev, file])
                // Link file to project in Firestore
                await ProjectsService.addDriveFile(projectId, file.id)
            }
        } catch (error) {
            console.error("Error uploading file:", error)
            alert("Failed to upload file")
        } finally {
            setUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const handleDelete = async (fileId: string) => {
        if (!confirm("Are you sure you want to delete this file?")) return

        try {
            await DriveService.deleteFile(fileId)
            setFiles(files.filter(f => f.id !== fileId))
            // Remove file link from project in Firestore
            await ProjectsService.removeDriveFile(projectId, fileId)
        } catch (error) {
            console.error("Error deleting file:", error)
            alert("Failed to delete file")
        }
    }

    const handlePreview = (file: DriveFile) => {
        setPreviewFile(file)
        setPreviewOpen(true)
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Project Files (Google Drive)</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={loadFiles} disabled={loading}>
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading || !credentialsConfigured}>
                            {uploading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Upload className="h-4 w-4 mr-2" />
                            )}
                            Upload File
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleUpload}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {!credentialsConfigured ? (
                        <div className="text-center py-12">
                            <FileIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">Google Drive Not Configured</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                To enable file management with Google Drive, add your API credentials to <code className="bg-muted px-2 py-1 rounded">.env.local</code>
                            </p>
                            <div className="text-left max-w-md mx-auto bg-muted p-4 rounded-lg">
                                <p className="text-xs font-mono mb-2">NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID=your_client_id</p>
                                <p className="text-xs font-mono">NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY=your_api_key</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-4">
                                Get your credentials from the <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a>
                            </p>
                        </div>
                    ) : loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : files.length === 0 ? (
                        <div className="text-center py-12">
                            <FileIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No files uploaded yet</p>
                            <p className="text-sm text-muted-foreground mt-2">Click "Upload File" to add files to this project</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors group"
                                >
                                    <div 
                                        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                                        onClick={() => handlePreview(file)}
                                    >
                                        {file.iconLink && (
                                            <img src={file.iconLink} alt="" className="h-6 w-6 flex-shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{file.name}</p>
                                            {file.size && (
                                                <p className="text-xs text-muted-foreground">
                                                    {formatBytes(parseInt(file.size))}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handlePreview(file)}
                                            title="Preview"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => window.open(file.webViewLink, '_blank')}
                                            title="Open in Google Drive"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(file.id)}
                                            title="Delete file"
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <FilePreviewDialog 
                open={previewOpen} 
                onOpenChange={setPreviewOpen} 
                file={previewFile} 
            />
        </>
    )
}
