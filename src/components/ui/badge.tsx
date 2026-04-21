import { type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-brand-500 text-white',
        secondary:
          'border-border bg-surface-muted text-foreground-default',
        outline:
          'border-brand-500 text-brand-600 bg-white',
        success:
          'border-transparent bg-flag-green-500 text-white',
        warning:
          'border-transparent bg-amber-400 text-amber-950',
        danger:
          'border-transparent bg-brand-600 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { badgeVariants }
