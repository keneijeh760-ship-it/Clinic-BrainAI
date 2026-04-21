import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: ReactNode
  value: ReactNode
  hint?: ReactNode
  icon?: ReactNode
  accent?: 'brand' | 'green' | 'neutral'
  className?: string
}

const accentClasses: Record<NonNullable<StatCardProps['accent']>, string> = {
  brand: 'bg-brand-50 text-brand-600',
  green: 'bg-emerald-50 text-emerald-700',
  neutral: 'bg-surface-muted text-foreground-default',
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = 'brand',
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border bg-white p-5 shadow-sm',
        'card-hover',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-muted-foreground)]">
            {label}
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground-default">
            {value}
          </p>
          {hint ? (
            <p className="mt-1 text-xs text-[color:var(--color-muted-foreground)]">{hint}</p>
          ) : null}
        </div>
        {icon ? (
          <span
            className={cn(
              'grid h-11 w-11 place-items-center rounded-lg',
              accentClasses[accent]
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <span
        aria-hidden
        className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-brand-500 transition-transform duration-300 group-hover:scale-x-100"
      />
    </motion.div>
  )
}
