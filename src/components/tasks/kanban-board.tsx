import { useState, useMemo } from "react"
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    DropAnimation
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { Task } from "@/lib/services/tasks.service"
import { KanbanColumn } from "./kanban-column"
import { KanbanCard } from "./kanban-card"
import { createPortal } from "react-dom"

interface KanbanBoardProps {
    tasks: Task[]
    onEdit: (task: Task) => void
    onDelete: (taskId: string) => void
    onStatusChange: (taskId: string, status: Task['status']) => void
}

const columns: { id: Task['status']; title: string; color: string }[] = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-500' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'review', title: 'Review', color: 'bg-yellow-500' },
    { id: 'completed', title: 'Completed', color: 'bg-green-500' }
]

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
}

export function KanbanBoard({ tasks, onEdit, onDelete, onStatusChange }: KanbanBoardProps) {
    const [activeId, setActiveId] = useState<string | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // 5px movement required to start drag
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const tasksByStatus = useMemo(() => {
        const grouped: Record<string, Task[]> = {
            'todo': [],
            'in-progress': [],
            'review': [],
            'completed': []
        }
        
        tasks.forEach(task => {
            if (grouped[task.status]) {
                grouped[task.status].push(task)
            }
        })
        
        return grouped
    }, [tasks])

    const activeTask = useMemo(() => 
        tasks.find(t => t.id === activeId),
    [activeId, tasks])

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = active.id
        const overId = over.id

        // Find the containers
        const activeTask = tasks.find(t => t.id === activeId)
        const overTask = tasks.find(t => t.id === overId)
        
        if (!activeTask) return

        // If dragging over a column directly
        if (columns.some(c => c.id === overId)) {
            const overColumnId = overId as Task['status']
            if (activeTask.status !== overColumnId) {
                // We don't update state here, we wait for drop
                // But for visual feedback we might want to, but let's keep it simple for now
            }
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)

        if (!over) return

        const activeTaskId = active.id as string
        const overId = over.id as string

        const activeTask = tasks.find(t => t.id === activeTaskId)
        if (!activeTask) return

        let newStatus: Task['status'] | null = null

        // Dropped over a column
        if (columns.some(c => c.id === overId)) {
            newStatus = overId as Task['status']
        } 
        // Dropped over another task
        else {
            const overTask = tasks.find(t => t.id === overId)
            if (overTask) {
                newStatus = overTask.status
            }
        }

        if (newStatus && newStatus !== activeTask.status) {
            onStatusChange(activeTaskId, newStatus)
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full min-h-[500px]">
                {columns.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        color={col.color}
                        tasks={tasksByStatus[col.id]}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>

            {createPortal(
                <DragOverlay dropAnimation={dropAnimation}>
                    {activeTask ? (
                        <KanbanCard
                            task={activeTask}
                            onEdit={() => {}}
                            onDelete={() => {}}
                        />
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    )
}
