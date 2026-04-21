import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Label } from './label'

interface FieldProps {
  label?: string
  htmlFor?: string
  hint?: ReactNode
  error?: string | null
  required?: boolean
  className?: string
  children: ReactNode
}

/**
 * Tiny wrapper that pairs a Label + Input + error/hint text.
 * Using this instead of the full shadcn <Form> keeps dependencies lighter
 * while still giving us consistent form rhythm.
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <Label htmlFor={htmlFor} className="flex items-center gap-1">
          <span>{label}</span>
          {required ? <span className="text-brand-600">*</span> : null}
        </Label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs font-medium text-brand-700">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[color:var(--color-muted-foreground)]">{hint}</p>
      ) : null}
    </div>
  )
}
