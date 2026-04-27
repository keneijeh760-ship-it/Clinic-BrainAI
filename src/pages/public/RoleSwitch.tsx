import { Link } from 'react-router-dom'
import { HeartPulse, Stethoscope } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  active: 'chew' | 'patient'
}

/**
 * Small segmented toggle shown at the top of /register and /register/patient.
 * Keeps CHEW public registration and the new patient signup discoverable
 * without losing existing routes or bookmarks.
 */
export function RoleSwitch({ active }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Account type"
      className="inline-flex rounded-xl border border-border bg-white p-1 text-sm shadow-sm"
    >
      <Link
        to="/register"
        role="tab"
        aria-selected={active === 'chew'}
        className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-1.5 font-semibold transition-colors',
          active === 'chew'
            ? 'bg-brand-50 text-brand-700'
            : 'text-[color:var(--color-muted-foreground)] hover:text-foreground-default'
        )}
      >
        <Stethoscope className="h-4 w-4" />
        I'm a CHEW
      </Link>
      <Link
        to="/register/patient"
        role="tab"
        aria-selected={active === 'patient'}
        className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-1.5 font-semibold transition-colors',
          active === 'patient'
            ? 'bg-flag-green-500/10 text-flag-green-600'
            : 'text-[color:var(--color-muted-foreground)] hover:text-foreground-default'
        )}
      >
        <HeartPulse className="h-4 w-4" />
        I'm a patient
      </Link>
    </div>
  )
}
