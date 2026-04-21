import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-brand-500 text-white shadow-sm hover:bg-brand-600 active:bg-brand-700 active:translate-y-[1px]',
        secondary:
          'bg-white text-foreground-default border border-border hover:bg-surface-muted',
        outline:
          'border border-brand-500 text-brand-600 bg-transparent hover:bg-brand-50',
        ghost:
          'bg-transparent text-foreground-default hover:bg-surface-muted',
        destructive:
          'bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900',
        success:
          'bg-flag-green-500 text-white hover:bg-flag-green-600',
        link:
          'text-brand-600 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild = false, ...props },
  ref
) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
})

export { buttonVariants }
