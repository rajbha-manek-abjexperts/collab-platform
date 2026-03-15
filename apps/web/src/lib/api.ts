// API Configuration
// Points to NestJS backend

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

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

// Authenticated API fetch - automatically includes Bearer token
export async function authFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken()
  return apiFetch<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}

// Upload helper for multipart form data (file uploads)
export async function authUpload<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const token = getAuthToken()
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }))
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
