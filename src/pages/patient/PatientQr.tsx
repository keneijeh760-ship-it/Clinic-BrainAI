import { Link } from 'react-router-dom'
import { Printer, QrCode } from 'lucide-react'
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
import { QrDisplay } from '@/components/common/QrDisplay'
import { EmptyState } from '@/components/common/EmptyState'
import { PendingBackendCard } from '@/components/common/PendingBackendCard'
import { LinkedRecordBanner } from '@/components/common/LinkedRecordBanner'
import { isNotImplemented, useMyProfile, useMyQr } from './hooks'
import { useAuth } from '@/lib/auth/AuthProvider'

export default function PatientQr() {
  const { session } = useAuth()
  const qrQuery = useMyQr()
  const profileQuery = useMyProfile()

  const qrMissing = isNotImplemented(qrQuery.error)
  const profileMissing = isNotImplemented(profileQuery.error)

  // Prefer the dedicated QR endpoint; fall back to the profile payload so
  // the page still works if only one is live.
  const qrToken =
    qrQuery.data?.qrToken ?? profileQuery.data?.patient?.qrToken ?? null
  const qrBase64 =
    qrQuery.data?.qrCodeBase64 ??
    profileQuery.data?.patient?.qrCodeBase64 ??
    null

  const linked = !!profileQuery.data?.patient

  const handlePrint = () => {
    window.print()
  }

  return (
    <PageShell>
      <PageHeader
        title="My Health QR"
        description="Show this code at any ClinicBrain-enabled clinic for instant check-in."
        icon={<QrCode className="h-5 w-5" />}
      />

      {profileQuery.isLoading ? (
        <Skeleton className="h-20 w-full rounded-xl" />
      ) : profileMissing ? (
        <PendingBackendCard
          title="Profile endpoint"
          endpoint="GET /api/v1/me/profile"
        />
      ) : (
        <LinkedRecordBanner linked={linked} />
      )}

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Your code</CardTitle>
            <CardDescription>
              Scan-ready. Download as PNG or print the card on the right.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {qrQuery.isLoading || profileQuery.isLoading ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : qrToken ? (
              <QrDisplay qrToken={qrToken} qrCodeBase64={qrBase64} />
            ) : qrMissing && !linked ? (
              <PendingBackendCard
                title="Health QR endpoint"
                endpoint="GET /api/v1/me/qr"
                description="Returns qrToken and qrCodeBase64 for the logged-in patient."
              />
            ) : (
              <EmptyState
                icon={<QrCode className="h-5 w-5" />}
                title="No QR yet"
                description={
                  linked
                    ? 'Your clinical record is linked but no QR token was returned. Ask a CHEW to re-issue one.'
                    : 'Your QR is created on your first clinic visit, then linked to this account.'
                }
                action={
                  <Button asChild size="sm">
                    <Link to="/patient/request">Request a visit</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>

        {/* Printable card (visible on screen, optimized for print) */}
        <Card className="print:shadow-none">
          <CardHeader className="print:hidden">
            <CardTitle>Printable card</CardTitle>
            <CardDescription>
              A5-friendly layout. Use <em>Print</em> and pick "Save as PDF" or print
              to your clinic's printer.
            </CardDescription>
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrint}
                disabled={!qrToken}
              >
                <Printer className="h-4 w-4" />
                Print card
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div
              id="cb-print-card"
              className="relative mx-auto flex w-full max-w-sm flex-col items-center gap-3 overflow-hidden rounded-2xl border-2 border-brand-500 bg-white p-5 text-center"
            >
              <div className="flex items-center gap-2 self-stretch justify-between">
                <div className="text-left">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-700">
                    ClinicBrain
                  </p>
                  <p className="text-xs font-bold text-foreground-default">
                    Patient Health QR
                  </p>
                </div>
                <Badge className="bg-brand-500 hover:bg-brand-500 text-white">ClinicBrain</Badge>
              </div>
              {qrToken ? (
                <QrDisplay
                  qrToken={qrToken}
                  qrCodeBase64={qrBase64}
                  className="border-0 p-0"
                />
              ) : (
                <div className="grid h-[220px] w-[220px] place-items-center rounded-xl bg-surface-muted text-xs text-[color:var(--color-muted-foreground)]">
                  No QR available
                </div>
              )}
              <div className="w-full text-left">
                <p className="text-xs text-[color:var(--color-muted-foreground)]">Name</p>
                <p className="text-sm font-semibold">
                  {session?.displayName ?? '—'}
                </p>
              </div>
              <p className="mt-2 text-[10px] text-[color:var(--color-muted-foreground)]">
                Present this card at any ClinicBrain-enabled clinic. Do not share your token
                online.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </PageShell>
  )
}
