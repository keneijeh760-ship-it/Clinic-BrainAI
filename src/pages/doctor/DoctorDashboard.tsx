import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  ClipboardCheck,
  ListChecks,
  Search,
  Stethoscope,
  Trophy,
} from 'lucide-react'
import { PageHeader, PageShell } from '@/components/layout/PageShell'
import { StatCard } from '@/components/common/StatCard'
import { PendingBackendCard } from '@/components/common/PendingBackendCard'
import { EmptyState } from '@/components/common/EmptyState'
import { RiskBadge } from '@/components/common/RiskBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getLeaderboard } from '@/lib/api/endpoints'
import { useAuth } from '@/lib/auth/AuthProvider'
import { SCRATCH_KEYS, useScratch } from '@/lib/sessionScratch'
import type { DoctorPatientViewDto } from '@/lib/api/types'

export default function DoctorDashboard() {
  const { session } = useAuth()
  const [lastLookup] = useScratch<DoctorPatientViewDto>(SCRATCH_KEYS.lastDoctorLookup)
  const leaderboardQuery = useQuery({
    queryKey: ['leaderboard', 5],
    queryFn: () => getLeaderboard(5),
  })

  const firstName = session?.displayName?.split(' ')[0] ?? 'Doctor'

  return (
    <PageShell>
      <PageHeader
        title={`Welcome, Dr. ${firstName}`}
        description="Look up a patient by QR or token, review the AI summary and log the outcome."
        icon={<Stethoscope className="h-5 w-5" />}
        actions={
          <Button asChild>
            <Link to="/doctor/lookup">
              <Search className="h-4 w-4" />
              Look up patient
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PendingBackendCard
          title="Pending review queue"
          endpoint="GET /api/v1/visits/pending-review"
          description="Unassigned visits awaiting doctor outcome."
        />
        <StatCard
          label="Session lookups"
          value={lastLookup ? '1' : '0'}
          hint="Resets when the tab closes"
          icon={<Search className="h-5 w-5" />}
        />
        <PendingBackendCard
          title="My outcomes today"
          endpoint="GET /api/v1/outcomes/mine?since=today"
          description="Count of ADMIT/REFER/DISCHARGE logged today."
        />
        <StatCard
          label="Top CHEW points"
          value={
            leaderboardQuery.isLoading
              ? '...'
              : leaderboardQuery.data?.[0]?.totalPoints ?? '—'
          }
          hint={leaderboardQuery.data?.[0]?.chewName ?? 'Live leaderboard'}
          icon={<Trophy className="h-5 w-5" />}
          accent="neutral"
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-brand-500 text-white">
                <Search className="h-4 w-4" />
              </span>
              Open a patient
            </CardTitle>
            <CardDescription>
              Upload a QR image or paste the token. You&apos;ll see vitals, the AI summary
              and a one-tap outcome form.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto">
              <Link to="/doctor/lookup">
                Start lookup
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-brand-600" />
              Last lookup
            </CardTitle>
            <CardDescription>In-memory preview from this browser tab.</CardDescription>
          </CardHeader>
          <CardContent>
            {lastLookup ? (
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">
                    {lastLookup.firstName} {lastLookup.lastName}
                  </p>
                  <p className="line-clamp-2 text-xs text-[color:var(--color-muted-foreground)]">
                    {lastLookup.chiefComplaint ?? 'No chief complaint recorded'}
                  </p>
                  <RiskBadge level={lastLookup.riskLevel} />
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/doctor/patient/${encodeURIComponent(lastLookup.qrToken)}`}>
                    Reopen
                  </Link>
                </Button>
              </div>
            ) : (
              <EmptyState
                icon={<ListChecks className="h-5 w-5" />}
                title="No recent lookups"
                description="Use the lookup tool above to pull up a patient."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top CHEWs this week</CardTitle>
                <CardDescription>Encourage the highest submitters.</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/leaderboard">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {leaderboardQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !leaderboardQuery.data?.length ? (
              <EmptyState title="No data yet" />
            ) : (
              <ul className="divide-y divide-border">
                {leaderboardQuery.data.map((entry, idx) => (
                  <li
                    key={entry.chewId}
                    className="flex items-center justify-between py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium">{entry.chewName}</span>
                    </div>
                    <span className="text-sm font-semibold text-brand-700">
                      {entry.totalPoints} pts
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </PageShell>
  )
}
