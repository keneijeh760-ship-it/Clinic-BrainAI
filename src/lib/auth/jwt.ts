import { jwtDecode } from 'jwt-decode'
import type { UserRole } from '@/lib/api/types'

interface JwtPayload {
  sub?: string
  email?: string
  name?: string
  role?: string
  roles?: string[] | string
  authorities?: string[] | string
  exp?: number
  iat?: number
  [k: string]: unknown
}

export interface DecodedSession {
  token: string
  email?: string
  displayName?: string
  role?: UserRole
  exp?: number
  issuedAt?: number
  raw: JwtPayload
}

function normalizeRole(value: unknown): UserRole | undefined {
  if (!value) return undefined
  const flatten = Array.isArray(value) ? value : [value]
  for (const entry of flatten) {
    if (typeof entry !== 'string') continue
    const upper = entry.toUpperCase().replace(/^ROLE_/, '')
    if (upper === 'CHEW' || upper === 'DOCTOR' || upper === 'ADMIN') {
      return upper
    }
  }
  return undefined
}

export function decodeToken(token: string): DecodedSession | null {
  try {
    const payload = jwtDecode<JwtPayload>(token)
    const role =
      normalizeRole(payload.role) ??
      normalizeRole(payload.roles) ??
      normalizeRole(payload.authorities)
    return {
      token,
      email: typeof payload.email === 'string' ? payload.email : payload.sub,
      displayName:
        typeof payload.name === 'string'
          ? payload.name
          : typeof payload.email === 'string'
            ? payload.email
            : payload.sub,
      role,
      exp: payload.exp,
      issuedAt: payload.iat,
      raw: payload,
    }
  } catch {
    return null
  }
}

export function isTokenExpired(session: DecodedSession | null): boolean {
  if (!session?.exp) return false
  return session.exp * 1000 <= Date.now()
}

export function homePathFor(role?: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return '/admin'
    case 'DOCTOR':
      return '/doctor'
    case 'CHEW':
      return '/chew'
    default:
      return '/'
  }
}
