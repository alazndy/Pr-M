import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Task } from "@/lib/services/tasks.service"
import { KanbanCard } from "./kanban-card"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface KanbanColumnProps {
    id: string
    title: string
    tasks: Task[]
    color: string
    onEdit: (task: Task) => void
    onDelete: (taskId: string) => void
}

export function KanbanColumn({ id, title, tasks, color, onEdit, onDelete }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id: id
    })

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-3">
                <div className={cn("h-3 w-3 rounded-full", color)} />
                <h4 className="font-semibold">{title}</h4>
                <Badge variant="secondary" className="ml-auto">
                    {tasks.length}
                </Badge>
            </div>
            
            <div
                ref={setNodeRef}
                className="flex-1 bg-muted/30 rounded-lg p-2 space-y-3 min-h-[200px]"
            >
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <KanbanCard
                            key={task.id}
                            task={task}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    )
}
