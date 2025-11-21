import { ProjectsService, type ProjectData } from '@/lib/services/projects.service'

/**
 * Migrate projects from localStorage to Firebase Firestore
 */
export async function migrateLocalStorageToFirebase(userId: string): Promise<{
    success: boolean
    migratedCount: number
    error?: string
}> {
    try {
        const localProjects = localStorage.getItem('projects')

        if (!localProjects) {
            return { success: true, migratedCount: 0 }
        }

        const projects = JSON.parse(localProjects) as Array<any>

        let migratedCount = 0

        for (const project of projects) {
            try {
                // Remove the local ID since Firestore will generate new ones
                const { id, createdAt, updatedAt, ...projectData } = project

                await ProjectsService.createProject(userId, projectData)
                migratedCount++
            } catch (error) {
                console.error(`Failed to migrate project ${project.name}:`, error)
            }
        }

        // Clear localStorage after successful migration
        if (migratedCount > 0) {
            localStorage.removeItem('projects')
            console.log(`Successfully migrated ${migratedCount} projects to Firebase`)
        }

        return { success: true, migratedCount }
    } catch (error) {
        console.error('Migration failed:', error)
        return {
            success: false,
            migratedCount: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Check if there are projects in localStorage that need migration
 */
export function hasLocalProjects(): boolean {
    const localProjects = localStorage.getItem('projects')
    if (!localProjects) return false

    try {
        const projects = JSON.parse(localProjects)
        return Array.isArray(projects) && projects.length > 0
    } catch {
        return false
    }
}
