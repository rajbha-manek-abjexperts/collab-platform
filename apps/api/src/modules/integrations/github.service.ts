import { Injectable, Logger } from '@nestjs/common'

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  private: boolean
  html_url: string
  description: string
  default_branch: string
}

interface GitHubLink {
  documentId: string
  repoName: string
  branch: string
  filePath: string
}

@Injectable()
export class GitHubService {
  private readonly logger = new Logger(GitHubService.name)
  private accessToken: string
  private baseUrl = 'https://api.github.com'
  private linkedDocs: Map<string, GitHubLink> = new Map()

  constructor() {
    this.accessToken = process.env.GITHUB_ACCESS_TOKEN || ''
  }

  private async fetchGitHub(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.accessToken) {
      throw new Error('GitHub access token not configured')
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    return response.json()
  }

  async listRepos(): Promise<GitHubRepo[]> {
    if (!this.accessToken) {
      // Return demo repos for testing
      return [
        { id: 1, name: 'my-project', full_name: 'user/my-project', private: false, html_url: 'https://github.com/user/my-project', description: 'My main project', default_branch: 'main' },
        { id: 2, name: 'collab-platform', full_name: 'user/collab-platform', private: false, html_url: 'https://github.com/user/collab-platform', description: 'Collaboration platform', default_branch: 'main' },
        { id: 3, name: 'docs', full_name: 'user/docs', private: true, html_url: 'https://github.com/user/docs', description: 'Private documentation', default_branch: 'main' }
      ]
    }

    try {
      const repos = await this.fetchGitHub('/user/repos?per_page=100&sort=updated')
      return repos.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        private: repo.private,
        html_url: repo.html_url,
        description: repo.description,
        default_branch: repo.default_branch
      }))
    } catch (error) {
      this.logger.error('Failed to fetch repos:', error)
      return []
    }
  }

  async searchRepos(query: string): Promise<GitHubRepo[]> {
    if (!this.accessToken) {
      const allRepos = await this.listRepos()
      return allRepos.filter(r => 
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.description?.toLowerCase().includes(query.toLowerCase())
      )
    }

    try {
      const results = await this.fetchGitHub(`/search/repositories?q=${encodeURIComponent(query)}+user:${encodeURIComponent(process.env.GITHUB_USER || 'self')}`)
      return results.items.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        private: repo.private,
        html_url: repo.html_url,
        description: repo.description,
        default_branch: repo.default_branch
      }))
    } catch (error) {
      this.logger.error('Failed to search repos:', error)
      return []
    }
  }

  async linkDocument(link: GitHubLink): Promise<boolean> {
    this.linkedDocs.set(link.documentId, link)
    return true
  }

  async getDocumentLink(documentId: string): Promise<GitHubLink | null> {
    return this.linkedDocs.get(documentId) || null
  }

  async syncToRepo(link: GitHubLink, content: string): Promise<boolean> {
    if (!this.accessToken) {
      this.logger.warn('GitHub token not configured, skipping sync')
      return false
    }

    try {
      const contentEncoded = Buffer.from(content).toString('base64')
      
      // Check if file exists
      let sha: string | undefined
      try {
        const existing = await this.fetchGitHub(`/repos/${link.repoName}/contents/${link.filePath}?ref=${link.branch}`)
        sha = existing.sha
      } catch {
        // File doesn't exist, will create new
      }

      await this.fetchGitHub(`/repos/${link.repoName}/contents/${link.filePath}`, {
        method: 'PUT',
        body: JSON.stringify({
          message: `Update document from Collab Platform`,
          content: contentEncoded,
          branch: link.branch,
          ...(sha && { sha })
        })
      })

      return true
    } catch (error) {
      this.logger.error('Failed to sync to GitHub:', error)
      return false
    }
  }

  async getFileContent(repo: string, path: string, branch: string): Promise<string> {
    if (!this.accessToken) {
      return ''
    }

    try {
      const file = await this.fetchGitHub(`/repos/${repo}/contents/${path}?ref=${branch}`)
      return Buffer.from(file.content, 'base64').toString('utf-8')
    } catch (error) {
      this.logger.error('Failed to get file content:', error)
      return ''
    }
  }
}
