"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Box, Image as ImageIcon, Cpu, Filter } from "lucide-react"

type Asset = {
    id: string
    name: string
    type: "3d" | "design" | "hmi"
    preview: string
    status: "approved" | "review" | "draft"
}

const mockAssets: Asset[] = [
    { id: "1", name: "Engine Block V8", type: "3d", preview: "bg-blue-100", status: "approved" },
    { id: "2", name: "Dashboard UI v2", type: "design", preview: "bg-purple-100", status: "review" },
    { id: "3", name: "Control Panel Logic", type: "hmi", preview: "bg-green-100", status: "draft" },
    { id: "4", name: "Chassis Mount", type: "3d", preview: "bg-blue-100", status: "approved" },
    { id: "5", name: "Mobile App Flow", type: "design", preview: "bg-purple-100", status: "approved" },
    { id: "6", name: "Sensor Array", type: "hmi", preview: "bg-green-100", status: "review" },
]

export default function AssetsPage() {
    const [filter, setFilter] = useState("all")

    const filteredAssets = filter === "all"
        ? mockAssets
        : mockAssets.filter(asset => asset.type === filter)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Assets</h2>
                    <p className="text-muted-foreground">Browse and manage project assets.</p>
                </div>
                <Button>
                    <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                <Tabs defaultValue="all" className="w-[400px]" onValueChange={setFilter}>
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="3d">3D Models</TabsTrigger>
                        <TabsTrigger value="design">Design</TabsTrigger>
                        <TabsTrigger value="hmi">HMI</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search assets..." className="pl-8" />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
                {filteredAssets.map((asset) => (
                    <Card key={asset.id} className="overflow-hidden group cursor-pointer">
                        <div className={`h-40 w-full ${asset.preview} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                            {asset.type === "3d" && <Box className="h-12 w-12 text-blue-500 opacity-50" />}
                            {asset.type === "design" && <ImageIcon className="h-12 w-12 text-purple-500 opacity-50" />}
                            {asset.type === "hmi" && <Cpu className="h-12 w-12 text-green-500 opacity-50" />}
                        </div>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold">{asset.name}</h3>
                                    <p className="text-sm text-muted-foreground capitalize">{asset.type} Asset</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium
                  ${asset.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                  ${asset.status === 'review' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                  ${asset.status === 'draft' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' : ''}
                `}>
                                    {asset.status}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
