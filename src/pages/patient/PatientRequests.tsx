import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock,
  XCircle,
} from 'lucide-react'
import { PageHeader, PageShell } from '@/components/layout/PageShell'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { PendingBackendCard } from '@/components/common/PendingBackendCard'
import { isNotImplemented, useMyVisitRequests } from './hooks'
import { formatDate } from '@/lib/utils'
import { SCRATCH_KEYS, useScratch } from '@/lib/sessionScratch'
import type { VisitRequestDto, VisitRequestStatus } from '@/lib/api/types'

const STATUS_META: Record<
  VisitRequestStatus,
  { label: string; tone: string; Icon: typeof CheckCircle2 }
> = {
  PENDING: {
    label: 'Pending',
    tone: 'bg-amber-50 text-amber-700 border-amber-200',
    Icon: Clock,
  },
  ACCEPTED: {
    label: 'Accepted',
    tone: 'bg-flag-green-500/10 text-flag-green-600 border-flag-green-500/30',
    Icon: CheckCircle2,
  },
  DECLINED: {
    label: 'Declined',
    tone: 'bg-brand-50 text-brand-700 border-brand-200',
    Icon: XCircle,
  },
  CONVERTED: {
    label: 'Visit scheduled',
    tone: 'bg-sky-50 text-sky-700 border-sky-200',
    Icon: CheckCircle2,
  },
}

function StatusBadge({ status }: { status: VisitRequestStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.PENDING
  const Icon = meta.Icon
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${meta.tone}`}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  )
}

export default function PatientRequests() {
  const query = useMyVisitRequests()
  const [lastLocal] = useScratch<VisitRequestDto>(SCRATCH_KEYS.lastVisitRequest)
  const requestsMissing = isNotImplemented(query.error)

  // If the backend isn't wired up yet, fall back to the most recent
  // request we created in this tab so the UI still feels alive.
  const requests: VisitRequestDto[] = requestsMissing
    ? lastLocal
      ? [lastLocal]
      : []
    : query.data ?? []

  return (
    <PageShell>
      <PageHeader
        title="My visit requests"
        description="Status of requests you've sent to NHIS. Updates in real time as CHEWs respond."
        icon={<ClipboardList className="h-5 w-5" />}
        actions={
          <>
            <Button asChild variant="ghost">
              <Link to="/patient">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button asChild>
              <Link to="/patient/request">
                <CalendarClock className="h-4 w-4" />
                New request
              </Link>
            </Button>
          </>
        }
      />

      {requestsMissing ? (
        <PendingBackendCard
          title="Visit requests list"
          endpoint="GET /api/v1/me/visit-requests"
          description="Returns all requests created by the logged-in patient, newest first."
        />
      ) : null}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All requests</CardTitle>
          <CardDescription>
            Every request you have submitted, newest first. Declined or converted
            requests stay visible for your records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {query.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="h-5 w-5" />}
              title="No requests yet"
              description="When you need care but can't make it to a clinic, send a request and a CHEW will reach out."
              action={
                <Button asChild size="sm">
                  <Link to="/patient/request">Send a request</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {requests.map((r) => (
                <motion.li
                  key={r.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {r.urgency}
                      </Badge>
                      <StatusBadge status={r.status} />
                      <span className="text-xs text-[color:var(--color-muted-foreground)]">
                        {formatDate(r.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold">{r.preferredLocation}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-[color:var(--color-muted-foreground)]">
                      {r.description}
                    </p>
                    {r.convertedVisitId ? (
                      <p className="mt-1 text-xs text-flag-green-600">
                        Scheduled as visit{' '}
                        <Link
                          to={`/patient/visits/${r.convertedVisitId}`}
                          className="font-semibold underline"
                        >
                          #{r.convertedVisitId}
                        </Link>
                      </p>
                    ) : null}
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </PageShell>
  )
}
