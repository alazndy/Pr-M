"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import {
    Plus,
    Search,
    FolderKanban,
    GitBranch,
    Calendar,
    Trash2,
    ExternalLink,
    Loader2
} from "lucide-react"
import { GitHubImportDialog, type ImportedRepo } from "@/components/projects/github-import-dialog"
import { Github } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { ProjectsService, type ProjectData } from "@/lib/services/projects.service"

// README parsing function (kept for GitHub imports)
const parseReadmeContent = (content: string) => {
    const sections: any = {
        projectName: "",
        projectDescription: "",
        installation: "",
        usage: "",
        features: "",
        requirements: "",
        configuration: "",
        contributors: "",
    }

    const lines = content.split('\n')
    let currentSection = ""
    let currentContent: string[] = []

    const saveSection = () => {
        if (currentSection && currentContent.length > 0) {
            sections[currentSection] = currentContent.join('\n').trim()
        }
    }

    lines.forEach((line, index) => {
        const lowerLine = line.toLowerCase()

        if (lowerLine.startsWith('# ') || lowerLine.startsWith('## ')) {
            saveSection()
            currentContent = []

            if (lowerLine.includes('install')) currentSection = 'installation'
            else if (lowerLine.includes('usage') || lowerLine.includes('how to use')) currentSection = 'usage'
            else if (lowerLine.includes('feature')) currentSection = 'features'
            else if (lowerLine.includes('require') || lowerLine.includes('prerequisite')) currentSection = 'requirements'
            else if (lowerLine.includes('config')) currentSection = 'configuration'
            else if (lowerLine.includes('contributor') || lowerLine.includes('author')) currentSection = 'contributors'
            else if (index === 0) {
                sections.projectName = line.replace(/^#+ /, '').trim()
                currentSection = ""
            } else {
                currentSection = ""
            }
        } else if (currentSection && line.trim()) {
            currentContent.push(line)
        } else if (!sections.projectDescription && line.trim() && !line.startsWith('#')) {
            if (!sections.projectDescription) {
                sections.projectDescription = line.trim()
            }
        }
    })

    saveSection()
    return sections
}

export default function ProjectsPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [projects, setProjects] = useState<ProjectData[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [githubDialogOpen, setGithubDialogOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [newProject, setNewProject] = useState({
        name: "",
        description: "",
    })

    // Subscribe to projects from Firestore
    useEffect(() => {
        if (!user) {
            setLoading(false)
            return
        }

        setLoading(true)
        const unsubscribe = ProjectsService.subscribeToProjects(user.uid, (data) => {
            setProjects(data)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [user])

    const handleCreateProject = async () => {
        if (newProject.name && user) {
            try {
                await ProjectsService.createProject(user.uid, {
                    name: newProject.name,
                    description: newProject.description,
                    type: "manual",
                })

                setNewProject({ name: "", description: "" })
                setCreateDialogOpen(false)
            } catch (error) {
                console.error("Error creating project:", error)
                alert("Failed to create project. Check console for details.")
            }
        }
    }

    const handleGithubImport = async (repoData: ImportedRepo) => {
        if (!user) return

        try {
            const projectData: any = {
                name: repoData.name,
                description: repoData.description,
                type: "github",
                url: repoData.url,
                branch: repoData.branch,
                language: repoData.language,
            }

            // Fetch and parse README
            try {
                const match = repoData.url.match(/github\.com\/([^/]+)\/([^/.]+)/)
                if (match) {
                    const owner = match[1]
                    const repo = match[2]

                    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`)
                    if (response.ok) {
                        const data = await response.json()
                        const content = atob(data.content)

                        // Parse README and add to project
                        const readmeData = parseReadmeContent(content)
                        projectData.readme = readmeData
                    }
                }
            } catch (error) {
                console.error("Error fetching README during import:", error)
            }

            await ProjectsService.createProject(user.uid, projectData)
            alert(`Successfully imported: ${repoData.name}`)
        } catch (error) {
            console.error("Error importing project:", error)
            alert("Failed to import project")
        }
    }

    const handleDeleteProject = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                await ProjectsService.deleteProject(id)
            } catch (error) {
                console.error("Error deleting project:", error)
                alert("Failed to delete project")
            }
        }
    }

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
                    <p className="text-muted-foreground">Manage all your projects in one place.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setGithubDialogOpen(true)}>
                        <Github className="mr-2 h-4 w-4" /> Import from GitHub
                    </Button>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> New Project
                    </Button>
                </div>
            </div>

            {/* Search and Stats */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">No projects found</p>
                        <p className="text-sm text-muted-foreground mb-4">
                            {searchQuery ? "Try a different search term" : "Create your first project to get started"}
                        </p>
                        {!searchQuery && (
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setGithubDialogOpen(true)}>
                                    <Github className="mr-2 h-4 w-4" /> Import from GitHub
                                </Button>
                                <Button onClick={() => setCreateDialogOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" /> New Project
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project) => (
                        <div key={project.id} className="relative group">
                            <div onClick={() => router.push(`/projects/${project.id}`)}>
                                <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="flex items-center gap-2">
                                                    <FolderKanban className="h-5 w-5" />
                                                    {project.name}
                                                </CardTitle>
                                                <CardDescription className="mt-2">
                                                    {project.description}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {project.createdAt ? new Date(project.createdAt as any).toLocaleDateString('en-US') : 'N/A'}
                                            </div>
                                            {project.type === "github" && (
                                                <div className="flex items-center gap-1">
                                                    <Github className="h-3 w-3" />
                                                    GitHub
                                                </div>
                                            )}
                                        </div>

                                        {project.type === "github" && (
                                            <div className="space-y-2 pt-2 border-t">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground">Branch:</span>
                                                    <div className="flex items-center gap-1">
                                                        <GitBranch className="h-3 w-3" />
                                                        <span className="font-medium">{project.branch}</span>
                                                    </div>
                                                </div>
                                                {project.language && (
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-muted-foreground">Language:</span>
                                                        <span className="font-medium">{project.language}</span>
                                                    </div>
                                                )}
                                                {project.url && (
                                                    <div
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="pt-1"
                                                    >
                                                        <a
                                                            href={project.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                                                        >
                                                            View on GitHub
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (project.id) handleDeleteProject(project.id, project.name)
                                }}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Project Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                        <DialogDescription>
                            Add a new project to your workspace.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Project Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g., My Awesome Project"
                                value={newProject.name}
                                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="What is this project about?"
                                value={newProject.description}
                                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateProject}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Project
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* GitHub Import Dialog */}
            <GitHubImportDialog
                open={githubDialogOpen}
                onOpenChange={setGithubDialogOpen}
                onImport={handleGithubImport}
            />
        </div>
    )
}
