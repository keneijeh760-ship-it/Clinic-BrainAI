import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { TOKEN_STORAGE_KEY, onUnauthorized } from '@/lib/api/client'
import type { UserRole } from '@/lib/api/types'
import { clearAllScratch } from '@/lib/sessionScratch'
import { decodeToken, isTokenExpired, type DecodedSession } from './jwt'

interface AuthContextValue {
  session: DecodedSession | null
  role: UserRole | undefined
  isAuthenticated: boolean
  login: (token: string) => DecodedSession | null
  logout: () => void
  /** Allow the caller to patch the displayName (e.g. after successful register). */
  setDisplayName: (name: string) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readInitialSession(): DecodedSession | null {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!raw) return null
    const decoded = decodeToken(raw)
    if (!decoded || isTokenExpired(decoded)) {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      return null
    }
    return decoded
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<DecodedSession | null>(() => readInitialSession())

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    } catch {
      /* ignore */
    }
    clearAllScratch()
    setSession(null)
  }, [])

  const login = useCallback((token: string): DecodedSession | null => {
    const decoded = decodeToken(token)
    if (!decoded) return null
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token)
    } catch {
      /* ignore */
    }
    setSession(decoded)
    return decoded
  }, [])

  const setDisplayName = useCallback((name: string) => {
    setSession((prev) => (prev ? { ...prev, displayName: name } : prev))
  }, [])

  // Listen for 401s from axios. When any API call returns 401, we drop the
  // session so route guards kick the user back to /login.
  useEffect(() => {
    return onUnauthorized(() => setSession(null))
  }, [])

  // Auto-logout on token expiry.
  useEffect(() => {
    if (!session?.exp) return
    const msUntilExpiry = session.exp * 1000 - Date.now()
    if (msUntilExpiry <= 0) {
      logout()
      return
    }
    const id = window.setTimeout(() => logout(), msUntilExpiry)
    return () => window.clearTimeout(id)
  }, [session?.exp, logout])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      role: session?.role,
      isAuthenticated: !!session,
      login,
      logout,
      setDisplayName,
    }),
    [session, login, logout, setDisplayName]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>')
  return ctx
}
