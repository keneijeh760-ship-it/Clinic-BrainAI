import type { RiskLevel } from '@/lib/api/types'
import { cn } from '@/lib/utils'
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react'

interface RiskBadgeProps {
  level?: RiskLevel | string | null
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const map: Record<string, {
  label: string
  classes: string
  dot: string
  icon: typeof AlertTriangle
}> = {
  GREEN: {
    label: 'Low risk',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  YELLOW: {
    label: 'Monitor',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    icon: AlertTriangle,
  },
  RED: {
    label: 'Urgent',
    classes: 'bg-brand-50 text-brand-700 border-brand-200',
    dot: 'bg-brand-500 motion-safe:animate-pulse',
    icon: ShieldAlert,
  },
}

export function RiskBadge({ level, className, size = 'md' }: RiskBadgeProps) {
  const key = (level ?? '').toString().toUpperCase()
  const entry = map[key]
  if (!entry) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
          'border-border bg-surface-muted text-[color:var(--color-muted-foreground)]',
          className
        )}
      >
        <span className="h-2 w-2 rounded-full bg-[color:var(--color-muted-foreground)]" />
        Unknown
      </span>
    )
  }
  const Icon = entry.icon
  const sizing =
    size === 'lg'
      ? 'text-sm px-3 py-1'
      : size === 'sm'
        ? 'text-[10px] px-2 py-0.5'
        : 'text-xs px-2.5 py-0.5'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold',
        entry.classes,
        sizing,
        className
      )}
    >
      <Icon className={cn(size === 'lg' ? 'h-4 w-4' : 'h-3 w-3')} />
      {entry.label}
      <span className={cn('h-1.5 w-1.5 rounded-full', entry.dot)} aria-hidden />
    </span>
  )
}
