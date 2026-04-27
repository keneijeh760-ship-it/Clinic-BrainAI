import { Link } from 'react-router-dom'
import { CheckCircle2, Hourglass } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  linked: boolean
  className?: string
}

/**
 * Shown on the patient portal when the logged-in user has no linked
 * PatientEntity yet. A clinical record is created on the first visit and
 * linked automatically (via email/phone match) - this banner sets that
 * expectation while the dashboard is empty.
 */
export function LinkedRecordBanner({ linked, className }: Props) {
  if (linked) {
    return (
      <div
        role="status"
        className={cn(
          'flex items-start gap-3 rounded-xl border border-flag-green-500/30 bg-flag-green-500/5 p-4 text-sm',
          className
        )}
      >
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-flag-green-600" />
        <div>
          <p className="font-semibold text-flag-green-600">
            Your clinical record is linked.
          </p>
          <p className="mt-0.5 text-xs text-[color:var(--color-muted-foreground)]">
            Everything a CHEW or doctor has recorded about you will appear here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm',
        className
      )}
    >
      <Hourglass className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
      <div>
        <p className="font-semibold text-brand-700">
          We haven't linked a clinical record to your account yet.
        </p>
        <p className="mt-0.5 text-xs text-[color:var(--color-muted-foreground)]">
          Your record will be created on your first clinic visit and connected to this
          account automatically (using your email or phone number). In the meantime, keep
          your{' '}
          <Link to="/patient/profile" className="font-semibold underline">
            profile
          </Link>{' '}
          up to date so CHEWs can pre-fill visits.
        </p>
      </div>
    </div>
  )
}
