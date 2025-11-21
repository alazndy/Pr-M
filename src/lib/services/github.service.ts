export interface GitHubRepo {
    id: number
    name: string
    full_name: string
    description: string | null
    html_url: string
    topics: string[]
    updated_at: string
}

export const GithubService = {
    async getUserRepositories(token: string): Promise<GitHubRepo[]> {
        try {
            const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch repositories')
            }

            return await response.json()
        } catch (error) {
            console.error('Error fetching GitHub repos:', error)
            throw error
        }
    }
}
