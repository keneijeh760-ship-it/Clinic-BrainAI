import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  CircleUser,
  Loader2,
  Search,
  Settings2,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader, PageShell } from '@/components/layout/PageShell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/field'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RiskBadge } from '@/components/common/RiskBadge'
import { getPatientByQr, getUserById } from '@/lib/api/endpoints'
import { extractErrorMessage } from '@/lib/api/client'
import type { DoctorPatientViewDto, UserResponse } from '@/lib/api/types'
import { calcAge, formatDate } from '@/lib/utils'

export default function AdminTools() {
  const [userIdInput, setUserIdInput] = useState('')
  const [qrInput, setQrInput] = useState('')
  const [user, setUser] = useState<UserResponse | null>(null)
  const [patient, setPatient] = useState<DoctorPatientViewDto | null>(null)

  const userMutation = useMutation({
    mutationFn: (id: number) => getUserById(id),
    onSuccess: setUser,
    onError: (err) => toast.error(extractErrorMessage(err, 'Could not find that user')),
  })

  const patientMutation = useMutation({
    mutationFn: (token: string) => getPatientByQr(token),
    onSuccess: setPatient,
    onError: (err) => toast.error(extractErrorMessage(err, 'Could not find that patient')),
  })

  const submitUser = (e: React.FormEvent) => {
    e.preventDefault()
    const id = Number(userIdInput.trim())
    if (!Number.isFinite(id) || id <= 0) {
      toast.error('Enter a numeric user ID')
      return
    }
    userMutation.mutate(id)
  }

  const submitPatient = (e: React.FormEvent) => {
    e.preventDefault()
    const token = qrInput.trim()
    if (!token) {
      toast.error('Enter a QR token')
      return
    }
    patientMutation.mutate(token)
  }

  return (
    <PageShell>
      <PageHeader
        title="Admin tools"
        description="Spot-check users and patient records without leaving the admin console."
        icon={<Settings2 className="h-5 w-5" />}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleUser className="h-5 w-5 text-brand-600" />
              Find user by ID
            </CardTitle>
            <CardDescription>
              Uses <code>GET /api/v1/users/{'{id}'}</code>. Returns any role.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              onSubmit={submitUser}
              className="flex flex-col gap-3 sm:flex-row sm:items-end"
            >
              <Field label="User ID" htmlFor="user-id" className="flex-1">
                <Input
                  id="user-id"
                  type="number"
                  inputMode="numeric"
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                  placeholder="e.g. 42"
                />
              </Field>
              <Button type="submit" disabled={userMutation.isPending}>
                {userMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Looking...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Find
                  </>
                )}
              </Button>
            </form>
            {user ? (
              <div className="rounded-lg border border-border bg-surface-soft p-4 text-sm">
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-brand-600" />
                  <span className="font-semibold">{user.name}</span>
                  <Badge variant="outline">{user.role}</Badge>
                </div>
                <Separator className="my-2" />
                <div className="grid gap-1 text-xs text-[color:var(--color-muted-foreground)]">
                  <p>Email: {user.email}</p>
                  {user.phoneNumber ? <p>Phone: {user.phoneNumber}</p> : null}
                  {user.staffId ? (
                    <p>
                      Staff ID: <code>{user.staffId}</code>
                    </p>
                  ) : null}
                  <p>Internal ID: {user.id}</p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-brand-600" />
              Find patient by QR token
            </CardTitle>
            <CardDescription>
              Uses <code>GET /api/v1/patients/qr/{'{token}'}</code> and returns the
              same dto the doctor uses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              onSubmit={submitPatient}
              className="flex flex-col gap-3 sm:flex-row sm:items-end"
            >
              <Field label="QR token" htmlFor="qr-input" className="flex-1">
                <Input
                  id="qr-input"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="q_xxxxxxxxxx"
                />
              </Field>
              <Button type="submit" disabled={patientMutation.isPending}>
                {patientMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Looking...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Find
                  </>
                )}
              </Button>
            </form>
            {patient ? (
              <div className="rounded-lg border border-border bg-surface-soft p-4 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {patient.firstName} {patient.lastName}
                    </p>
                    <p className="text-xs text-[color:var(--color-muted-foreground)]">
                      {calcAge(patient.dateOfBirth) ?? '—'} y/o ·{' '}
                      {patient.gender ?? 'Gender unknown'} · ID {patient.patientId}
                    </p>
                  </div>
                  <RiskBadge level={patient.riskLevel} />
                </div>
                <Separator className="my-2" />
                <p className="line-clamp-3 text-xs">
                  {patient.chiefComplaint ?? 'No chief complaint recorded.'}
                </p>
                <p className="mt-2 text-xs text-[color:var(--color-muted-foreground)]">
                  Last visit {formatDate(patient.visitTime)} ·{' '}
                  {patient.locationName ?? 'Unknown location'}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
