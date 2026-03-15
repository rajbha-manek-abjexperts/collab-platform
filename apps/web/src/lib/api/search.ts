import { getClient, unwrap } from '@/lib/api'

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
  const supabase = getClient()

  let request = supabase
    .from('search_index')
    .select('*')
    .textSearch('searchable_content', query, { type: 'websearch' })
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (filters?.type) {
    request = request.eq('resource_type', filters.type)
  }
  if (filters?.workspaceId) {
    request = request.eq('workspace_id', filters.workspaceId)
  }
  if (filters?.dateFrom) {
    request = request.gte('created_at', filters.dateFrom)
  }
  if (filters?.dateTo) {
    request = request.lte('created_at', filters.dateTo)
  }

  return unwrap(await request)
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
