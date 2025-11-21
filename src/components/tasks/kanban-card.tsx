import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
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
    Edit,
    GripVertical
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { AssigneeAvatar } from "./assignee-avatar"

interface KanbanCardProps {
    task: Task
    onEdit: (task: Task) => void
    onDelete: (taskId: string) => void
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

export function KanbanCard({ task, onEdit, onDelete }: KanbanCardProps) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task
        }
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

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

    const deadlineStatus = getDeadlineStatus(task.deadline)

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-30 bg-accent/50 border-2 border-primary/50 border-dashed rounded-lg h-[200px] w-full"
            />
        )
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Card className="mb-3 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group">
                <CardHeader className="pb-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mr-1 mb-1">
                                <Badge variant="outline" className={cn("text-[10px] px-1 py-0 h-5", priorityColors[task.priority])}>
                                    {task.priority}
                                </Badge>
                                {task.assignedTo && (
                                    <AssigneeAvatar 
                                        name={task.assignedToName} 
                                        email={task.assignedToEmail} 
                                        photoUrl={task.assignedToPhoto}
                                        className="h-5 w-5"
                                    />
                                )}
                            </div>
                            <CardTitle className="text-sm font-semibold leading-tight line-clamp-2">{task.title}</CardTitle>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="h-3 w-3" />
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
                <CardContent className="p-4 pt-0 space-y-3">
                    {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                        {deadlineStatus && (
                            <div className={cn("flex items-center gap-1 text-[10px]", deadlineStatus.color)}>
                                <deadlineStatus.icon className="h-3 w-3" />
                                {deadlineStatus.text}
                            </div>
                        )}
                    </div>

                    {task.subtasks.length > 0 && (
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                <span>Progress</span>
                                <span>{task.progress}%</span>
                            </div>
                            <Progress value={task.progress} className="h-1.5" />
                        </div>
                    )}

                    {task.requirements.length > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3" />
                            {task.requirements.filter(r => r.met).length}/{task.requirements.length} reqs
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
