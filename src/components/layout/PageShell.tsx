import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageShellProps {
  children: ReactNode
  className?: string
  /** Opt out of the inner max-w container if you need full-bleed layouts. */
  bleed?: boolean
}

/**
 * Animated wrapper applied to every authenticated page body.
 * Keeps a consistent motion language across the app.
 */
export function PageShell({ children, className, bleed = false }: PageShellProps) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className={cn('w-full', className)}
    >
      {bleed ? (
        children
      ) : (
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      )}
    </motion.main>
  )
}

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  icon?: ReactNode
}

export function PageHeader({ title, description, actions, icon }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div className="flex items-start gap-3">
        {icon ? (
          <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
            {icon}
          </span>
        ) : null}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground-default sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm text-[color:var(--color-muted-foreground)]">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  )
}
