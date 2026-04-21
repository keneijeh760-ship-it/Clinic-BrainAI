import type { ReactNode } from 'react'
import { Construction } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PendingBackendCardProps {
  title: ReactNode
  /** e.g. "GET /api/v1/patients/mine" */
  endpoint: string
  description?: ReactNode
  className?: string
}

/**
 * Rendered anywhere the UI wants to show data that requires a backend endpoint
 * we haven't built yet. Clearly flags the missing work and cross-references
 * BACKEND_TODO.md at the repo root.
 */
export function PendingBackendCard({
  title,
  endpoint,
  description,
  className,
}: PendingBackendCardProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col gap-2 rounded-xl border border-dashed border-brand-200 bg-brand-50/40 p-5',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/10 text-brand-600">
            <Construction className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-semibold text-foreground-default">{title}</h3>
        </div>
        <Badge variant="outline" className="text-[10px]">
          Pending backend
        </Badge>
      </div>
      {description ? (
        <p className="text-xs text-[color:var(--color-muted-foreground)]">{description}</p>
      ) : null}
      <code className="self-start rounded-md bg-white px-2 py-1 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200">
        {endpoint}
      </code>
      <p className="text-[11px] text-[color:var(--color-muted-foreground)]">
        Tracked in <span className="font-semibold">BACKEND_TODO.md</span> at the repo root.
      </p>
    </div>
  )
}
