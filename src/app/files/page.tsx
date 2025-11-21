"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Folder, FileText, Search, Grid, List, ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

type FileItem = {
    id: string
    name: string
    type: "folder" | "file"
    size?: string
    modified: string
}

const mockFiles: FileItem[] = [
    { id: "1", name: "Project Alpha", type: "folder", modified: "2024-03-10" },
    { id: "2", name: "Marketing Assets", type: "folder", modified: "2024-03-12" },
    { id: "3", name: "Design Specs.pdf", type: "file", size: "2.4 MB", modified: "2024-03-15" },
    { id: "4", name: "Logo.svg", type: "file", size: "15 KB", modified: "2024-03-14" },
    { id: "5", name: "Meeting Notes.docx", type: "file", size: "12 KB", modified: "2024-03-11" },
]

export default function FilesPage() {
    const [view, setView] = useState<"grid" | "list">("grid")
    const [currentPath, setCurrentPath] = useState<string[]>([])
    const [files, setFiles] = useState<FileItem[]>(mockFiles)
    const [searchQuery, setSearchQuery] = useState("")

    const handleNavigate = (folderName: string) => {
        setCurrentPath([...currentPath, folderName])
    }

    const handleBreadcrumbClick = (index: number) => {
        setCurrentPath(currentPath.slice(0, index + 1))
    }

    const handleUpload = () => {
        const newFile: FileItem = {
            id: Date.now().toString(),
            name: `Document-${Date.now()}.pdf`,
            type: "file",
            size: `${Math.floor(Math.random() * 10)}MB`,
            modified: new Date().toISOString().split('T')[0]
        }
        setFiles([...files, newFile])
        alert(`File "${newFile.name}" uploaded successfully!`)
    }

    const handleCreateFolder = () => {
        const folderName = prompt("Enter folder name:")
        if (folderName) {
            const newFolder: FileItem = {
                id: Date.now().toString(),
                name: folderName,
                type: "folder",
                modified: new Date().toISOString().split('T')[0]
            }
            setFiles([...files, newFolder])
        }
    }

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            setFiles(files.filter(f => f.id !== id))
        }
    }

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">File Manager</h2>
                    <p className="text-muted-foreground">Manage and organize your project files.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setView("grid")}
                        className={cn(view === "grid" && "bg-accent")}
                    >
                        <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setView("list")}
                        className={cn(view === "list" && "bg-accent")}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={handleCreateFolder}>New Folder</Button>
                    <Button onClick={handleUpload}>Upload File</Button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search files..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="px-2"
                        onClick={() => setCurrentPath([])}
                    >
                        <Home className="h-4 w-4" />
                    </Button>
                    {currentPath.map((folder, index) => (
                        <div key={index} className="flex items-center">
                            < ChevronRight className="h-4 w-4 mx-1" />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="px-2"
                                onClick={() => handleBreadcrumbClick(index)}
                            >
                                {folder}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {filteredFiles.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Folder className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">No files found</p>
                        <p className="text-sm text-muted-foreground">
                            {searchQuery ? "Try a different search term" : "Upload a file to get started"}
                        </p>
                    </CardContent>
                </Card>
            ) : view === "grid" ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredFiles.map((file) => (
                        <Card key={file.id} className="group relative hover:border-primary/50 transition-colors">
                            <CardContent className="flex flex-col items-center justify-center p-6">
                                {file.type === "folder" ? (
                                    <Folder className="h-12 w-12 text-blue-500" />
                                ) : (
                                    <FileText className="h-12 w-12 text-muted-foreground" />
                                )}
                                <p className="mt-4 text-sm font-medium text-center break-all">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{file.size}</p>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDelete(file.id, file.name)
                                    }}
                                >
                                    ×
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50 text-left text-sm font-medium text-muted-foreground">
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Size</th>
                                    <th className="p-4">Modified</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFiles.map((file) => (
                                    <tr
                                        key={file.id}
                                        className="group border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {file.type === "folder" ? (
                                                    <Folder className="h-4 w-4 text-blue-500" />
                                                ) : (
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                <span className="font-medium">{file.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground">{file.size}</td>
                                        <td className="p-4 text-sm text-muted-foreground">{file.modified}</td>
                                        <td className="p-4 text-sm text-muted-foreground capitalize">
                                            {file.type}
                                        </td>
                                        <td className="p-4">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDelete(file.id, file.name)
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
