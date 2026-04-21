import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  ClipboardList,
  Crown,
  Settings2,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react'
import { PageHeader, PageShell } from '@/components/layout/PageShell'
import { PendingBackendCard } from '@/components/common/PendingBackendCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { Badge } from '@/components/ui/badge'
import { getLeaderboard } from '@/lib/api/endpoints'
import { useAuth } from '@/lib/auth/AuthProvider'

export default function AdminDashboard() {
  const { session } = useAuth()
  const leaderboardQuery = useQuery({
    queryKey: ['leaderboard', 5],
    queryFn: () => getLeaderboard(5),
  })

  const firstName = session?.displayName?.split(' ')[0] ?? 'Admin'

  return (
    <PageShell>
      <PageHeader
        title={`Admin console - ${firstName}`}
        description="Provision accounts, review engagement and jump into system tools. Several stats are pending new backend endpoints."
        icon={<ShieldCheck className="h-5 w-5" />}
        actions={
          <>
            <Button asChild>
              <Link to="/admin/create-user">
                <UserPlus className="h-4 w-4" />
                Create user
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/users">
                <Users className="h-4 w-4" />
                All users
              </Link>
            </Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PendingBackendCard
          title="Total users"
          endpoint="GET /api/v1/stats/overview"
          description="Grand total and breakdown by role (CHEW, DOCTOR, ADMIN)."
        />
        <PendingBackendCard
          title="Total patients"
          endpoint="GET /api/v1/stats/overview"
          description="Unique patients in the system."
        />
        <PendingBackendCard
          title="Visits today"
          endpoint="GET /api/v1/stats/overview"
          description="Submitted by any CHEW in the last 24h."
        />
        <PendingBackendCard
          title="Outcomes today"
          endpoint="GET /api/v1/stats/overview"
          description="ADMIT/REFER/DISCHARGE recorded today."
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="card-hover lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-600" />
              User provisioning
            </CardTitle>
            <CardDescription>
              Create new CHEW, Doctor or Admin accounts. Managed by{' '}
              <code>POST /api/v1/users</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <Button asChild variant="outline">
              <Link to="/admin/create-user">
                <UserPlus className="h-4 w-4" />
                Create user
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/users">
                <ClipboardList className="h-4 w-4" />
                Browse users
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/tools">
                <Settings2 className="h-4 w-4" />
                Admin tools
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-brand-600" />
                  Top CHEWs
                </CardTitle>
                <CardDescription>Live leaderboard - no backend gaps.</CardDescription>
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
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            ) : !leaderboardQuery.data?.length ? (
              <EmptyState title="No CHEW activity yet" />
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
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {entry.chewName}
                        </p>
                        <Badge variant="outline" className="mt-1 text-[10px] font-mono">
                          {entry.chewId}
                        </Badge>
                      </div>
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

      <section className="mt-8">
        <PendingBackendCard
          title="System health overview"
          endpoint="GET /api/v1/stats/overview + /actuator/health"
          description="Ties Spring Actuator to the admin console: DB, Redis, Groq, disk, heap, uptime and the JWT expiry curve."
        />
      </section>
    </PageShell>
  )
}
