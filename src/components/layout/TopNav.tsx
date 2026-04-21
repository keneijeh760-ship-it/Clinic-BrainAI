import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, Menu, Trophy } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import type { UserRole } from '@/lib/api/types'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn, initials } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  roles: UserRole[]
}

const NAV_ITEMS: NavItem[] = [
  { to: '/chew', label: 'Dashboard', roles: ['CHEW'] },
  { to: '/chew/new-patient', label: 'New patient', roles: ['CHEW'] },
  { to: '/chew/new-visit', label: 'New visit', roles: ['CHEW'] },

  { to: '/doctor', label: 'Dashboard', roles: ['DOCTOR'] },
  { to: '/doctor/lookup', label: 'Lookup', roles: ['DOCTOR'] },

  { to: '/admin', label: 'Dashboard', roles: ['ADMIN'] },
  { to: '/admin/users', label: 'Users', roles: ['ADMIN'] },
  { to: '/admin/create-user', label: 'Create user', roles: ['ADMIN'] },
  { to: '/admin/tools', label: 'Tools', roles: ['ADMIN'] },

  { to: '/leaderboard', label: 'Leaderboard', roles: ['CHEW', 'DOCTOR', 'ADMIN'] },
]

function useVisibleNavItems(role?: UserRole): NavItem[] {
  if (!role) return []
  return NAV_ITEMS.filter((item) => item.roles.includes(role))
}

interface NavLinkItemProps {
  to: string
  label: string
  onSelect?: () => void
}

function DesktopNavLink({ to, label }: NavLinkItemProps) {
  return (
    <NavLink
      to={to}
      end={to === '/chew' || to === '/doctor' || to === '/admin'}
      className={({ isActive }) =>
        cn(
          'relative px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'text-brand-700'
            : 'text-[color:var(--color-muted-foreground)] hover:text-foreground-default'
        )
      }
    >
      {({ isActive }) => (
        <span className="relative inline-flex flex-col items-center">
          <span>{label}</span>
          {isActive ? (
            <motion.span
              layoutId="topnav-underline"
              className="absolute -bottom-[10px] h-0.5 w-full rounded-full bg-brand-500"
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            />
          ) : null}
        </span>
      )}
    </NavLink>
  )
}

function MobileNavLink({ to, label, onSelect }: NavLinkItemProps) {
  return (
    <NavLink
      to={to}
      onClick={onSelect}
      end={to === '/chew' || to === '/doctor' || to === '/admin'}
      className={({ isActive }) =>
        cn(
          'flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium',
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-foreground-default hover:bg-surface-muted'
        )
      }
    >
      {label}
    </NavLink>
  )
}

export function TopNav() {
  const { session, role, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const visible = useVisibleNavItems(role)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <NavLink to={role ? `/${role.toLowerCase()}` : '/'} className="shrink-0">
          <Logo />
        </NavLink>

        <nav className="ml-4 hidden flex-1 items-center gap-1 md:flex" aria-label="Primary">
          {visible.map((item) => (
            <DesktopNavLink key={item.to} to={item.to} label={item.label} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => navigate('/leaderboard')}
            aria-label="Leaderboard"
          >
            <Trophy className="h-4 w-4 text-brand-500" />
            <span className="hidden lg:inline">Leaderboard</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 pr-3"
                aria-label="User menu"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback>{initials(session?.displayName)}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[10rem] truncate text-left sm:inline">
                  {session?.displayName ?? 'Account'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="normal-case">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-foreground-default">
                    {session?.displayName ?? 'Account'}
                  </span>
                  {session?.email ? (
                    <span className="truncate text-xs font-normal text-[color:var(--color-muted-foreground)]">
                      {session.email}
                    </span>
                  ) : null}
                  {role ? (
                    <Badge variant="outline" className="w-fit text-[10px]">
                      {role}
                    </Badge>
                  ) : null}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate('/leaderboard')}>
                <Trophy className="h-4 w-4" />
                Leaderboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-brand-700 focus:bg-brand-50 focus:text-brand-700"
                onSelect={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-xs">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1" aria-label="Mobile primary">
                {visible.map((item) => (
                  <MobileNavLink
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    onSelect={() => setMobileOpen(false)}
                  />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* subtle red accent strip below nav */}
      <div
        aria-hidden
        className="h-[3px] w-full bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700"
        key={location.pathname}
      />
    </header>
  )
}
