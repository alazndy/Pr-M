"use client"

import { useState } from "react"
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
import { Plus, Folder, FileText, Settings, Github } from "lucide-react"
import Link from "next/link"
import { GitHubImportDialog, type ImportedRepo } from "@/components/projects/github-import-dialog"

export default function Home() {
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [githubDialogOpen, setGithubDialogOpen] = useState(false)
  const [projectName, setProjectName] = useState("")

  const handleCreateProject = () => {
    if (projectName) {
      alert(`Project "${projectName}" created successfully!`)
      setProjectName("")
      setProjectDialogOpen(false)
    }
  }

  const handleGithubImport = (repoData: ImportedRepo) => {
    alert(`Successfully imported: ${repoData.name}\nBranch: ${repoData.branch}\nLanguage: ${repoData.language}`)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back to your project management hub.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setGithubDialogOpen(true)}>
            <Github className="mr-2 h-4 w-4" /> Import from GitHub
          </Button>
          <Button onClick={() => setProjectDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/files">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/files">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Files</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">245</div>
              <p className="text-xs text-muted-foreground">+18 new files today</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/assets">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/settings">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Healthy</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>You have 3 new notifications today.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { project: "Project Alpha", action: "New design files uploaded", user: "John Doe", time: "2h ago" },
                { project: "Project Beta", action: "Code review completed", user: "Jane Smith", time: "4h ago" },
                { project: "Project Gamma", action: "Asset status changed to approved", user: "Mike Johnson", time: "6h ago" }
              ].map((activity, i) => (
                <div key={i} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.project}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.action} by {activity.user}
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-sm text-muted-foreground">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Frequently used tools and files.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/assets">
                <Button variant="outline" className="w-full justify-start">
                  <Folder className="mr-2 h-4 w-4" /> Design Assets
                </Button>
              </Link>
              <Link href="/assets">
                <Button variant="outline" className="w-full justify-start">
                  <Folder className="mr-2 h-4 w-4" /> 3D Models
                </Button>
              </Link>
              <Link href="/assets">
                <Button variant="outline" className="w-full justify-start">
                  <Folder className="mr-2 h-4 w-4" /> HMI Files
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Enter the details for your new project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="e.g., My Awesome Project"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProjectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GitHubImportDialog
        open={githubDialogOpen}
        onOpenChange={setGithubDialogOpen}
        onImport={handleGithubImport}
      />
    </div>
  )
}
