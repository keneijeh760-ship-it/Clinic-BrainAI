import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
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
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { RiskBadge } from '@/components/common/RiskBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { PendingBackendCard } from '@/components/common/PendingBackendCard'
import { isNotImplemented, useMyVisits } from './hooks'
import { formatDate } from '@/lib/utils'

const PAGE_SIZE = 10

export default function PatientVisits() {
  const [page, setPage] = useState(0)
  const visitsQuery = useMyVisits(page, PAGE_SIZE)

  const data = visitsQuery.data
  const visitsMissing = isNotImplemented(visitsQuery.error)
  const visits = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <PageShell>
      <PageHeader
        title="My visits"
        description="Every visit a CHEW has submitted for you, newest first."
        icon={<ClipboardList className="h-5 w-5" />}
        actions={
          <Button asChild variant="ghost">
            <Link to="/patient">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>
            Tap any row to see vitals, the AI summary and the doctor's outcome.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {visitsQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : visitsMissing ? (
            <PendingBackendCard
              title="Patient visit history"
              endpoint="GET /api/v1/me/visits?page=&size="
              description="Must return a Page<MyVisitSummaryDto> filtered to the logged-in patient."
            />
          ) : visits.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="h-5 w-5" />}
              title="No visits yet"
              description="Your visits will appear here once a CHEW submits one."
              action={
                <Button asChild size="sm">
                  <Link to="/patient/request">Request a visit</Link>
                </Button>
              }
            />
          ) : (
            <>
              <ul className="divide-y divide-border">
                {visits.map((v) => (
                  <li key={v.visitId} className="py-3">
                    <Link
                      to={`/patient/visits/${v.visitId}`}
                      className="group flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground-default">
                            {v.chiefComplaint || 'Visit'}
                          </span>
                          {v.hasOutcome ? (
                            <Badge variant="outline" className="text-[10px]">
                              {v.outcomeDecision ?? 'Outcome'}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-xs text-[color:var(--color-muted-foreground)]">
                          {formatDate(v.visitTime)}
                          {v.locationName ? ` · ${v.locationName}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {v.riskLevel ? <RiskBadge level={v.riskLevel} /> : null}
                        <ArrowRight className="h-4 w-4 text-[color:var(--color-muted-foreground)] transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              {totalPages > 1 ? (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-[color:var(--color-muted-foreground)]">
                    Page <strong>{(data?.page ?? page) + 1}</strong> of{' '}
                    <strong>{totalPages}</strong> · {data?.totalElements} total
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page + 1 >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </PageShell>
  )
}
