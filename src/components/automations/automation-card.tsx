"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Clock, FileText, Zap, Mail, Bell, Edit, Trash2, CheckCircle2, XCircle, Circle } from "lucide-react"

export type Automation = {
    id: string
    name: string
    description: string
    enabled: boolean
    trigger: {
        type: "time" | "event" | "file"
        config: string
    }
    actions: {
        type: "notification" | "email" | "file" | "status"
        config: string
    }[]
    lastRun?: string
    status?: "success" | "failed" | "never"
    runsCount: number
}

type AutomationCardProps = {
    automation: Automation
    onToggle: (id: string) => void
    onEdit: (id: string) => void
    onDelete: (id: string) => void
}

export function AutomationCard({ automation, onToggle, onEdit, onDelete }: AutomationCardProps) {
    const getTriggerIcon = () => {
        switch (automation.trigger.type) {
            case "time":
                return <Clock className="h-4 w-4" />
            case "file":
                return <FileText className="h-4 w-4" />
            case "event":
                return <Zap className="h-4 w-4" />
        }
    }

    const getActionIcon = (type: string) => {
        switch (type) {
            case "notification":
                return <Bell className="h-3 w-3" />
            case "email":
                return <Mail className="h-3 w-3" />
            case "file":
                return <FileText className="h-3 w-3" />
            case "status":
                return <Zap className="h-3 w-3" />
            default:
                return <Circle className="h-3 w-3" />
        }
    }

    const getStatusIcon = () => {
        switch (automation.status) {
            case "success":
                return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case "failed":
                return <XCircle className="h-4 w-4 text-red-500" />
            default:
                return <Circle className="h-4 w-4 text-muted-foreground" />
        }
    }

    return (
        <Card className={automation.enabled ? "border-primary/50" : ""}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{automation.name}</CardTitle>
                            {automation.enabled && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    Active
                                </span>
                            )}
                        </div>
                        <CardDescription>{automation.description}</CardDescription>
                    </div>
                    <Switch checked={automation.enabled} onCheckedChange={() => onToggle(automation.id)} />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="p-1.5 rounded bg-primary/10 text-primary">
                            {getTriggerIcon()}
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground mb-0.5 capitalize">
                                {automation.trigger.type} Trigger
                            </p>
                            <p className="text-sm">{automation.trigger.config}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Actions</p>
                        <div className="space-y-2">
                            {automation.actions.map((action, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                    <div className="p-1 rounded bg-muted">
                                        {getActionIcon(action.type)}
                                    </div>
                                    <span className="truncate">{action.config}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-3 border-t space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Run:</span>
                        <div className="flex items-center gap-2">
                            {getStatusIcon()}
                            <span className="text-xs">
                                {automation.lastRun || "Never"}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Runs:</span>
                        <span className="font-medium">{automation.runsCount}</span>
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onEdit(automation.id)}
                    >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => onDelete(automation.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
