"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Task {
    id: string
    title: string
    status: 'todo' | 'in-progress' | 'done'
    priority: 'low' | 'medium' | 'high'
    description: string
}

export interface ProjectData {
    projectName: string
    description: string
    version: string
    tasks: Task[]
    notes: string
}

interface ProjectContextType {
    projectData: ProjectData | null
    importData: (json: string) => { success: boolean; message: string }
    clearData: () => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectDataProvider({ children }: { children: React.ReactNode }) {
    const [projectData, setProjectData] = useState<ProjectData | null>(null)
    const [mounted, setMounted] = useState(false)

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('projectData')
        if (stored) {
            try {
                setProjectData(JSON.parse(stored))
            } catch (e) {
                console.error("Failed to parse stored project data", e)
            }
        }
        setMounted(true)
    }, [])

    // Save to localStorage when changed
    useEffect(() => {
        if (mounted) {
            if (projectData) {
                localStorage.setItem('projectData', JSON.stringify(projectData))
            } else {
                localStorage.removeItem('projectData')
            }
        }
    }, [projectData, mounted])

    const importData = (json: string): { success: boolean; message: string } => {
        try {
            const parsed = JSON.parse(json)
            
            // Basic validation
            if (!parsed.projectName || !Array.isArray(parsed.tasks)) {
                return { success: false, message: "Invalid format: Missing projectName or tasks array." }
            }

            setProjectData(parsed)
            return { success: true, message: "Project data imported successfully!" }
        } catch (e) {
            return { success: false, message: "Invalid JSON format." }
        }
    }

    const clearData = () => {
        setProjectData(null)
    }

    // Prevent hydration mismatch
    if (!mounted) {
        return <>{children}</>
    }

    return (
        <ProjectContext.Provider value={{ projectData, importData, clearData }}>
            {children}
        </ProjectContext.Provider>
    )
}

export function useProjectContext() {
    const context = useContext(ProjectContext)
    if (context === undefined) {
        throw new Error('useProjectContext must be used within ProjectDataProvider')
    }
    return context
}
