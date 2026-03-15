'use client'

import { useState, useEffect } from 'react'
import { Github, Link2, Loader2, Check, Search, RefreshCw, Unlink, Folder } from 'lucide-react'

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  private: boolean
  description: string
  default_branch: string
}

interface GitHubLink {
  documentId: string
  repoName: string
  branch: string
  filePath: string
}

interface GitHubLinkButtonProps {
  documentId: string
  documentTitle: string
}

export default function GitHubLinkButton({ documentId, documentTitle }: GitHubLinkButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(false)
  const [linking, setLinking] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null)
  const [branch, setBranch] = useState('main')
  const [filePath, setFilePath] = useState('')
  const [linked, setLinked] = useState<GitHubLink | null>(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    loadLinkedRepo()
  }, [documentId])

  async function loadLinkedRepo() {
    try {
      const response = await fetch(`http://localhost:3002/api/integrations/github/link/${documentId}`)
      if (response.ok) {
        const data = await response.json()
        setLinked(data)
        if (data.repoName) {
          setSelectedRepo({ id: 0, name: '', full_name: data.repoName, private: false, description: '', default_branch: data.branch } as GitHubRepo)
          setBranch(data.branch)
          setFilePath(data.filePath)
        }
      }
    } catch (err) {
      // Not linked yet
    }
  }

  async function loadRepos() {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3002/api/integrations/github/repos')
      const data = await response.json()
      setRepos(data)
    } catch (err) {
      console.error('Failed to load repos:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleLink() {
    if (!selectedRepo || !filePath) return

    setLinking(true)
    try {
      await fetch('http://localhost:3002/api/integrations/github/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          repoName: selectedRepo.full_name,
          branch,
          filePath
        })
      })
      
      setLinked({
        documentId,
        repoName: selectedRepo.full_name,
        branch,
        filePath
      })
      setIsOpen(false)
    } catch (err) {
      console.error('Failed to link:', err)
    } finally {
      setLinking(false)
    }
  }

  async function handleSync() {
    setSyncing(true)
    try {
      // Get document content from localStorage or API
      const content = localStorage.getItem(`document_${documentId}`)
      await fetch('http://localhost:3002/api/integrations/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          repoName: linked?.repoName,
          branch: linked?.branch,
          filePath: linked?.filePath,
          content: content || '{}'
        })
      })
    } catch (err) {
      console.error('Failed to sync:', err)
    } finally {
      setSyncing(false)
    }
  }

  async function handleUnlink() {
    setLinked(null)
    setSelectedRepo(null)
    setFilePath('')
  }

  const filteredRepos = search 
    ? repos.filter(r => 
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase())
      )
    : repos

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true)
          if (repos.length === 0) loadRepos()
        }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
          linked
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Github className="w-4 h-4" />
        {linked ? 'GitHub Linked' : 'Link to GitHub'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                  <Github className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Link to GitHub</h2>
                  <p className="text-sm text-gray-500">Sync document to a repository</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Repository Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repository
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search repositories..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>
                
                {/* Repo List */}
                <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-gray-200">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    </div>
                  ) : filteredRepos.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No repositories found</div>
                  ) : (
                    filteredRepos.map(repo => (
                      <button
                        key={repo.id}
                        onClick={() => {
                          setSelectedRepo(repo)
                          setBranch(repo.default_branch)
                        }}
                        className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left ${
                          selectedRepo?.id === repo.id ? 'bg-gray-100' : ''
                        }`}
                      >
                        <Folder className="w-4 h-4 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{repo.name}</p>
                          <p className="text-xs text-gray-500 truncate">{repo.description}</p>
                        </div>
                        {repo.private && (
                          <span className="text-xs text-gray-400">Private</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Branch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                  placeholder="main"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>

              {/* File Path */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File Path
                </label>
                <input
                  type="text"
                  value={filePath}
                  onChange={e => setFilePath(e.target.value)}
                  placeholder={`docs/${documentTitle.toLowerCase().replace(/\s+/g, '-')}.md`}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLink}
                disabled={!selectedRepo || !filePath || linking}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {linking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                {linking ? 'Linking...' : 'Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Linked Status & Sync */}
      {linked && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="bg-gray-900 text-white rounded-xl shadow-lg p-3 flex items-center gap-3">
            <Github className="w-4 h-4" />
            <div className="text-sm">
              <p className="font-medium">{linked.repoName}</p>
              <p className="text-gray-400 text-xs">{linked.filePath}</p>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </button>
            <button
              onClick={handleUnlink}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Unlink className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
