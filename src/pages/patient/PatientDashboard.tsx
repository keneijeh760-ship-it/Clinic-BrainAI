import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  Download,
  FileText,
  HeartPulse,
  QrCode,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { PageHeader, PageShell } from '@/components/layout/PageShell'
import { StatCard } from '@/components/common/StatCard'
import { EmptyState } from '@/components/common/EmptyState'
import { PendingBackendCard } from '@/components/common/PendingBackendCard'
import { LinkedRecordBanner } from '@/components/common/LinkedRecordBanner'
import { RiskBadge } from '@/components/common/RiskBadge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/lib/auth/AuthProvider'
import { SCRATCH_KEYS, useScratch } from '@/lib/sessionScratch'
import { isNotImplemented, useMyProfile, useMyVisits } from './hooks'
import type { MyVisitSummaryDto, VisitRequestDto } from '@/lib/api/types'
import { formatDate } from '@/lib/utils'

export default function PatientDashboard() {
  const { session } = useAuth()
  const profileQuery = useMyProfile()
  const visitsQuery = useMyVisits(0, 5)
  const [lastViewed] = useScratch<MyVisitSummaryDto>(
    SCRATCH_KEYS.lastPatientVisitViewed
  )
  const [lastRequest] = useScratch<VisitRequestDto>(SCRATCH_KEYS.lastVisitRequest)

  const firstName = session?.displayName?.split(' ')[0] ?? 'there'
  const profile = profileQuery.data
  const profileMissing = isNotImplemented(profileQuery.error)
  const linked = !!profile?.patient

  const visits = visitsQuery.data?.content ?? []
  const visitsMissing = isNotImplemented(visitsQuery.error)
  const totalVisits = visitsQuery.data?.totalElements
  const latest = visits[0] ?? null

  return (
    <PageShell>
      <PageHeader
        title={`Hello, ${firstName}`}
        description="Your personal health hub. Your record is powered by NHIS - updated every time you visit a clinic."
        icon={<HeartPulse className="h-5 w-5" />}
        actions={
          <>
            <Button asChild>
              <Link to="/patient/request">
                <CalendarClock className="h-4 w-4" />
                Request a visit
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/patient/qr">
                <QrCode className="h-4 w-4" />
                My Health QR
              </Link>
            </Button>
          </>
        }
      />

      {/* Linked record status */}
      {profileQuery.isLoading ? (
        <Skeleton className="h-20 w-full rounded-xl" />
      ) : profileMissing ? (
        <PendingBackendCard
          title="Clinical record status"
          endpoint="GET /api/v1/me/profile"
          description="Will return { user, patient } so the dashboard can show whether a PatientEntity is linked yet."
        />
      ) : (
        <LinkedRecordBanner linked={linked} />
      )}

      {/* Stat tiles */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Visits on record"
          value={
            visitsQuery.isLoading
              ? '...'
              : visitsMissing
                ? '—'
                : totalVisits ?? visits.length
          }
          hint={
            visitsMissing
              ? 'Needs GET /me/visits'
              : linked
                ? 'Across all clinics'
                : 'Your first visit will appear here'
          }
          icon={<ClipboardList className="h-5 w-5" />}
        />
        <StatCard
          label="Latest risk level"
          value={
            visitsQuery.isLoading
              ? '...'
              : latest?.riskLevel ? (
                  <RiskBadge level={latest.riskLevel} />
                ) : (
                  '—'
                )
          }
          hint={
            latest
              ? formatDate(latest.visitTime)
              : 'Recorded by clinicians during a visit'
          }
          icon={<Sparkles className="h-5 w-5" />}
          accent="green"
        />
        <StatCard
          label="Latest outcome"
          value={
            visitsQuery.isLoading
              ? '...'
              : latest?.outcomeDecision ?? (latest?.hasOutcome ? 'Recorded' : '—')
          }
          hint={
            latest?.hasOutcome
              ? 'Tap a visit to see details'
              : 'Doctors log outcomes per visit'
          }
          icon={<FileText className="h-5 w-5" />}
          accent="neutral"
        />
        <StatCard
          label="Open requests"
          value={lastRequest ? lastRequest.status : '0'}
          hint={
            lastRequest
              ? `Last request · ${formatDate(lastRequest.createdAt)}`
              : 'Request a visit when you need care'
          }
          icon={<CalendarClock className="h-5 w-5" />}
        />
      </section>

      {/* Primary CTAs */}
      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashCta
          icon={<QrCode className="h-4 w-4" />}
          title="My Health QR"
          description="Download, print, or show at any clinic for instant hand-off."
          to="/patient/qr"
          accent="brand"
        />
        <DashCta
          icon={<CalendarClock className="h-4 w-4" />}
          title="Request a visit"
          description="Describe what's wrong - a CHEW will reach out."
          to="/patient/request"
          accent="green"
        />
        <DashCta
          icon={<UserRound className="h-4 w-4" />}
          title="Update my profile"
          description="Keep address, phone and DOB current so CHEWs can pre-fill."
          to="/patient/profile"
          accent="brand"
        />
        <DashCta
          icon={<Download className="h-4 w-4" />}
          title="Export my record"
          description="Download a JSON or PDF copy of your full history."
          to="/patient/export"
          accent="neutral"
        />
      </section>

      {/* Recent visits */}
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent visits</CardTitle>
                <CardDescription>
                  Your five most recent visits. Tap any one to see the full details.
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/patient/visits">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {visitsQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : visitsMissing ? (
              <PendingBackendCard
                title="Patient visit history"
                endpoint="GET /api/v1/me/visits"
                description="Returns a paginated list of visits for the logged-in patient."
              />
            ) : visits.length === 0 ? (
              <EmptyState
                icon={<ClipboardList className="h-5 w-5" />}
                title={linked ? 'No visits yet' : 'No clinical record yet'}
                description={
                  linked
                    ? 'Your visits will appear here once a CHEW submits one.'
                    : 'Your record is created and linked on your first clinic visit.'
                }
                action={
                  <Button asChild size="sm">
                    <Link to="/patient/request">Request a visit</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y divide-border">
                {visits.map((v) => (
                  <li
                    key={v.visitId}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {v.chiefComplaint || 'Visit'}
                      </p>
                      <p className="text-xs text-[color:var(--color-muted-foreground)]">
                        {formatDate(v.visitTime)}
                        {v.locationName ? ` · ${v.locationName}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {v.riskLevel ? <RiskBadge level={v.riskLevel} /> : null}
                      <Button asChild size="sm" variant="ghost">
                        <Link to={`/patient/visits/${v.visitId}`}>
                          Open
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last viewed</CardTitle>
            <CardDescription>Shown only while this tab is open.</CardDescription>
          </CardHeader>
          <CardContent>
            {lastViewed ? (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[color:var(--color-muted-foreground)]">
                    {formatDate(lastViewed.visitTime)}
                  </span>
                  {lastViewed.riskLevel ? (
                    <RiskBadge level={lastViewed.riskLevel} />
                  ) : null}
                </div>
                <p className="text-sm font-semibold">
                  {lastViewed.chiefComplaint || 'Visit'}
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link to={`/patient/visits/${lastViewed.visitId}`}>
                    Re-open visit
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </motion.div>
            ) : (
              <EmptyState
                icon={<ClipboardList className="h-5 w-5" />}
                title="No recent activity this session"
                description="Open a visit from the list to pin it here for quick access."
              />
            )}
          </CardContent>
        </Card>
      </section>

      {/* Pending-backend reminders */}
      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        {profileMissing ? (
          <PendingBackendCard
            title="Profile endpoint"
            endpoint="GET/PATCH /api/v1/me/profile"
          />
        ) : null}
        {visitsMissing ? (
          <PendingBackendCard
            title="Visit history"
            endpoint="GET /api/v1/me/visits?page=&size="
          />
        ) : null}
        <PendingBackendCard
          title="Visit requests"
          endpoint="POST /api/v1/me/visit-requests"
          description="Lets patients ask for a visit without being at a clinic."
        />
      </section>
    </PageShell>
  )
}

interface DashCtaProps {
  icon: React.ReactNode
  title: string
  description: string
  to: string
  accent: 'brand' | 'green' | 'neutral'
}

function DashCta({ icon, title, description, to, accent }: DashCtaProps) {
  const accentBg =
    accent === 'green'
      ? 'bg-flag-green-500'
      : accent === 'neutral'
        ? 'bg-surface-muted text-foreground-default'
        : 'bg-brand-500'
  return (
    <Link
      to={to}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white p-5 shadow-sm card-hover"
    >
      <div className="flex items-center gap-3">
        <span
          className={`grid h-9 w-9 place-items-center rounded-lg ${accentBg} ${
            accent === 'neutral' ? '' : 'text-white'
          }`}
        >
          {icon}
        </span>
        <h3 className="text-sm font-bold text-foreground-default">{title}</h3>
      </div>
      <p className="mt-2 text-xs text-[color:var(--color-muted-foreground)]">
        {description}
      </p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 transition-transform group-hover:translate-x-0.5">
        Open
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  )
}
