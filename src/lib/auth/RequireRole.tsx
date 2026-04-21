import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import type { UserRole } from '@/lib/api/types'
import { homePathFor } from './jwt'

interface Props {
  allow: UserRole[]
}

export function RequireRole({ allow }: Props) {
  const { role, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!role) return <Navigate to="/unauthorized" replace />
  if (!allow.includes(role)) return <Navigate to={homePathFor(role)} replace />

  return <Outlet />
}
