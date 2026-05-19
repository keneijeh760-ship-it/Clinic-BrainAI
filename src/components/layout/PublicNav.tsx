import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/AuthProvider'
import { homePathFor } from '@/lib/auth/jwt'

export type PublicNavPage = 'landing' | 'login' | 'register' | 'register-patient'

interface Props {
  page: PublicNavPage
}

/**
 * Slim sticky top bar shared by all public/auth pages.
 * Matches the visual language of TopNav so the entire app feels consistent.
 */
export function PublicNav({ page }: Props) {
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo always links home */}
        <Link to="/" aria-label="Back to NHIS home" className="shrink-0">
          <Logo />
        </Link>

        <nav className="flex items-center gap-2">
          {page === 'landing' && (
            isAuthenticated ? (
              <Button
                size="sm"
                onClick={() => navigate(homePathFor(role))}
              >
                Open dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Log in
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/register')}
                >
                  Get started
                </Button>
              </>
            )
          )}

          {page === 'login' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/register')}
                className="hidden sm:inline-flex"
              >
                Create CHEW account
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/register/patient')}
              >
                Sign up as patient
              </Button>
            </>
          )}

          {(page === 'register' || page === 'register-patient') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
            >
              Log in
            </Button>
          )}
        </nav>
      </div>

      {/* Brand accent strip — mirrors TopNav */}
      <div
        aria-hidden
        className="h-[3px] w-full bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700"
      />
    </header>
  )
}

/**
 * Small "← Back" link used inside auth page form areas on mobile
 * when the hero panel is hidden.
 */
export function BackToHome({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-1 text-sm font-medium text-[color:var(--color-muted-foreground)] hover:text-foreground-default ${className ?? ''}`}
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Home
    </Link>
  )
}
