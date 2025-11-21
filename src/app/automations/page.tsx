"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Zap } from "lucide-react"
import { AutomationCard, type Automation } from "@/components/automations/automation-card"
import { AutomationDialog, type NewAutomation } from "@/components/automations/automation-dialog"

const initialAutomations: Automation[] = [
    {
        id: "1",
        name: "Daily Project Backup",
        description: "Automatically backup all project files every day",
        enabled: true,
        trigger: {
            type: "time",
            config: "Daily at 2:00 AM"
        },
        actions: [
            { type: "file", config: "Create backup of all project files" },
            { type: "notification", config: "Notify admin of successful backup" }
        ],
        lastRun: "2 hours ago",
        status: "success",
        runsCount: 45
    },
    {
        id: "2",
        name: "New File Notification",
        description: "Send notification when new files are uploaded",
        enabled: true,
        trigger: {
            type: "file",
            config: "When new file is uploaded to project"
        },
        actions: [
            { type: "notification", config: "Notify team members" },
            { type: "email", config: "Send email to project@example.com" }
        ],
        lastRun: "5 minutes ago",
        status: "success",
        runsCount: 128
    },
    {
        id: "3",
        name: "Status Change Alert",
        description: "Alert team when project status changes",
        enabled: false,
        trigger: {
            type: "event",
            config: "When project status changes"
        },
        actions: [
            { type: "notification", config: "Send alert to all team members" }
        ],
        lastRun: "3 days ago",
        status: "success",
        runsCount: 12
    }
]

export default function AutomationsPage() {
    const [automations, setAutomations] = useState<Automation[]>(initialAutomations)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const handleToggle = (id: string) => {
        setAutomations(automations.map(auto =>
            auto.id === id ? { ...auto, enabled: !auto.enabled } : auto
        ))
    }

    const handleEdit = (id: string) => {
        alert(`Edit automation ${id} - Coming soon!`)
    }

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this automation?")) {
            setAutomations(automations.filter(auto => auto.id !== id))
        }
    }

    const handleSaveAutomation = (newAuto: NewAutomation) => {
        const automation: Automation = {
            id: Date.now().toString(),
            name: newAuto.name,
            description: newAuto.description,
            enabled: true,
            trigger: newAuto.trigger,
            actions: newAuto.actions,
            status: "never",
            runsCount: 0
        }
        setAutomations([...automations, automation])
    }

    const filteredAutomations = automations.filter(auto =>
        auto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        auto.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const activeCount = automations.filter(a => a.enabled).length
    const totalRuns = automations.reduce((sum, a) => sum + a.runsCount, 0)
    const successRate = automations.filter(a => a.status === "success").length / automations.length * 100

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Automations</h2>
                    <p className="text-muted-foreground">Automate your project management workflows.</p>
                </div>
                <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Automation
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Automations</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCount}</div>
                        <p className="text-xs text-muted-foreground">
                            out of {automations.length} total
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRuns}</div>
                        <p className="text-xs text-muted-foreground">
                            All time executions
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{successRate.toFixed(0)}%</div>
                        <p className="text-xs text-muted-foreground">
                            Successful executions
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search automations..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAutomations.map((automation) => (
                    <AutomationCard
                        key={automation.id}
                        automation={automation}
                        onToggle={handleToggle}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            {filteredAutomations.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">No automations found</p>
                        <p className="text-sm text-muted-foreground mb-4">
                            {searchQuery ? "Try a different search term" : "Create your first automation to get started"}
                        </p>
                        {!searchQuery && (
                            <Button onClick={() => setDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Create Automation
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            <AutomationDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSave={handleSaveAutomation}
            />
        </div>
    )
}
