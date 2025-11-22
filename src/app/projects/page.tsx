'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { ProjectsService, ProjectData } from '@/lib/services/projects.service'
import { GithubService } from '@/lib/services/github.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Folder, Github, Trash2, RefreshCw, Loader2, ExternalLink, GitBranch } from 'lucide-react'
import { GitHubImportDialog, type ImportedRepo } from '@/components/projects/github-import-dialog'

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
    console.log("ProjectsPage rendering")
    const router = useRouter()
    const { user, githubToken, signInWithGithub } = useAuth()
    const [projects, setProjects] = useState<ProjectData[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [githubDialogOpen, setGithubDialogOpen] = useState(false)
    const [newProject, setNewProject] = useState({ 
        name: '', 
        description: '',
        url: '',
        branch: '',
        language: '',
        readmeContent: ''
    })
    const [syncing, setSyncing] = useState(false)

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
                // Parse README content if provided
                let readmeData = undefined;
                if (newProject.readmeContent) {
                    readmeData = parseReadmeContent(newProject.readmeContent);
                }

                // Build project data, only including fields with values
                const projectData: any = {
                    name: newProject.name,
                    description: newProject.description,
                    type: "manual",
                };

                // Only add optional fields if they have values
                if (newProject.url) projectData.url = newProject.url;
                if (newProject.branch) projectData.branch = newProject.branch;
                if (newProject.language) projectData.language = newProject.language;
                if (readmeData) projectData.readme = readmeData;

                await ProjectsService.createProject(user.uid, projectData)
                
                setNewProject({ 
                    name: "", 
                    description: "",
                    url: "",
                    branch: "",
                    language: "",
                    readmeContent: ""
                })
                setCreateDialogOpen(false)
            } catch (error) {
                console.error("Error creating project:", error)
                alert("Failed to create project. Check console for details.")
            }
        }
    }

    const handleDeleteProject = async (projectId: string) => {
        if (confirm("Are you sure you want to delete this project?")) {
            try {
                await ProjectsService.deleteProject(projectId)
            } catch (error) {
                console.error("Error deleting project:", error)
                alert("Failed to delete project")
            }
        }
    }

    const handleSyncGithub = async () => {
        if (!user) return

        // If no token, try to sign in with GitHub again to get one
        if (!githubToken) {
            const proceed = confirm("GitHub access token not found. Sign in with GitHub to sync projects?")
            if (proceed) {
                try {
                    await signInWithGithub()
                    return
                } catch (error) {
                    console.error("GitHub sign-in failed:", error)
                    return
                }
            } else {
                return
            }
        }

        setSyncing(true)
        try {
            const repos = await GithubService.getUserRepositories(githubToken)
            let importedCount = 0

            for (const repo of repos) {
                // Check if project already exists (by URL or name)
                const exists = projects.some(p => 
                    p.url === repo.html_url || 
                    (p.name === repo.name && p.type === 'github')
                )

                if (!exists) {
                    await ProjectsService.createProject(user.uid, {
                        name: repo.name,
                        description: repo.description || '',
                        type: 'github',
                        url: repo.html_url
                        // readme will be fetched when opening project
                    })
                    importedCount++
                }
            }

            if (importedCount > 0) {
                alert(`Successfully imported ${importedCount} new projects from GitHub!`)
            } else {
                alert("All GitHub repositories are already synced.")
            }

        } catch (error) {
            console.error("Error syncing GitHub projects:", error)
            alert("Failed to sync GitHub projects. Check console for details.")
        } finally {
            setSyncing(false)
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
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">
                        Manage your projects and view their status
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSyncGithub} disabled={syncing}>
                        {syncing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Sync GitHub
                    </Button>
                    <Button variant="outline" onClick={() => setGithubDialogOpen(true)}>
                        <Github className="mr-2 h-4 w-4" /> Import Single
                    </Button>
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Project
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create New Project</DialogTitle>
                                <DialogDescription>
                                    Add a new project to your workspace manually.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name *</Label>
                                        <Input
                                            id="name"
                                            value={newProject.name}
                                            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                            placeholder="Project Name"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="language">Language</Label>
                                        <Input
                                            id="language"
                                            value={newProject.language}
                                            onChange={(e) => setNewProject({ ...newProject, language: e.target.value })}
                                            placeholder="e.g. TypeScript, Python"
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={newProject.description}
                                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                        placeholder="Brief project description"
                                        className="h-20"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="url">Repository URL (Optional)</Label>
                                        <Input
                                            id="url"
                                            value={newProject.url}
                                            onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
                                            placeholder="https://github.com/..."
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="branch">Branch (Optional)</Label>
                                        <Input
                                            id="branch"
                                            value={newProject.branch}
                                            onChange={(e) => setNewProject({ ...newProject, branch: e.target.value })}
                                            placeholder="main, master, etc."
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="readme">Project Documentation / README</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Paste your README content here. It will be parsed to populate project details.
                                    </p>
                                    <Textarea
                                        id="readme"
                                        value={newProject.readmeContent}
                                        onChange={(e) => setNewProject({ ...newProject, readmeContent: e.target.value })}
                                        placeholder="# Project Title\n\n## Installation\n..."
                                        className="h-40 font-mono text-xs"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateProject} disabled={!newProject.name}>
                                    Create Project
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {filteredProjects.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <Folder className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No projects found</h3>
                    <p className="text-muted-foreground">
                        Get started by creating a new project or importing from GitHub.
                    </p>
                    <div className="mt-6 flex justify-center gap-4">
                        <Button onClick={() => setCreateDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Project
                        </Button>
                        <Button variant="outline" onClick={handleSyncGithub}>
                            <Github className="mr-2 h-4 w-4" />
                            Sync GitHub
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project) => (
                        <Card key={project.id} className="flex flex-col hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => router.push(`/projects/${project.id}`)}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="flex items-center gap-2">
                                            {project.type === 'github' ? (
                                                <Github className="h-4 w-4" />
                                            ) : (
                                                <Folder className="h-4 w-4" />
                                            )}
                                            {project.name}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {project.description || "No description provided"}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 bg-secondary rounded-md text-xs">
                                            {project.type === 'github' ? 'GitHub Repo' : 'Manual Project'}
                                        </span>
                                        {project.updatedAt && (
                                            <span className="px-2 py-1 bg-secondary rounded-md text-xs">
                                                Updated: {new Date(project.updatedAt instanceof Date ? project.updatedAt : project.updatedAt.seconds * 1000).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {project.type === "github" && (
                                        <div className="space-y-1 pt-2 border-t mt-2">
                                            {project.branch && (
                                                <div className="flex items-center gap-1 text-xs">
                                                    <GitBranch className="h-3 w-3" />
                                                    <span>{project.branch}</span>
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
                                </div>
                            </CardContent>
                            <CardFooter className="border-t pt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteProject(project.id!)
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* GitHub Import Dialog */}
            <GitHubImportDialog
                open={githubDialogOpen}
                onOpenChange={setGithubDialogOpen}
                onImport={handleGithubImport}
            />
        </div>
    )
}
