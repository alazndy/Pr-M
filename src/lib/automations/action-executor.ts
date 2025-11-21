import { AutomationAction } from "@/lib/services/automation.service"
import { NotificationService } from "@/lib/services/notification.service"
import { DriveService } from "@/lib/services/drive.service"

export class ActionExecutor {
    /**
     * Execute a single automation action
     */
    static async executeAction(action: AutomationAction, context: { userId: string, projectId?: string, fileId?: string }) {
        try {
            switch (action.type) {
                case 'notification':
                    await NotificationService.sendInAppNotification(
                        context.userId,
                        action.config,
                        'info'
                    )
                    break

                case 'email':
                    // For now, we assume the config contains the email address or we use a default
                    // In a real app, we'd look up the user's email or parse the config more intelligently
                    await NotificationService.queueEmail(
                        "user@example.com", // Placeholder: In real app, get from user profile
                        "Automation Alert",
                        action.config
                    )
                    break

                case 'file':
                    if (action.config.includes("Mirror") || action.config.includes("Backup")) {
                        if (context.fileId && context.projectId) {
                            // Example: Mirror to a "Backup" folder
                            // We need to find or create a backup folder first
                            // For this MVP, we'll just copy it to the same project folder with a prefix
                            // In a real app, config would specify the destination
                            
                            // We need to get the project folder ID again or pass it in
                            // This is a simplification
                            console.log("Mirroring file:", context.fileId)
                            await DriveService.copyFile(context.fileId, "Backup_" + new Date().toISOString())
                        }
                    }
                    break
            }
        } catch (error) {
            console.error(`Failed to execute action ${action.type}:`, error)
            throw error
        }
    }

    /**
     * Execute a list of actions sequentially
     */
    static async executeAll(actions: AutomationAction[], context: { userId: string, projectId?: string, fileId?: string }) {
        for (const action of actions) {
            await this.executeAction(action, context)
        }
    }
}
