// API Configuration
// Points to NestJS backend

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

// Helper for API calls
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `API Error: ${response.status}`)
  }

  return response.json()
}

// Auth helpers
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('access_token', token)
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('access_token')
}
