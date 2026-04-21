import axios, { AxiosError, type AxiosInstance } from 'axios'
import type { ApiError } from './types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || '/api/v1'

export const TOKEN_STORAGE_KEY = 'nhis.token'

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 20000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token && !config.headers?.Authorization) {
    config.headers = config.headers ?? {}
    ;(config.headers as Record<string, string>).Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Subscribers can listen for 401 (unauthorized) to force-logout the session.
 * AuthProvider hooks into this in its effect.
 */
type UnauthorizedListener = () => void
const unauthorizedListeners = new Set<UnauthorizedListener>()

export function onUnauthorized(fn: UnauthorizedListener): () => void {
  unauthorizedListeners.add(fn)
  return () => unauthorizedListeners.delete(fn)
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Drop token and notify subscribers. Anyone calling a protected endpoint
      // without a valid token ends up here.
      try {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
      } catch {
        // ignore storage failures (private mode, etc.)
      }
      for (const listener of unauthorizedListeners) listener()
    }
    return Promise.reject(error)
  }
)

/** Normalize an AxiosError into a human-readable message for toasts/forms. */
export function extractErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiError | undefined
    if (data?.detail) return data.detail
    if (data?.title) return data.title
    if (data?.message) return data.message
    if (data?.errors) {
      const first = Object.entries(data.errors)[0]
      if (first) return `${first[0]}: ${first[1]}`
    }
    if (err.message) return err.message
  } else if (err instanceof Error) {
    return err.message
  }
  return fallback
}
