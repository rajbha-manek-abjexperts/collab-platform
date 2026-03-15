import { createClient } from '@/lib/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Returns a Supabase client instance for API calls.
 * Centralizes client creation so all API modules use the same factory.
 */
export function getClient(): SupabaseClient {
  return createClient()
}

/**
 * Unwraps a Supabase response, throwing an ApiError on failure.
 */
export function unwrap<T>(response: { data: T | null; error: { message: string; code?: string } | null }): T {
  if (response.error) {
    throw new ApiError(response.error.message, response.error.code)
  }
  return response.data as T
}
