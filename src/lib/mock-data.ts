// Centralized mock data for development and testing

export type FileItem = {
    id: string
    name: string
    type: "folder" | "file"
    size?: string
    modified: string
}

export type Asset = {
    id: string
    name: string
    type: "3d" | "design" | "hmi"
    preview: string
    status: "approved" | "review" | "draft"
}

export type BudgetCategory = {
    id: string
    name: string
    allocated: number
    spent: number
    color: string
}

export type Expense = {
    id: string
    title: string
    amount: number
    category: string
    date: string
    description: string
    status: "approved" | "pending" | "rejected"
}

export const mockFiles: FileItem[] = [
    { id: "1", name: "Project Alpha", type: "folder", modified: "2024-03-10" },
    { id: "2", name: "Marketing Assets", type: "folder", modified: "2024-03-12" },
    { id: "3", name: "Design Specs.pdf", type: "file", size: "2.4 MB", modified: "2024-03-15" },
    { id: "4", name: "Logo.svg", type: "file", size: "15 KB", modified: "2024-03-14" },
    { id: "5", name: "Meeting Notes.docx", type: "file", size: "12 KB", modified: "2024-03-11" },
]

export const mockAssets: Asset[] = [
    { id: "1", name: "Engine Block V8", type: "3d", preview: "bg-blue-100", status: "approved" },
    { id: "2", name: "Dashboard UI v2", type: "design", preview: "bg-purple-100", status: "review" },
    { id: "3", name: "Control Panel Logic", type: "hmi", preview: "bg-green-100", status: "draft" },
    { id: "4", name: "Chassis Mount", type: "3d", preview: "bg-blue-100", status: "approved" },
    { id: "5", name: "Mobile App Flow", type: "design", preview: "bg-purple-100", status: "approved" },
    { id: "6", name: "Sensor Array", type: "hmi", preview: "bg-green-100", status: "review" },
]

export const mockBudgetCategories: BudgetCategory[] = [
    { id: "1", name: "Development", allocated: 50000, spent: 32000, color: "bg-blue-500" },
    { id: "2", name: "Design", allocated: 25000, spent: 18000, color: "bg-purple-500" },
    { id: "3", name: "Marketing", allocated: 30000, spent: 22000, color: "bg-green-500" },
    { id: "4", name: "Infrastructure", allocated: 20000, spent: 12000, color: "bg-orange-500" },
    { id: "5", name: "Operations", allocated: 15000, spent: 9000, color: "bg-pink-500" },
]

export const mockExpenses: Expense[] = [
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
