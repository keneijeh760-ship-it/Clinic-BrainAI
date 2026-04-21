import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Search, UserPlus, Users } from 'lucide-react'
import { PageHeader, PageShell } from '@/components/layout/PageShell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PendingBackendCard } from '@/components/common/PendingBackendCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { UserRole } from '@/lib/api/types'

const ROLES: (UserRole | 'ALL')[] = ['ALL', 'CHEW', 'DOCTOR', 'ADMIN']

/**
 * Full table UI for paginated user browsing. The table body shows a disabled
 * placeholder state until GET /api/v1/users is implemented on the backend.
 */
export default function UsersList() {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<UserRole | 'ALL'>('ALL')
  const [page, setPage] = useState(0)
  const size = 20

  const mockHeader = useMemo(
    () => (
      <tr>
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Role</TableHead>
        <TableHead>Staff ID</TableHead>
        <TableHead>Phone</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </tr>
    ),
    []
  )

  return (
    <PageShell>
      <PageHeader
        title="Users"
        description="Paginated user directory. Fetching and filtering waits on a new backend endpoint."
        icon={<Users className="h-5 w-5" />}
        actions={
          <Button asChild>
            <Link to="/admin/create-user">
              <UserPlus className="h-4 w-4" />
              Create user
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Directory</CardTitle>
          <CardDescription>
            Filter by role or search by name, email or staff ID. UI is ready -
            endpoint pending.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r)
                    setPage(0)
                  }}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    role === r
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-border bg-white text-[color:var(--color-muted-foreground)] hover:bg-surface-muted'
                  }`}
                >
                  {r === 'ALL' ? 'All roles' : r}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search
                  aria-hidden
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted-foreground)]"
                />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-64 pl-10"
                />
              </div>
              <Select
                value={String(size)}
                onValueChange={() => {
                  /* size selector is placeholder until endpoint exists */
                }}
              >
                <SelectTrigger className="w-[96px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>{mockHeader}</TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <div className="p-4">
                      <PendingBackendCard
                        title="User directory"
                        endpoint="GET /api/v1/users?page&size&role&q"
                        description="Returns a Spring Page<UserResponse>. The table header, filters, and pagination controls on this screen are already wired up - just swap the placeholder for the data once the endpoint exists."
                      />
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-xs text-[color:var(--color-muted-foreground)]">
            <span>
              Showing <Badge variant="outline">pending</Badge> results
              {role !== 'ALL' ? ` for role ${role}` : ''}
              {search ? ` matching "${search}"` : ''}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <span>Page {page + 1}</span>
              <Button
                variant="outline"
                size="sm"
                disabled
                title="Next page disabled until backend endpoint exists"
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
