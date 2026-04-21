import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function Card({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border border-border bg-white shadow-sm',
          className
        )}
        {...props}
      />
    )
  }
)

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-1.5 px-6 pt-6 pb-3', className)}
        {...props}
      />
    )
  }
)

export const CardTitle = forwardRef<HTMLDivElement, HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ className, ...props }, ref) {
    return (
      <h3
        ref={ref}
        className={cn('text-base font-semibold leading-none tracking-tight', className)}
        {...props}
      />
    )
  }
)

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function CardDescription({ className, ...props }, ref) {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-[color:var(--color-muted-foreground)]', className)}
        {...props}
      />
    )
  }
)

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardContent({ className, ...props }, ref) {
    return <div ref={ref} className={cn('px-6 pb-6 pt-0', className)} {...props} />
  }
)

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex items-center px-6 pb-6 pt-0', className)}
        {...props}
      />
    )
  }
)
