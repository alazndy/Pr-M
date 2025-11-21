"use client"

import { useState } from "react"
import { Task } from "@/lib/services/tasks.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
    Calendar, 
    CheckCircle2, 
    Clock, 
    AlertCircle,
    MoreVertical,
    Trash2,
    Edit
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { AssigneeAvatar } from "./assignee-avatar"
import { KanbanBoard } from "./kanban-board"

interface TaskListProps {
    tasks: Task[]
    onEdit: (task: Task) => void
    onDelete: (taskId: string) => void
    onStatusChange: (taskId: string, status: Task['status']) => void
}

const statusColors = {
    'todo': 'bg-gray-500',
    'in-progress': 'bg-blue-500',
    'review': 'bg-yellow-500',
    'completed': 'bg-green-500'
}

const priorityColors = {
    'low': 'bg-gray-400',
    'medium': 'bg-blue-400',
    'high': 'bg-orange-400',
    'critical': 'bg-red-500'
}

export function TaskList({ tasks, onEdit, onDelete, onStatusChange }: TaskListProps) {
    const [view, setView] = useState<'list' | 'kanban'>('kanban')

    const getDeadlineStatus = (deadline?: any) => {
        if (!deadline) return null
        const deadlineDate = deadline.toDate ? deadline.toDate() : new Date(deadline)
        const now = new Date()
        const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays < 0) return { text: 'Overdue', color: 'text-red-500', icon: AlertCircle }
        if (diffDays === 0) return { text: 'Due today', color: 'text-orange-500', icon: Clock }
        if (diffDays <= 3) return { text: `${diffDays}d left`, color: 'text-yellow-500', icon: Clock }
        return { text: `${diffDays}d left`, color: 'text-muted-foreground', icon: Calendar }
    }

    const TaskCard = ({ task }: { task: Task }) => {
        const deadlineStatus = getDeadlineStatus(task.deadline)
        
        return (
            <Card className="mb-3 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mr-2">
                                <CardTitle className="text-base font-semibold">{task.title}</CardTitle>
                                {task.assignedTo && (
                                    <AssigneeAvatar 
                                        name={task.assignedToName} 
                                        email={task.assignedToEmail} 
                                        photoUrl={task.assignedToPhoto}
                                        className="h-6 w-6"
                                    />
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(task)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => onDelete(task.id)}
                                    className="text-red-600"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={cn("text-xs", statusColors[task.status])}>
                            {task.status.replace('-', ' ')}
                        </Badge>
                        <Badge variant="outline" className={cn("text-xs", priorityColors[task.priority])}>
                            {task.priority}
                        </Badge>
                        {deadlineStatus && (
                            <div className={cn("flex items-center gap-1 text-xs", deadlineStatus.color)}>
                                <deadlineStatus.icon className="h-3 w-3" />
                                {deadlineStatus.text}
                            </div>
                        )}
                    </div>

                    {task.subtasks.length > 0 && (
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Progress</span>
                                <span>{task.progress}%</span>
                            </div>
                            <Progress value={task.progress} className="h-2" />
                            <div className="text-xs text-muted-foreground">
                                {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks
                            </div>
                        </div>
                    )}

                    {task.requirements.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3" />
                            {task.requirements.filter(r => r.met).length}/{task.requirements.length} requirements met
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Tasks</h3>
                <div className="flex gap-2">
                    <Button
                        variant={view === 'kanban' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setView('kanban')}
                    >
                        Kanban
                    </Button>
                    <Button
                        variant={view === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setView('list')}
                    >
                        List
                    </Button>
                </div>
            </div>

            {view === 'kanban' ? (
                <KanbanBoard 
                    tasks={tasks}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                />
            ) : (
                <div className="space-y-2">
                    {tasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </div>
            )}
        </div>
    )
}
