"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, ExternalLink, Code, PenTool, Box, MessageSquare, GitBranch, Wrench } from "lucide-react"

type Tool = {
    id: string
    name: string
    category: string
    description: string
    icon: React.ElementType
    url: string
}

const tools: Tool[] = [
    {
        id: "1",
        name: "VS Code",
        category: "Development",
        description: "Source code editor for debugging and version control.",
        icon: Code,
        url: "vscode://",
    },
    {
        id: "2",
        name: "AutoCAD",
        category: "Design",
        description: "Computer-aided design and drafting software.",
        icon: PenTool,
        url: "#",
    },
    {
        id: "3",
        name: "Blender",
        category: "3D Modeling",
        description: "3D creation suite for modeling, rigging, and animation.",
        icon: Box,
        url: "#",
    },
    {
        id: "4",
        name: "Figma",
        category: "Design",
        description: "Collaborative interface design tool.",
        icon: PenTool,
        url: "https://figma.com",
    },
    {
        id: "5",
        name: "Slack",
        category: "Communication",
        description: "Team communication and collaboration platform.",
        icon: MessageSquare,
        url: "slack://",
    },
    {
        id: "6",
        name: "GitHub Desktop",
        category: "Version Control",
        description: "Simplify your development workflow.",
        icon: GitBranch,
        url: "github-windows://",
    },
]

export default function ToolsPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [configDialogOpen, setConfigDialogOpen] = useState(false)

    const filteredTools = tools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">External Tools</h2>
                    <p className="text-muted-foreground">Access and manage your integrated software tools.</p>
                </div>
                <Button onClick={() => alert("Configure Tool - Coming soon!")}>
                    <Wrench className="mr-2 h-4 w-4" /> Configure Tool
                </Button>
            </div>

            <div className="flex items-center gap-4 max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tools..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {filteredTools.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">No tools found</p>
                        <p className="text-sm text-muted-foreground">
                            Try a different search term
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTools.map((tool) => (
                        <Card key={tool.id} className="hover:border-primary/50 transition-colors">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-md bg-primary/10 text-primary">
                                            <tool.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{tool.name}</CardTitle>
                                            <CardDescription>{tool.category}</CardDescription>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground min-h-[40px]">
                                    {tool.description}
                                </p>
                                <Button className="w-full" variant="outline" asChild>
                                    <a href={tool.url} target="_blank" rel="noopener noreferrer">
                                        Launch <ExternalLink className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
