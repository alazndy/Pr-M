"use client"

import { useState, useEffect } from "react"
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
import { Plus, Folder, FileText, Settings, Github, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { GitHubImportDialog, type ImportedRepo } from "@/components/projects/github-import-dialog"
import { TasksService, type Task } from "@/lib/services/tasks.service"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/AuthProvider"

export default function Home() {
  const { user } = useAuth()
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [githubDialogOpen, setGithubDialogOpen] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [allTasks, setAllTasks] = useState<Task[]>([])

  // Subscribe to all tasks across all projects
  useEffect(() => {
    if (!user) return
    // For now, we'll fetch tasks from all projects
    // In a real app, you'd want to optimize this
    const unsubscribes: (() => void)[] = []
    return () => {
      unsubscribes.forEach(unsub => unsub())
    }
  }, [user])

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

      {/* Task Overview Section */}
      {user && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Task Overview</CardTitle>
                <CardDescription>Your tasks across all projects</CardDescription>
              </div>
              <Link href="/projects">
                <Button variant="outline" size="sm">View All Projects</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Completed Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {allTasks.filter(t => t.status === 'completed').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {allTasks.length > 0 
                      ? `${Math.round((allTasks.filter(t => t.status === 'completed').length / allTasks.length) * 100)}% completion rate`
                      : 'No tasks yet'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    In Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {allTasks.filter(t => t.status === 'in-progress').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active tasks
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    Overdue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {allTasks.filter(t => {
                      if (!t.deadline) return false
                      const deadlineDate = (t.deadline as any).toDate ? (t.deadline as any).toDate() : new Date(t.deadline as any)
                      return deadlineDate < new Date() && t.status !== 'completed'
                    }).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Needs attention
                  </p>
                </CardContent>
              </Card>
            </div>

            {allTasks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Upcoming Deadlines</h4>
                {allTasks
                  .filter(t => t.deadline && t.status !== 'completed')
                  .sort((a, b) => {
                    const aDate = (a.deadline! as any).toDate ? (a.deadline! as any).toDate() : new Date(a.deadline! as any)
                    const bDate = (b.deadline! as any).toDate ? (b.deadline! as any).toDate() : new Date(b.deadline! as any)
                    return aDate.getTime() - bDate.getTime()
                  })
                  .slice(0, 5)
                  .map((task) => {
                    const deadlineDate = (task.deadline! as any).toDate ? (task.deadline! as any).toDate() : new Date(task.deadline! as any)
                    const daysUntil = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    const isOverdue = daysUntil < 0
                    
                    return (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {deadlineDate.toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={isOverdue ? "destructive" : "outline"}>
                          {isOverdue ? `${Math.abs(daysUntil)}d overdue` : `${daysUntil}d left`}
                        </Badge>
                      </div>
                    )
                  })}
                {allTasks.filter(t => t.deadline && t.status !== 'completed').length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming deadlines
                  </p>
                )}
              </div>
            )}
            
            {allTasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No tasks yet. Create a project and add tasks to get started!
              </p>
            )}
          </CardContent>
        </Card>
      )}

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
