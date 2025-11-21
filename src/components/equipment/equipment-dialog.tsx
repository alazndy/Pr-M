"use client"

import { useState } from "react"
import { Equipment } from "@/lib/services/equipment.service"
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
import { Timestamp } from "firebase/firestore"

interface EquipmentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (equipmentData: Partial<Equipment>) => void
    equipment?: Equipment | null
}

export function EquipmentDialog({ open, onOpenChange, onSave, equipment }: EquipmentDialogProps) {
    const [name, setName] = useState(equipment?.name || "")
    const [description, setDescription] = useState(equipment?.description || "")
    const [category, setCategory] = useState(equipment?.category || "")
    const [quantity, setQuantity] = useState(equipment?.quantity?.toString() || "1")
    const [status, setStatus] = useState<Equipment['status']>(equipment?.status || 'available')
    const [location, setLocation] = useState(equipment?.location || "")
    const [cost, setCost] = useState(equipment?.cost?.toString() || "")
    const [purchaseDate, setPurchaseDate] = useState(
        equipment?.purchaseDate ? new Date(equipment.purchaseDate.toDate()).toISOString().split('T')[0] : ""
    )
    const [notes, setNotes] = useState(equipment?.notes || "")

    const handleSave = () => {
        const equipmentData: Partial<Equipment> = {
            name,
            description: description || undefined,
            category,
            quantity: parseInt(quantity) || 1,
            status,
            location: location || undefined,
            cost: cost ? parseFloat(cost) : undefined,
            purchaseDate: purchaseDate ? Timestamp.fromDate(new Date(purchaseDate)) : undefined,
            notes: notes || undefined
        }

        onSave(equipmentData)
        handleClose()
    }

    const handleClose = () => {
        setName("")
        setDescription("")
        setCategory("")
        setQuantity("1")
        setStatus('available')
        setLocation("")
        setCost("")
        setPurchaseDate("")
        setNotes("")
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{equipment ? 'Edit Equipment' : 'Add New Equipment'}</DialogTitle>
                    <DialogDescription>
                        {equipment ? 'Update equipment details' : 'Add new equipment to your project'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Equipment name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Input
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="e.g., Hardware, Software, Tools"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Equipment description"
                            rows={2}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity *</Label>
                            <Input
                                id="quantity"
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                min="1"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={status} onValueChange={(value: Equipment['status']) => setStatus(value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="in-use">In Use</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                    <SelectItem value="unavailable">Unavailable</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Storage location"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cost">Cost ($)</Label>
                            <Input
                                id="cost"
                                type="number"
                                value={cost}
                                onChange={(e) => setCost(e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="purchaseDate">Purchase Date</Label>
                        <Input
                            id="purchaseDate"
                            type="date"
                            value={purchaseDate}
                            onChange={(e) => setPurchaseDate(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Additional notes"
                            rows={2}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!name.trim() || !category.trim()}>
                        {equipment ? 'Update' : 'Add'} Equipment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
