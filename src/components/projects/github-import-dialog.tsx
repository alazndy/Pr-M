"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GitBranch, Github, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

type GitHubImportDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onImport: (repoData: ImportedRepo) => void
}

export type ImportedRepo = {
    name: string
    url: string
    description: string
    branch: string
    language: string
}

export function GitHubImportDialog({ open, onOpenChange, onImport }: GitHubImportDialogProps) {
    const [repoUrl, setRepoUrl] = useState("")
    const [loading, setLoading] = useState(false)
    const [repoData, setRepoData] = useState<ImportedRepo | null>(null)
    const [error, setError] = useState("")

    const parseRepoUrl = (url: string) => {
        // Extract owner and repo from GitHub URL
        // Supports: https://github.com/owner/repo or github.com/owner/repo or owner/repo
        const patterns = [
            /github\.com\/([^\/]+)\/([^\/\.]+)/i,
            /^([^\/]+)\/([^\/]+)$/
        ]

        for (const pattern of patterns) {
            const match = url.match(pattern)
            if (match) {
                return { owner: match[1], repo: match[2] }
            }
        }
        return null
    }

    const handleFetchRepo = async () => {
        console.log("Fetch clicked, repoUrl:", repoUrl)
        setError("")
        setRepoData(null)

        if (!repoUrl.trim()) {
            setError("Please enter a GitHub repository URL")
            return
        }

        const parsed = parseRepoUrl(repoUrl)
        console.log("Parsed:", parsed)

        if (!parsed) {
            setError("Invalid GitHub URL. Use format: github.com/owner/repo or owner/repo")
            return
        }

        setLoading(true)

        try {
            console.log("Fetching:", `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`)
            // Fetch repo data from GitHub API
            const response = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`)

            console.log("Response status:", response.status)

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Repository not found. Please check the URL.")
                } else if (response.status === 403) {
                    throw new Error("API rate limit exceeded. Please try again later.")
                } else {
                    throw new Error("Failed to fetch repository information.")
                }
            }

            const data = await response.json()
            console.log("Fetched data:", data)

            const newRepoData = {
                name: data.name,
                url: data.html_url,
                description: data.description || "No description available",
                branch: data.default_branch || "main",
                language: data.language || "Unknown"
            }

            console.log("Setting repoData:", newRepoData)
            setRepoData(newRepoData)
        } catch (err: any) {
            console.error("Error:", err)
            setError(err.message || "An error occurred while fetching the repository")
        } finally {
            setLoading(false)
        }
    }

    const handleImport = () => {
        if (repoData) {
            onImport(repoData)
            setRepoUrl("")
            setRepoData(null)
            setError("")
            onOpenChange(false)
        }
    }

    const handleClose = () => {
        setRepoUrl("")
        setRepoData(null)
        setError("")
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Github className="h-5 w-5" />
                        Import from GitHub
                    </DialogTitle>
                    <DialogDescription>
                        Enter a GitHub repository URL to import the project.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="repo-url">Repository URL</Label>
                        <div className="flex gap-2">
                            <Input
                                id="repo-url"
                                placeholder="e.g., github.com/owner/repo or owner/repo"
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !loading) {
                                        handleFetchRepo()
                                    }
                                }}
                            />
                            <Button
                                onClick={handleFetchRepo}
                                disabled={loading || !repoUrl.trim()}
                                variant="outline"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Fetch"
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Supported formats: https://github.com/owner/repo, github.com/owner/repo, or owner/repo
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    {repoData && (
                        <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <h4 className="font-semibold">{repoData.name}</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{repoData.description}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Default Branch</p>
                                    <div className="flex items-center gap-1.5">
                                        <GitBranch className="h-3 w-3" />
                                        <p className="text-sm font-medium">{repoData.branch}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Language</p>
                                    <p className="text-sm font-medium">{repoData.language}</p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <a
                                    href={repoData.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline"
                                >
                                    View on GitHub →
                                </a>
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={!repoData}
                    >
                        <Github className="mr-2 h-4 w-4" />
                        Import Project
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
