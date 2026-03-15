import { authFetch } from '@/lib/api'

export interface SearchResult {
  id: string
  workspace_id: string
  resource_type: string
  resource_id: string
  title: string
  content: string | null
  created_at: string
  updated_at: string
}

export interface SearchFilters {
  type?: string
  workspaceId?: string
  dateFrom?: string
  dateTo?: string
}

export async function searchResources(
  query: string,
  filters?: SearchFilters,
  limit = 20
): Promise<SearchResult[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit) })

  if (filters?.type) params.set('type', filters.type)
  if (filters?.workspaceId) params.set('workspaceId', filters.workspaceId)
  if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.set('dateTo', filters.dateTo)

  try {
    return await authFetch<SearchResult[]>(`/api/search?${params.toString()}`)
  } catch {
    return []
  }
}

const RECENT_SEARCHES_KEY = 'collab-recent-searches'
const MAX_RECENT = 8

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]')
  } catch {
    return []
  }
}

export function addRecentSearch(query: string): void {
  const recent = getRecentSearches().filter((s) => s !== query)
  recent.unshift(query)
  localStorage.setItem(
    RECENT_SEARCHES_KEY,
    JSON.stringify(recent.slice(0, MAX_RECENT))
  )
}

export function clearRecentSearches(): void {
  localStorage.removeItem(RECENT_SEARCHES_KEY)
}
