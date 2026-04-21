import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  ClipboardPlus,
  HeartPulse,
  Sparkles,
  Trophy,
  UserPlus,
} from 'lucide-react'
import { PageShell, PageHeader } from '@/components/layout/PageShell'
import { StatCard } from '@/components/common/StatCard'
import { EmptyState } from '@/components/common/EmptyState'
import { PendingBackendCard } from '@/components/common/PendingBackendCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { RiskBadge } from '@/components/common/RiskBadge'
import { getLeaderboard } from '@/lib/api/endpoints'
import { useAuth } from '@/lib/auth/AuthProvider'
import { SCRATCH_KEYS, useScratch } from '@/lib/sessionScratch'
import type { PatientProfileDto, SubmitVisitResponse } from '@/lib/api/types'
import { formatDate } from '@/lib/utils'

export default function ChewDashboard() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [lastPatient] = useScratch<PatientProfileDto>(SCRATCH_KEYS.lastPatient)
  const [lastVisit] = useScratch<SubmitVisitResponse>(SCRATCH_KEYS.lastVisit)

  const leaderboardQuery = useQuery({
    queryKey: ['leaderboard', 50],
    queryFn: () => getLeaderboard(50),
  })

  const me = leaderboardQuery.data?.find(
    (e) => e.chewName === session?.displayName || e.chewName === session?.email
  )
  const myRank =
    me && leaderboardQuery.data
      ? leaderboardQuery.data.findIndex((e) => e.chewId === me.chewId) + 1
      : null

  const firstName = session?.displayName?.split(' ')[0] ?? 'there'

  return (
    <PageShell>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Capture a new patient, submit a visit, or review your ranking. Your recent work stays on this device until the backend adds listing endpoints."
        icon={<HeartPulse className="h-5 w-5" />}
        actions={
          <>
            <Button asChild>
              <Link to="/chew/new-patient">
                <UserPlus className="h-4 w-4" />
                New patient
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/chew/new-visit">
                <ClipboardPlus className="h-4 w-4" />
                New visit
              </Link>
            </Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Visits today"
          value={lastVisit ? '1' : '0'}
          hint={lastVisit ? 'Your most recent submission' : 'None yet this session'}
          icon={<ClipboardPlus className="h-5 w-5" />}
        />
        <StatCard
          label="Patients this session"
          value={lastPatient ? '1+' : '0'}
          hint="Persistent count needs backend"
          icon={<UserPlus className="h-5 w-5" />}
          accent="green"
        />
        <StatCard
          label="My points"
          value={leaderboardQuery.isLoading ? '...' : me?.totalPoints ?? '—'}
          hint={me ? 'Live leaderboard' : 'Submit a visit to earn points'}
          icon={<Sparkles className="h-5 w-5" />}
        />
        <StatCard
          label="Rank"
          value={leaderboardQuery.isLoading ? '...' : myRank ? `#${myRank}` : '—'}
          hint={
            leaderboardQuery.data
              ? `Among ${leaderboardQuery.data.length} CHEWs`
              : undefined
          }
          icon={<Trophy className="h-5 w-5" />}
          accent="neutral"
        />
      </section>

      {/* Primary CTAs */}
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="group relative overflow-hidden card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-brand-500 text-white">
                <UserPlus className="h-4 w-4" />
              </span>
              Register a new patient
            </CardTitle>
            <CardDescription>
              Collect demographics and generate a Health QR to hand off.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto">
              <Link to="/chew/new-patient">
                Register patient
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="group relative overflow-hidden card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-flag-green-500 text-white">
                <ClipboardPlus className="h-4 w-4" />
              </span>
              Submit a visit
            </CardTitle>
            <CardDescription>
              Capture vitals, symptoms and chief complaint. Get an AI summary and risk
              level instantly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/chew/new-visit">
                Start a visit
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Recent activity (in-memory) */}
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Most recent patient</CardTitle>
            <CardDescription>Shown only while this tab is open.</CardDescription>
          </CardHeader>
          <CardContent>
            {lastPatient ? (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">
                    {lastPatient.firstName} {lastPatient.lastName}
                  </p>
                  <p className="text-xs text-[color:var(--color-muted-foreground)]">
                    {lastPatient.phoneNumber ?? 'No phone'} ·{' '}
                    <code className="rounded bg-surface-muted px-1">
                      {lastPatient.qrToken}
                    </code>
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    navigate('/chew/result', {
                      state: { patient: lastPatient },
                    })
                  }
                >
                  View QR
                </Button>
              </div>
            ) : (
              <EmptyState
                icon={<UserPlus className="h-5 w-5" />}
                title="No patients captured yet"
                description="Register your first patient and their Health QR will appear here."
                action={
                  <Button asChild size="sm">
                    <Link to="/chew/new-patient">Register a patient</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most recent visit</CardTitle>
            <CardDescription>In-memory preview of your last submission.</CardDescription>
          </CardHeader>
          <CardContent>
            {lastVisit ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[color:var(--color-muted-foreground)]">
                    {formatDate(new Date())}
                  </span>
                  <RiskBadge level={lastVisit.riskLevel} />
                </div>
                <p className="text-sm">
                  Points earned:{' '}
                  <span className="font-semibold text-brand-700">
                    +{lastVisit.pointsEarned}
                  </span>
                </p>
                <p className="line-clamp-3 text-xs text-[color:var(--color-muted-foreground)]">
                  {lastVisit.aiSummary ?? 'AI summary will appear after the doctor review.'}
                </p>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {lastVisit.qrToken}
                </Badge>
              </div>
            ) : (
              <EmptyState
                icon={<ClipboardPlus className="h-5 w-5" />}
                title="No visits yet"
                description="Submit your first visit to see the AI summary and points earned."
                action={
                  <Button asChild size="sm">
                    <Link to="/chew/new-visit">Start a visit</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <PendingBackendCard
          title="My patient history"
          endpoint="GET /api/v1/patients/mine"
          description="Persistent list of every patient this CHEW registered, newest first. Unlocks search and pagination in the dashboard."
        />
        <PendingBackendCard
          title="My visit history"
          endpoint="GET /api/v1/visits/mine"
          description="Persistent timeline of every visit this CHEW submitted, so the dashboard can show metrics beyond the current session."
        />
      </section>

      {/* Leaderboard snippet */}
      <section className="mt-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top CHEWs</CardTitle>
                <CardDescription>Live from the leaderboard endpoint.</CardDescription>
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
            ) : (leaderboardQuery.data?.length ?? 0) === 0 ? (
              <EmptyState
                title="No CHEWs on the leaderboard yet"
                description="Be the first to submit a visit and earn points."
              />
            ) : (
              <ul className="divide-y divide-border">
                {leaderboardQuery.data!.slice(0, 5).map((entry, idx) => (
                  <li
                    key={entry.chewId}
                    className="flex items-center justify-between gap-3 py-2.5"
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
