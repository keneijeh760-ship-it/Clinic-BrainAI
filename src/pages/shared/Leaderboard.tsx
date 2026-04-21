import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Crown, Medal, Trophy } from 'lucide-react'
import { PageHeader, PageShell } from '@/components/layout/PageShell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { getLeaderboard } from '@/lib/api/endpoints'
import type { LeaderboardEntryDto } from '@/lib/api/types'
import { cn, initials } from '@/lib/utils'

const SIZES = [10, 25, 50]

function Podium({ top }: { top: LeaderboardEntryDto[] }) {
  // order: 2nd, 1st, 3rd so 1st is center
  const slots = [
    { rank: 2, entry: top[1], heightClass: 'h-36', icon: Medal, color: 'bg-surface-muted text-foreground-default' },
    { rank: 1, entry: top[0], heightClass: 'h-44', icon: Crown, color: 'bg-brand-500 text-white' },
    { rank: 3, entry: top[2], heightClass: 'h-28', icon: Medal, color: 'bg-brand-200 text-brand-800' },
  ]
  return (
    <div className="grid grid-cols-3 items-end gap-4 sm:gap-8">
      {slots.map(({ rank, entry, heightClass, icon: Icon, color }, idx) => (
        <motion.div
          key={rank}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: 'spring',
            stiffness: 220,
            damping: 22,
            delay: 0.12 * (idx === 1 ? 0 : idx === 0 ? 1 : 2),
          }}
          className="flex flex-col items-center gap-2"
        >
          {entry ? (
            <>
              <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-500 text-sm font-bold text-white">
                {initials(entry.chewName)}
              </div>
              <p className="max-w-[10ch] truncate text-center text-sm font-semibold">
                {entry.chewName}
              </p>
              <p className="text-xs text-[color:var(--color-muted-foreground)]">
                {entry.totalPoints} pts
              </p>
            </>
          ) : (
            <p className="text-xs text-[color:var(--color-muted-foreground)]">—</p>
          )}
          <div
            className={cn(
              'flex w-full items-start justify-center rounded-t-lg pt-3 text-sm font-extrabold shadow-sm',
              heightClass,
              color
            )}
          >
            <span className="flex items-center gap-1">
              <Icon className="h-4 w-4" />
              {rank}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default function Leaderboard() {
  const [size, setSize] = useState(10)
  const query = useQuery({
    queryKey: ['leaderboard', size],
    queryFn: () => getLeaderboard(size),
  })

  const top = query.data?.slice(0, 3) ?? []
  const rest = query.data?.slice(3) ?? []

  return (
    <PageShell>
      <PageHeader
        title="CHEW Leaderboard"
        description="Points are earned from quality visit submissions. Refreshed when you change the page size."
        icon={<Trophy className="h-5 w-5" />}
        actions={
          <Select value={String(size)} onValueChange={(v) => setSize(Number(v))}>
            <SelectTrigger className="w-[128px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SIZES.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  Top {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Podium</CardTitle>
          <CardDescription>Top 3 CHEWs by lifetime points.</CardDescription>
        </CardHeader>
        <CardContent>
          {query.isLoading ? (
            <div className="grid grid-cols-3 items-end gap-4">
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-44 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ) : top.length === 0 ? (
            <EmptyState
              title="No CHEW activity yet"
              description="Once CHEWs start submitting visits, the podium will light up."
            />
          ) : (
            <Podium top={top} />
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Full ranking</CardTitle>
          <CardDescription>
            Ranks 4 and below. Includes patient and visit counts for context.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {query.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : rest.length === 0 ? (
            <EmptyState title="Only the podium so far" />
          ) : (
            <ul className="divide-y divide-border">
              {rest.map((entry, idx) => (
                <motion.li
                  key={entry.chewId}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * idx }}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-surface-muted text-xs font-bold">
                      {idx + 4}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{entry.chewName}</p>
                      <p className="text-[11px] text-[color:var(--color-muted-foreground)]">
                        <code>{entry.chewId}</code>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[color:var(--color-muted-foreground)]">
                    <Badge variant="outline">{entry.totalPatientsCaptured} patients</Badge>
                    <Badge variant="outline">{entry.visitCount} visits</Badge>
                    <span className="min-w-[60px] text-right text-sm font-semibold text-brand-700">
                      {entry.totalPoints} pts
                    </span>
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
