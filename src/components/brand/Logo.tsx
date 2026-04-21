import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  variant?: 'default' | 'white'
  withWordmark?: boolean
}

/**
 * NHIS logo: a rounded red square holding a white EKG/pulse line, paired with
 * an "NHIS" wordmark. Uses inline SVG so we can recolor for dark hero sections.
 */
export function Logo({ className, variant = 'default', withWordmark = true }: LogoProps) {
  const mark = variant === 'white' ? 'white' : 'var(--color-brand-500)'
  const line = variant === 'white' ? 'var(--color-brand-500)' : 'white'

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className="relative grid h-9 w-9 place-items-center rounded-[10px] shadow-sm"
        style={{ backgroundColor: mark }}
        aria-hidden
      >
        <svg viewBox="0 0 40 40" className="h-6 w-6">
          <path
            d="M4 22 H13 L16 14 L20 30 L24 10 L28 22 H36"
            fill="none"
            stroke={line}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {withWordmark ? (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              'text-lg font-extrabold tracking-tight',
              variant === 'white' ? 'text-white' : 'text-foreground-default'
            )}
          >
            NHIS
          </span>
          <span
            className={cn(
              'text-[10px] font-medium uppercase tracking-[0.18em]',
              variant === 'white'
                ? 'text-white/70'
                : 'text-[color:var(--color-muted-foreground)]'
            )}
          >
            Health Intelligence
          </span>
        </span>
      ) : null}
    </span>
  )
}
