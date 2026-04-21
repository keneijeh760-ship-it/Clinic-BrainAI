import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/brand/Logo'
import { useAuth } from '@/lib/auth/AuthProvider'
import { homePathFor } from '@/lib/auth/jwt'

export default function Unauthorized() {
  const { role, logout } = useAuth()
  return (
    <div className="grid min-h-screen place-items-center bg-surface-soft px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-10 text-center shadow-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold">You don&apos;t have access to that page.</h1>
        <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
          Your account role doesn&apos;t permit this resource. If you believe this
          is wrong, contact an administrator.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild>
            <Link to={homePathFor(role)}>Go to dashboard</Link>
          </Button>
          <Button variant="ghost" onClick={() => logout()}>
            Log out
          </Button>
        </div>
      </div>
    </div>
  )
}
