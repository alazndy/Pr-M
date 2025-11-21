"use client"

import { Equipment } from "@/lib/services/equipment.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { MoreVertical, Edit, Trash2, Package } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface EquipmentListProps {
    equipment: Equipment[]
    onEdit: (equipment: Equipment) => void
    onDelete: (equipmentId: string) => void
}

const statusColors = {
    'available': 'bg-green-500',
    'in-use': 'bg-blue-500',
    'maintenance': 'bg-yellow-500',
    'unavailable': 'bg-red-500'
}

export function EquipmentList({ equipment, onEdit, onDelete }: EquipmentListProps) {
    const totalCost = equipment.reduce((sum, item) => sum + (item.cost || 0), 0)
    const totalQuantity = equipment.reduce((sum, item) => sum + item.quantity, 0)

    if (equipment.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No equipment added</p>
                    <p className="text-sm text-muted-foreground">
                        Add equipment to track project resources
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{equipment.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {totalQuantity} total quantity
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalCost.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all equipment
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Available</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {equipment.filter(e => e.status === 'available').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Ready to use
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Cost</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {equipment.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    <div>
                                        <div>{item.name}</div>
                                        {item.description && (
                                            <div className="text-xs text-muted-foreground">
                                                {item.description}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{item.category}</Badge>
                                </TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>
                                    <Badge className={cn("text-xs", statusColors[item.status])}>
                                        {item.status.replace('-', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell>{item.location || '-'}</TableCell>
                                <TableCell>
                                    {item.cost ? `$${item.cost.toLocaleString()}` : '-'}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onEdit(item)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onDelete(item.id)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
