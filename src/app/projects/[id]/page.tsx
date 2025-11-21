"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ArrowLeft,
    Github,
    GitBranch,
    Calendar,
    Save,
    ExternalLink,
    FileText,
    Edit,
    Loader2
} from "lucide-react"
import Link from "next/link"
import { ProjectsService, type ProjectData } from "@/lib/services/projects.service"

type ProjectDetailsProps = {
    params: Promise<{ id: string }>
}

export default function ProjectDetailsPage({ params }: ProjectDetailsProps) {
    const router = useRouter()
    const [projectId, setProjectId] = useState<string>("")
    const [project, setProject] = useState<ProjectData | null>(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [readmeData, setReadmeData] = useState({
        projectName: "",
        projectDescription: "",
        installation: "",
        usage: "",
        features: "",
        requirements: "",
        configuration: "",
        contributors: "",
    })

    useEffect(() => {
        params.then(p => {
            setProjectId(p.id)
            loadProject(p.id)
        })
    }, [params])

    const loadProject = async (id: string) => {
        setLoading(true)
        try {
            const projectData = await ProjectsService.getProject(id)
            if (projectData) {
                // @ts-ignore - types mismatch between local and service, fixing soon
                setProject(projectData)
                if (projectData.readme) {
                    setReadmeData(projectData.readme)
                } else if (projectData.type === "github" && projectData.url) {
                    fetchGitHubReadme(projectData)
                }
            } else {
                console.error("Project not found")
                // Don't redirect immediately in case of sync issues, just show not found
            }
        } catch (error) {
            console.error("Error loading project:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchGitHubReadme = async (proj: ProjectData) => {
        if (!proj.url) return

        try {
            const match = proj.url.match(/github\.com\/([^/]+)\/([^/.]+)/)
            if (!match) return

            const owner = match[1]
            const repo = match[2]

            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`)
            if (response.ok) {
                const data = await response.json()
                const content = atob(data.content)

                // Parse README content to extract fields
                const parsed = parseReadme(content)
                setReadmeData(parsed)

                // Optionally save this back to the project?
                // For now just display it
            }
        } catch (error) {
            console.error("Error fetching README:", error)
        }
    }

    const parseReadme = (content: string) => {
        // Simple README parser - looks for common sections
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

        lines.forEach(line => {
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
                else if (lines.indexOf(line) === 0) {
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

    const handleSave = async () => {
        if (project && projectId) {
            try {
                const updatedProject = {
                    ...project,
                    readme: readmeData
                }
                // @ts-ignore
                setProject(updatedProject)

                await ProjectsService.updateProject(projectId, { readme: readmeData })

                alert("README fields saved successfully!")
                setEditing(false)
            } catch (error) {
                console.error("Error saving project:", error)
                alert("Failed to save changes")
            }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <p className="text-muted-foreground">Project not found.</p>
                <Link href="/projects">
                    <Button variant="outline">Back to Projects</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/projects">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{project.name}</h2>
                        <p className="text-muted-foreground">{project.description}</p>
                    </div>
                </div>
                {project.type === "github" && (
                    <div className="flex gap-2">
                        {!editing ? (
                            <Button onClick={() => setEditing(true)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit README Fields
                            </Button>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => setEditing(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave}>
                                    <Save className="mr-2 h-4 w-4" /> Save Changes
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Project Info */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            {project.type === "github" ? (
                                <>
                                    <Github className="h-4 w-4" />
                                    <span>GitHub</span>
                                </>
                            ) : (
                                <span>Manual</span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {project.language && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Language</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{project.language}</div>
                        </CardContent>
                    </Card>
                )}

                {project.branch && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Branch</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <GitBranch className="h-4 w-4" />
                                <span className="text-xl font-bold">{project.branch}</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Created</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{project.createdAt ? new Date(project.createdAt as any).toLocaleDateString('en-US') : 'N/A'}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* README Editor */}
            {project.type === "github" && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    README Information
                                </CardTitle>
                                <CardDescription>
                                    Extracted from repository README.md
                                </CardDescription>
                            </div>
                            {project.url && (
                                <a
                                    href={project.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                                >
                                    View on GitHub
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {editing ? (
                            <>
                                <div className="space-y-2">
                                    <Label>Project Name</Label>
                                    <Input
                                        value={readmeData.projectName}
                                        onChange={(e) => setReadmeData({ ...readmeData, projectName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        value={readmeData.projectDescription}
                                        onChange={(e) => setReadmeData({ ...readmeData, projectDescription: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Installation</Label>
                                    <Textarea
                                        value={readmeData.installation}
                                        onChange={(e) => setReadmeData({ ...readmeData, installation: e.target.value })}
                                        rows={4}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Usage</Label>
                                    <Textarea
                                        value={readmeData.usage}
                                        onChange={(e) => setReadmeData({ ...readmeData, usage: e.target.value })}
                                        rows={4}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Features</Label>
                                    <Textarea
                                        value={readmeData.features}
                                        onChange={(e) => setReadmeData({ ...readmeData, features: e.target.value })}
                                        rows={4}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Requirements</Label>
                                    <Textarea
                                        value={readmeData.requirements}
                                        onChange={(e) => setReadmeData({ ...readmeData, requirements: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Configuration</Label>
                                    <Textarea
                                        value={readmeData.configuration}
                                        onChange={(e) => setReadmeData({ ...readmeData, configuration: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Contributors</Label>
                                    <Textarea
                                        value={readmeData.contributors}
                                        onChange={(e) => setReadmeData({ ...readmeData, contributors: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="grid gap-6">
                                {readmeData.projectName && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Project Name</h3>
                                        <p className="text-muted-foreground">{readmeData.projectName}</p>
                                    </div>
                                )}
                                {readmeData.projectDescription && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Description</h3>
                                        <p className="text-muted-foreground whitespace-pre-wrap">{readmeData.projectDescription}</p>
                                    </div>
                                )}
                                {readmeData.installation && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Installation</h3>
                                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                                            {readmeData.installation}
                                        </pre>
                                    </div>
                                )}
                                {readmeData.usage && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Usage</h3>
                                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                                            {readmeData.usage}
                                        </pre>
                                    </div>
                                )}
                                {readmeData.features && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Features</h3>
                                        <p className="text-muted-foreground whitespace-pre-wrap">{readmeData.features}</p>
                                    </div>
                                )}
                                {readmeData.requirements && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Requirements</h3>
                                        <p className="text-muted-foreground whitespace-pre-wrap">{readmeData.requirements}</p>
                                    </div>
                                )}
                                {readmeData.configuration && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Configuration</h3>
                                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                                            {readmeData.configuration}
                                        </pre>
                                    </div>
                                )}
                                {readmeData.contributors && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Contributors</h3>
                                        <p className="text-muted-foreground whitespace-pre-wrap">{readmeData.contributors}</p>
                                    </div>
                                )}
                                {!readmeData.projectName && !readmeData.projectDescription && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No README data available. Click "Edit README Fields" to add information manually.
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
