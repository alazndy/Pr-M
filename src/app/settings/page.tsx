"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Bell, Moon, User, Shield, Globe, Code } from "lucide-react"
import { useMockDataContext } from "@/contexts/MockDataContext"
import { useProjectContext } from "@/contexts/ProjectContext"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"

function ImportForm() {
    const { importData } = useProjectContext()
    const [jsonInput, setJsonInput] = useState("")
    const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null)

    const handleImport = () => {
        if (!jsonInput.trim()) return
        const result = importData(jsonInput)
        setStatus(result)
        if (result.success) {
            setJsonInput("")
        }
    }

    return (
        <div className="space-y-4">
            <Textarea 
                placeholder="Paste JSON here..." 
                className="font-mono text-xs min-h-[200px]"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
            />
            <div className="flex items-center justify-between">
                <Button onClick={handleImport} disabled={!jsonInput.trim()}>
                    Import Data
                </Button>
                {status && (
                    <div className={`flex items-center gap-2 text-sm ${status.success ? 'text-green-600' : 'text-red-600'}`}>
                        {status.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        {status.message}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function SettingsPage() {
    const { useMockData, setUseMockData } = useMockDataContext()
    
    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-5 lg:w-[500px]">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="developer">Developer</TabsTrigger>
                    <TabsTrigger value="data">Data</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your photo and personal details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src="/placeholder-user.jpg" />
                                    <AvatarFallback>UN</AvatarFallback>
                                </Avatar>
                                <Button variant="outline">Change Avatar</Button>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">First Name</label>
                                    <Input defaultValue="User" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Last Name</label>
                                    <Input defaultValue="Name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input defaultValue="user@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Role</label>
                                    <Input defaultValue="Administrator" disabled />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button>Save Changes</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>Customize how the application looks on your device.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Moon className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Dark Mode</p>
                                        <p className="text-sm text-muted-foreground">Adjust the appearance to reduce eye strain.</p>
                                    </div>
                                </div>
                                <Switch />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Globe className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Language</p>
                                        <p className="text-sm text-muted-foreground">Select your preferred language.</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">English</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>Configure how you receive alerts.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Bell className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Push Notifications</p>
                                        <p className="text-sm text-muted-foreground">Receive notifications on your desktop.</p>
                                    </div>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Team Activity</p>
                                        <p className="text-sm text-muted-foreground">Notify me when team members make changes.</p>
                                    </div>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Settings</CardTitle>
                            <CardDescription>Manage your account security and authentication.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium">Change Password</h4>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Current Password</label>
                                        <Input type="password" placeholder="Enter current password" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">New Password</label>
                                        <Input type="password" placeholder="Enter new password" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Confirm New Password</label>
                                        <Input type="password" placeholder="Confirm new password" />
                                    </div>
                                </div>
                                <Button>Update Password</Button>
                            </div>
                            <div className="border-t pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Shield className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">Two-Factor Authentication</p>
                                            <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                                        </div>
                                    </div>
                                    <Switch />
                                </div>
                            </div>
                            <div className="border-t pt-6">
                                <h4 className="text-sm font-medium mb-3">Active Sessions</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Windows - Chrome</p>
                                            <p className="text-xs text-muted-foreground">Last active: Now</p>
                                        </div>
                                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            Current
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="developer" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Developer Settings</CardTitle>
                            <CardDescription>Configure development and testing options.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Code className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Use Mock Data</p>
                                        <p className="text-sm text-muted-foreground">
                                            Show sample data in Files, Assets, and Budget pages for development and testing.
                                        </p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={useMockData}
                                    onCheckedChange={setUseMockData}
                                />
                            </div>
                            <div className="border-t pt-6">
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <p className="text-sm font-medium mb-2">ℹ️ About Mock Data</p>
                                    <p className="text-xs text-muted-foreground">
                                        When enabled, sample data will be displayed in certain pages. This is useful for:
                                    </p>
                                    <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                                        <li>Testing UI components without real data</li>
                                        <li>Demonstrating features to stakeholders</li>
                                        <li>Development and debugging</li>
                                    </ul>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Your preference is saved locally and persists across sessions.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="data" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manual Data Import</CardTitle>
                            <CardDescription>Import project data generated by an AI agent.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium mb-2">1. Get the Directive</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Copy this directive and give it to your AI agent to generate the compatible JSON data.
                                    </p>
                                    <div className="relative">
                                        <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap font-mono border">
{`You are an AI assistant helping to manage a project. Please generate a JSON object representing the project data. The JSON must strictly follow this schema:
{
  "projectName": "String",
  "description": "String",
  "version": "String",
  "tasks": [
    {
      "id": "String",
      "title": "String",
      "status": "todo | in-progress | done",
      "priority": "low | medium | high",
      "description": "String"
    }
  ],
  "notes": "String"
}
Ensure the JSON is valid and contains no other text.`}
                                        </pre>
                                        <Button 
                                            size="sm" 
                                            variant="secondary" 
                                            className="absolute top-2 right-2 h-8"
                                            onClick={() => {
                                                navigator.clipboard.writeText(`You are an AI assistant helping to manage a project. Please generate a JSON object representing the project data. The JSON must strictly follow this schema:
{
  "projectName": "String",
  "description": "String",
  "version": "String",
  "tasks": [
    {
      "id": "String",
      "title": "String",
      "status": "todo | in-progress | done",
      "priority": "low | medium | high",
      "description": "String"
    }
  ],
  "notes": "String"
}
Ensure the JSON is valid and contains no other text.`);
                                            }}
                                        >
                                            Copy Directive
                                        </Button>
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h3 className="text-sm font-medium mb-2">2. Paste JSON Output</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Paste the JSON response from the AI agent below.
                                    </p>
                                    <ImportForm />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
