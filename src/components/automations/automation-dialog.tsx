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
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Clock, FileText, Bell, Mail, Trash2, Plus } from "lucide-react"

type AutomationDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (automation: NewAutomation) => void
}

export type NewAutomation = {
    name: string
    description: string
    trigger: {
        type: "time" | "event" | "file"
        config: string
    }
    actions: {
        type: "notification" | "email" | "file" | "status"
        config: string
    }[]
}

export function AutomationDialog({ open, onOpenChange, onSave }: AutomationDialogProps) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [triggerType, setTriggerType] = useState<"time" | "event" | "file">("event")
    const [triggerConfig, setTriggerConfig] = useState("")
    const [actions, setActions] = useState<{ type: string; config: string }[]>([
        { type: "notification", config: "" }
    ])

    const handleSave = () => {
        if (!name || !triggerConfig || actions.some(a => !a.config)) {
            alert("Please fill in all required fields")
            return
        }

        onSave({
            name,
            description,
            trigger: { type: triggerType, config: triggerConfig },
            actions: actions as NewAutomation["actions"]
        })

        // Reset form
        setName("")
        setDescription("")
        setTriggerType("event")
        setTriggerConfig("")
        setActions([{ type: "notification", config: "" }])
        onOpenChange(false)
    }

    const addAction = () => {
        setActions([...actions, { type: "notification", config: "" }])
    }

    const updateAction = (index: number, field: "type" | "config", value: string) => {
        const newActions = [...actions]
        newActions[index][field] = value
        setActions(newActions)
    }

    const removeAction = (index: number) => {
        if (actions.length > 1) {
            setActions(actions.filter((_, i) => i !== index))
        }
    }

    const getTriggerPlaceholder = () => {
        switch (triggerType) {
            case "time":
                return "e.g., Daily at 9:00 AM"
            case "event":
                return "e.g., When project status changes"
            case "file":
                return "e.g., When new file is uploaded"
            default:
                return ""
        }
    }

    const getActionPlaceholder = (type: string) => {
        switch (type) {
            case "notification":
                return "e.g., Notify team members"
            case "email":
                return "e.g., Send email to admin@example.com"
            case "file":
                return "e.g., Create backup of project files"
            case "status":
                return "e.g., Update project status to 'In Progress'"
            default:
                return ""
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Automation</DialogTitle>
                    <DialogDescription>
                        Define triggers and actions to automate your workflow.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Automation Name *</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Daily Project Backup"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe what this automation does..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Trigger
                        </h4>
                        <div className="grid gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="trigger-type">Trigger Type *</Label>
                                <Select value={triggerType} onValueChange={(value: any) => setTriggerType(value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select trigger type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="time">Time-based</SelectItem>
                                        <SelectItem value="event">Event-based</SelectItem>
                                        <SelectItem value="file">File-based</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="trigger-config">Trigger Configuration *</Label>
                                <Input
                                    id="trigger-config"
                                    placeholder={getTriggerPlaceholder()}
                                    value={triggerConfig}
                                    onChange={(e) => setTriggerConfig(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold flex items-center gap-2">
                                <Bell className="h-4 w-4" />
                                Actions
                            </h4>
                            <Button size="sm" variant="outline" onClick={addAction}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add Action
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {actions.map((action, index) => (
                                <div key={index} className="grid gap-3 p-4 border rounded-lg relative">
                                    {actions.length > 1 && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="absolute top-2 right-2 h-8 w-8 p-0"
                                            onClick={() => removeAction(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <div className="grid gap-2">
                                        <Label htmlFor={`action-type-${index}`}>Action Type *</Label>
                                        <Select
                                            value={action.type}
                                            onValueChange={(value) => updateAction(index, "type", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select action type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="notification">Send Notification</SelectItem>
                                                <SelectItem value="email">Send Email</SelectItem>
                                                <SelectItem value="file">File Operation</SelectItem>
                                                <SelectItem value="status">Update Status</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor={`action-config-${index}`}>Action Details *</Label>
                                        <Input
                                            id={`action-config-${index}`}
                                            placeholder={getActionPlaceholder(action.type)}
                                            value={action.config}
                                            onChange={(e) => updateAction(index, "config", e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Create Automation</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
