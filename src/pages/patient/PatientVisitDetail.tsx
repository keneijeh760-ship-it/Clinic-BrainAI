import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  MapPin,
  Sparkles,
  Stethoscope,
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
import { isNotImplemented, useMyVisit } from './hooks'
import { extractErrorMessage } from '@/lib/api/client'
import { formatDate } from '@/lib/utils'
import { SCRATCH_KEYS, writeScratch } from '@/lib/sessionScratch'
import type { VitalsDto, MyVisitSummaryDto } from '@/lib/api/types'

function VitalsTable({ vitals }: { vitals?: VitalsDto | null }) {
  const rows: [string, string][] = [
    [
      'Blood pressure',
      vitals?.bloodPressureSystolic != null && vitals?.bloodPressureDiastolic != null
        ? `${vitals.bloodPressureSystolic} / ${vitals.bloodPressureDiastolic} mmHg`
        : '—',
    ],
    ['Temperature', vitals?.temperature != null ? `${vitals.temperature} °C` : '—'],
    ['Pulse', vitals?.pulse != null ? `${vitals.pulse} bpm` : '—'],
    [
      'Respiratory rate',
      vitals?.respiratoryRate != null ? `${vitals.respiratoryRate} /min` : '—',
    ],
    [
      'Oxygen saturation',
      vitals?.oxygenSaturation != null ? `${vitals.oxygenSaturation}%` : '—',
    ],
  ]
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-border">
          {rows.map(([label, value]) => (
            <tr key={label} className="odd:bg-surface-soft">
              <td className="px-4 py-2 text-[color:var(--color-muted-foreground)]">
                {label}
              </td>
              <td className="px-4 py-2 font-semibold">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function PatientVisitDetail() {
  const params = useParams<{ visitId: string }>()
  const visitId = params.visitId ? Number(params.visitId) : undefined
  const query = useMyVisit(visitId)
  const visitMissing = isNotImplemented(query.error)

  // Pin this visit as the "last viewed" so the dashboard card can surface it.
  useEffect(() => {
    if (!query.data) return
    const summary: MyVisitSummaryDto = {
      visitId: query.data.visitId,
      qrToken: query.data.qrToken,
      visitTime: query.data.visitTime,
      locationName: query.data.locationName,
      chiefComplaint: query.data.chiefComplaint,
      riskLevel: query.data.riskLevel,
      hasOutcome: !!query.data.outcome,
      outcomeDecision: query.data.outcome?.decision,
    }
    writeScratch(SCRATCH_KEYS.lastPatientVisitViewed, summary)
  }, [query.data])

  return (
    <PageShell>
      <PageHeader
        title="Visit detail"
        description="Everything recorded for this visit, including the doctor's outcome."
        icon={<Stethoscope className="h-5 w-5" />}
        actions={
          <Button asChild variant="ghost">
            <Link to="/patient/visits">
              <ArrowLeft className="h-4 w-4" />
              Back to visits
            </Link>
          </Button>
        }
      />

      {query.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : visitMissing ? (
        <PendingBackendCard
          title="Patient visit detail"
          endpoint="GET /api/v1/me/visits/{visitId}"
          description="Returns MyVisitDetailDto scoped to the logged-in patient."
        />
      ) : query.isError ? (
        <EmptyState
          icon={<AlertTriangle className="h-5 w-5" />}
          title="Could not load this visit"
          description={extractErrorMessage(query.error, 'Unknown error')}
          action={
            <Button asChild variant="outline">
              <Link to="/patient/visits">Back to visits</Link>
            </Button>
          }
        />
      ) : query.data ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">
                      {query.data.chiefComplaint || 'Visit'}
                    </CardTitle>
                    <CardDescription>{formatDate(query.data.visitTime)}</CardDescription>
                  </div>
                  {query.data.riskLevel ? (
                    <RiskBadge level={query.data.riskLevel} size="lg" />
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {query.data.locationName ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand-600" />
                    <span>{query.data.locationName}</span>
                  </div>
                ) : null}
                {query.data.capturedBy ? (
                  <p className="text-xs text-[color:var(--color-muted-foreground)]">
                    Captured by <strong>{query.data.capturedBy.name}</strong>
                  </p>
                ) : null}
                {query.data.qrToken ? (
                  <div className="pt-1">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {query.data.qrToken}
                    </Badge>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vitals</CardTitle>
              </CardHeader>
              <CardContent>
                <VitalsTable vitals={query.data.vitals} />
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand-600" />
                  AI clinical summary
                </CardTitle>
                <CardDescription>
                  What the AI flagged for the reviewing clinician.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {query.data.aiSummary ? (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="whitespace-pre-wrap text-sm leading-relaxed"
                  >
                    {query.data.aiSummary}
                  </motion.p>
                ) : (
                  <p className="text-sm text-[color:var(--color-muted-foreground)]">
                    AI summary not available for this visit.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-brand-600" />
                  Doctor's outcome
                </CardTitle>
                <CardDescription>
                  The final decision logged by the reviewing doctor.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {query.data.outcome ? (
                  <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-soft p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-flag-green-500" />
                    <div>
                      <p className="text-sm font-semibold">
                        {query.data.outcome.decision}
                      </p>
                      {query.data.outcome.note ? (
                        <p className="mt-1 whitespace-pre-wrap text-sm text-[color:var(--color-muted-foreground)]">
                          {query.data.outcome.note}
                        </p>
                      ) : null}
                      {query.data.outcome.recordedAt ? (
                        <p className="mt-2 text-xs text-[color:var(--color-muted-foreground)]">
                          Recorded {formatDate(query.data.outcome.recordedAt)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[color:var(--color-muted-foreground)]">
                    No outcome has been logged for this visit yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </PageShell>
  )
}
