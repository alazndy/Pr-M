import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink, X } from "lucide-react"

interface FilePreviewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    file: {
        id: string
        name: string
        mimeType: string
        webViewLink: string
        webContentLink?: string
        iconLink?: string
        size?: string
    } | null
}

export function FilePreviewDialog({ open, onOpenChange, file }: FilePreviewDialogProps) {
    if (!file) return null

    const getPreviewUrl = (url: string) => {
        // Convert view/edit links to preview links for embedding
        return url.replace(/\/view.*$/, '/preview').replace(/\/edit.*$/, '/preview')
    }

    const isImage = file.mimeType.startsWith('image/')
    const isVideo = file.mimeType.startsWith('video/')
    const isPdf = file.mimeType === 'application/pdf'
    
    // Google Docs types
    const isGoogleDoc = [
        'application/vnd.google-apps.document',
        'application/vnd.google-apps.spreadsheet',
        'application/vnd.google-apps.presentation'
    ].includes(file.mimeType)

    const renderContent = () => {
        if (isImage && file.webContentLink) {
            return (
                <div className="flex items-center justify-center h-full bg-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={file.webContentLink} 
                        alt={file.name} 
                        className="max-w-full max-h-[80vh] object-contain shadow-lg rounded-md"
                    />
                </div>
            )
        }

        if (isVideo && file.webContentLink) {
            return (
                <div className="flex items-center justify-center h-full bg-black">
                    <video 
                        src={file.webContentLink} 
                        controls 
                        className="max-w-full max-h-[80vh]"
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            )
        }

        // For PDFs and Google Docs, use the embeddable preview link
        if (isPdf || isGoogleDoc) {
            return (
                <iframe 
                    src={getPreviewUrl(file.webViewLink)} 
                    className="w-full h-[80vh] border-0 rounded-md bg-white"
                    title={file.name}
                    allow="autoplay"
                />
            )
        }

        // Fallback for other types
        return (
            <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
                <div className="bg-muted p-6 rounded-full mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={file.iconLink} alt="" className="w-16 h-16 opacity-50" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Preview not available</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                    This file type cannot be previewed directly. You can download it or view it in Google Drive.
                </p>
                <div className="flex gap-3">
                    <Button asChild variant="outline">
                        <a href={file.webContentLink} download target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </a>
                    </Button>
                    <Button asChild>
                        <a href={file.webViewLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open in Drive
                        </a>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl w-full h-[90vh] p-0 gap-0 bg-background/95 backdrop-blur-sm">
                <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
                    <DialogTitle className="truncate flex-1 pr-4 flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={file.iconLink} alt="" className="w-5 h-5" />
                        {file.name}
                    </DialogTitle>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="ghost" size="sm">
                            <a href={file.webContentLink} download target="_blank" rel="noopener noreferrer" title="Download">
                                <Download className="h-4 w-4" />
                            </a>
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                            <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" title="Open in Drive">
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} title="Close">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>
                <div className="flex-1 overflow-hidden bg-muted/10 p-4 flex items-center justify-center">
                    {renderContent()}
                </div>
            </DialogContent>
        </Dialog>
    )
}
