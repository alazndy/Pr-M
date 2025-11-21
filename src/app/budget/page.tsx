"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Plus,
    Search,
    AlertCircle,
    CheckCircle2,
    Calendar,
    Tag,
} from "lucide-react"
import { cn } from "@/lib/utils"

type BudgetCategory = {
    id: string
    name: string
    allocated: number
    spent: number
    color: string
}

type Expense = {
    id: string
    title: string
    amount: number
    category: string
    date: string
    description: string
    status: "approved" | "pending" | "rejected"
}

const mockCategories: BudgetCategory[] = [
    { id: "1", name: "Development", allocated: 50000, spent: 32000, color: "bg-blue-500" },
    { id: "2", name: "Design", allocated: 25000, spent: 18000, color: "bg-purple-500" },
    { id: "3", name: "Marketing", allocated: 30000, spent: 22000, color: "bg-green-500" },
    { id: "4", name: "Infrastructure", allocated: 20000, spent: 12000, color: "bg-orange-500" },
    { id: "5", name: "Operations", allocated: 15000, spent: 9000, color: "bg-pink-500" },
]

const mockExpenses: Expense[] = [
    {
        id: "1",
        title: "Cloud Hosting - AWS",
        amount: 4500,
        category: "Infrastructure",
        date: "2024-03-15",
        description: "Monthly AWS hosting costs",
        status: "approved"
    },
    {
        id: "2",
        title: "UI/UX Design License",
        amount: 2500,
        category: "Design",
        date: "2024-03-14",
        description: "Figma annual subscription",
        status: "approved"
    },
    {
        id: "3",
        title: "Marketing Campaign",
        amount: 8000,
        category: "Marketing",
        date: "2024-03-13",
        description: "Q1 social media campaign",
        status: "pending"
    },
    {
        id: "4",
        title: "Development Tools",
        amount: 1200,
        category: "Development",
        date: "2024-03-12",
        description: "JetBrains licenses",
        status: "approved"
    },
]

export default function BudgetPage() {
    const [categories, setCategories] = useState<BudgetCategory[]>(mockCategories)
    const [expenses, setExpenses] = useState<Expense[]>(mockExpenses)
    const [searchQuery, setSearchQuery] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [newExpense, setNewExpense] = useState({
        title: "",
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split('T')[0]
    })

    const totalBudget = categories.reduce((sum, cat) => sum + cat.allocated, 0)
    const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0)
    const totalRemaining = totalBudget - totalSpent
    const spentPercentage = (totalSpent / totalBudget) * 100

    const filteredExpenses = expenses.filter(expense =>
        expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleAddExpense = () => {
        if (newExpense.title && newExpense.amount && newExpense.category) {
            const expense: Expense = {
                id: Date.now().toString(),
                title: newExpense.title,
                amount: parseFloat(newExpense.amount),
                category: newExpense.category,
                date: newExpense.date,
                description: newExpense.description,
                status: "pending"
            }
            setExpenses([expense, ...expenses])

            // Update category spent amount
            setCategories(categories.map(cat => {
                if (cat.name === newExpense.category) {
                    return { ...cat, spent: cat.spent + parseFloat(newExpense.amount) }
                }
                return cat
            }))

            setNewExpense({
                title: "",
                amount: "",
                category: "",
                description: "",
                date: new Date().toISOString().split('T')[0]
            })
            setDialogOpen(false)
            alert("Expense added successfully!")
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved": return "text-green-500 bg-green-500/10"
            case "pending": return "text-yellow-500 bg-yellow-500/10"
            case "rejected": return "text-red-500 bg-red-500/10"
            default: return "text-gray-500 bg-gray-500/10"
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Budget Management</h2>
                    <p className="text-muted-foreground">Track and manage your project budgets.</p>
                </div>
                <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Expense
                </Button>
            </div>

            {/* Budget Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalBudget.toLocaleString('en-US')}</div>
                        <p className="text-xs text-muted-foreground">Allocated across {categories.length} categories</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalSpent.toLocaleString('en-US')}</div>
                        <p className="text-xs text-muted-foreground">{spentPercentage.toFixed(1)}% of total budget</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalRemaining.toLocaleString('en-US')}</div>
                        <p className="text-xs text-muted-foreground">{(100 - spentPercentage).toFixed(1)}% available</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{expenses.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {expenses.filter(e => e.status === "pending").length} pending approval
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Category Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Budget by Category</CardTitle>
                    <CardDescription>Allocation and spending across categories</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {categories.map((category) => {
                        const percentage = (category.spent / category.allocated) * 100
                        const remaining = category.allocated - category.spent
                        const isOverBudget = category.spent > category.allocated

                        return (
                            <div key={category.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-3 h-3 rounded-full", category.color)} />
                                        <span className="font-medium">{category.name}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        ${category.spent.toLocaleString('en-US')} / ${category.allocated.toLocaleString('en-US')}
                                    </div>
                                </div>
                                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full transition-all",
                                            category.color,
                                            isOverBudget && "bg-red-500"
                                        )}
                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className={cn(
                                        "text-muted-foreground",
                                        isOverBudget && "text-red-500 font-medium"
                                    )}>
                                        {percentage.toFixed(1)}% used
                                    </span>
                                    <span className={cn(
                                        isOverBudget ? "text-red-500" : "text-green-500"
                                    )}>
                                        ${Math.abs(remaining).toLocaleString('en-US')} {isOverBudget ? "over" : "remaining"}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            {/* Expenses List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Recent Expenses</CardTitle>
                            <CardDescription>Track all your project expenses</CardDescription>
                        </div>
                        <div className="relative w-72">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search expenses..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredExpenses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium">No expenses found</p>
                            <p className="text-sm text-muted-foreground">
                                {searchQuery ? "Try a different search term" : "Add your first expense to get started"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredExpenses.map((expense) => (
                                <div
                                    key={expense.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="font-medium">{expense.title}</h4>
                                            <span className={cn(
                                                "text-xs px-2 py-1 rounded-full capitalize",
                                                getStatusColor(expense.status)
                                            )}>
                                                {expense.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{expense.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Tag className="h-3 w-3" />
                                                {expense.category}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(expense.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold">${expense.amount.toLocaleString('en-US')}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Expense Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Expense</DialogTitle>
                        <DialogDescription>
                            Record a new expense for your project budget.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Cloud Hosting"
                                value={newExpense.title}
                                onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Amount ($) *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="0.00"
                                    value={newExpense.amount}
                                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={newExpense.date}
                                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                value={newExpense.category}
                                onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.name}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Add details about this expense..."
                                value={newExpense.description}
                                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddExpense}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Expense
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
