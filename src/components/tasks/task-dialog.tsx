import { useState, useEffect } from "react"
import { Task, Subtask, Requirement } from "@/lib/services/tasks.service"
import { TeamService, ProjectMember } from "@/lib/services/team.service"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X, CheckCircle2, Circle, User } from "lucide-react"
import { Timestamp } from "firebase/firestore"
import { AssigneeAvatar } from "./assignee-avatar"

interface TaskDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (taskData: Partial<Task>) => void
    task?: Task | null
    userId: string
    projectId?: string
}

export function TaskDialog({ open, onOpenChange, onSave, task, userId, projectId }: TaskDialogProps) {
    const [title, setTitle] = useState(task?.title || "")
    const [description, setDescription] = useState(task?.description || "")
    const [status, setStatus] = useState<Task['status']>(task?.status || 'todo')
    const [priority, setPriority] = useState<Task['priority']>(task?.priority || 'medium')
    const [deadline, setDeadline] = useState(
        task?.deadline ? new Date(task.deadline.toDate()).toISOString().split('T')[0] : ""
    )
    const [estimatedHours, setEstimatedHours] = useState(task?.estimatedHours?.toString() || "")
    const [subtasks, setSubtasks] = useState<Subtask[]>(task?.subtasks || [])
    const [requirements, setRequirements] = useState<Requirement[]>(task?.requirements || [])
    const [newSubtask, setNewSubtask] = useState("")
    const [newRequirement, setNewRequirement] = useState("")
    
    const [assignedTo, setAssignedTo] = useState<string>(task?.assignedTo || "")
    const [members, setMembers] = useState<ProjectMember[]>([])

    useEffect(() => {
        if (open && projectId) {
            TeamService.getProjectMembers(projectId).then(setMembers)
        }
    }, [open, projectId])

    useEffect(() => {
        if (open) {
            setTitle(task?.title || "")
            setDescription(task?.description || "")
            setStatus(task?.status || 'todo')
            setPriority(task?.priority || 'medium')
            setDeadline(task?.deadline ? new Date(task.deadline.toDate()).toISOString().split('T')[0] : "")
            setEstimatedHours(task?.estimatedHours?.toString() || "")
            setSubtasks(task?.subtasks || [])
            setRequirements(task?.requirements || [])
            setAssignedTo(task?.assignedTo || "")
        }
    }, [open, task])

    const handleSave = () => {
        const assignedMember = members.find(m => m.userId === assignedTo)

        const taskData: Partial<Task> = {
            title,
            description,
            status,
            priority,
            deadline: deadline ? Timestamp.fromDate(new Date(deadline)) : undefined,
            estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
            subtasks,
            requirements,
            createdBy: userId,
            assignedTo: assignedTo || null,
            assignedToName: assignedMember?.displayName || null,
            assignedToEmail: assignedMember?.email || null,
            assignedToPhoto: assignedMember?.photoURL || null,
            assignedAt: assignedTo ? Timestamp.now() : null,
            assignedBy: assignedTo ? userId : null
        }

        onSave(taskData)
        handleClose()
    }

    const handleClose = () => {
        onOpenChange(false)
    }

    const addSubtask = () => {
        if (newSubtask.trim()) {
            setSubtasks([...subtasks, {
                id: Date.now().toString(),
                title: newSubtask,
                completed: false
            }])
            setNewSubtask("")
        }
    }

    const removeSubtask = (id: string) => {
        setSubtasks(subtasks.filter(st => st.id !== id))
    }

    const toggleSubtask = (id: string) => {
        setSubtasks(subtasks.map(st =>
            st.id === id ? { ...st, completed: !st.completed } : st
        ))
    }

    const addRequirement = () => {
        if (newRequirement.trim()) {
            setRequirements([...requirements, {
                id: Date.now().toString(),
                description: newRequirement,
                met: false
            }])
            setNewRequirement("")
        }
    }

    const removeRequirement = (id: string) => {
        setRequirements(requirements.filter(req => req.id !== id))
    }

    const toggleRequirement = (id: string) => {
        setRequirements(requirements.map(req =>
            req.id === id ? { ...req, met: !req.met } : req
        ))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                    <DialogDescription>
                        {task ? 'Update task details' : 'Add a new task to your project'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Task title"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Task description"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={status} onValueChange={(value: Task['status']) => setStatus(value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todo">To Do</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="review">Review</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={priority} onValueChange={(value: Task['priority']) => setPriority(value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="deadline">Deadline</Label>
                            <Input
                                id="deadline"
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="estimatedHours">Estimated Hours</Label>
                            <Input
                                id="estimatedHours"
                                type="number"
                                value={estimatedHours}
                                onChange={(e) => setEstimatedHours(e.target.value)}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="assignee">Assignee</Label>
                        <Select value={assignedTo} onValueChange={setAssignedTo}>
                            <SelectTrigger>
                                <SelectValue placeholder="Unassigned" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {members.map((member) => (
                                    <SelectItem key={member.userId} value={member.userId}>
                                        <div className="flex items-center gap-2">
                                            <AssigneeAvatar 
                                                name={member.displayName} 
                                                email={member.email} 
                                                photoUrl={member.photoURL}
                                                className="h-5 w-5"
                                            />
                                            <span>{member.displayName || member.email}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Subtasks</Label>
                        <div className="flex gap-2">
                            <Input
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                placeholder="Add a subtask"
                                onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
                            />
                            <Button type="button" onClick={addSubtask} size="icon">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="space-y-2 mt-2">
                            {subtasks.map((subtask) => (
                                <div key={subtask.id} className="flex items-center gap-2 p-2 border rounded">
                                    <Checkbox
                                        checked={subtask.completed}
                                        onCheckedChange={() => toggleSubtask(subtask.id)}
                                    />
                                    <span className={subtask.completed ? "line-through text-muted-foreground flex-1" : "flex-1"}>
                                        {subtask.title}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeSubtask(subtask.id)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Requirements</Label>
                        <div className="flex gap-2">
                            <Input
                                value={newRequirement}
                                onChange={(e) => setNewRequirement(e.target.value)}
                                placeholder="Add a requirement"
                                onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                            />
                            <Button type="button" onClick={addRequirement} size="icon">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="space-y-2 mt-2">
                            {requirements.map((requirement) => (
                                <div key={requirement.id} className="flex items-center gap-2 p-2 border rounded">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => toggleRequirement(requirement.id)}
                                    >
                                        {requirement.met ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Circle className="h-4 w-4" />
                                        )}
                                    </Button>
                                    <span className={requirement.met ? "line-through text-muted-foreground flex-1" : "flex-1"}>
                                        {requirement.description}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeRequirement(requirement.id)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!title.trim()}>
                        {task ? 'Update' : 'Create'} Task
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
