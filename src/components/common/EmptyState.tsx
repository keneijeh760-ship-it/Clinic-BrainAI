import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-white px-6 py-10 text-center',
        className
      )}
    >
      {icon ? (
        <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-500">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-foreground-default">{title}</h3>
      {description ? (
        <p className="max-w-md text-sm text-[color:var(--color-muted-foreground)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
