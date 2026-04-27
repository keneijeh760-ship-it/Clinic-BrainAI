import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Download,
  FileJson,
  FileText,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'sonner'
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
import { PendingBackendCard } from '@/components/common/PendingBackendCard'
import { exportMyRecord } from '@/lib/api/endpoints'
import { extractErrorMessage } from '@/lib/api/client'
import { isNotImplemented, useMyProfile, useMyVisits } from './hooks'
import { formatDate } from '@/lib/utils'
import type { MyProfileDto, MyVisitSummaryDto } from '@/lib/api/types'

interface AggregatedRecord {
  exportedAt: string
  profile: MyProfileDto | null
  visits: MyVisitSummaryDto[]
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function PatientExport() {
  const profileQuery = useMyProfile()
  const visitsQuery = useMyVisits(0, 200)

  const [jsonBusy, setJsonBusy] = useState(false)
  const [pdfBusy, setPdfBusy] = useState(false)

  const profile = profileQuery.data ?? null
  const visits = visitsQuery.data?.content ?? []
  const profileMissing = isNotImplemented(profileQuery.error)
  const visitsMissing = isNotImplemented(visitsQuery.error)
  const loading = profileQuery.isLoading || visitsQuery.isLoading

  const aggregate = (): AggregatedRecord => ({
    exportedAt: new Date().toISOString(),
    profile,
    visits,
  })

  const handleJson = async () => {
    setJsonBusy(true)
    try {
      // Prefer the canonical server export when available.
      try {
        const data = await exportMyRecord()
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        })
        triggerBlobDownload(blob, `nhis-record-${new Date().toISOString().slice(0, 10)}.json`)
        toast.success('Record downloaded')
        return
      } catch (err) {
        if (!isNotImplemented(err)) {
          toast.error(extractErrorMessage(err, 'Could not download from server'))
        }
        // Fall through to client-side assembly.
      }
      const blob = new Blob([JSON.stringify(aggregate(), null, 2)], {
        type: 'application/json',
      })
      triggerBlobDownload(blob, `nhis-record-${new Date().toISOString().slice(0, 10)}.json`)
      toast.success('Record downloaded (assembled locally)')
    } finally {
      setJsonBusy(false)
    }
  }

  const handlePdf = async () => {
    setPdfBusy(true)
    try {
      // jspdf is ~200KB gzipped; lazy-load so it never ships with the
      // initial bundle.
      const { jsPDF } = await import('jspdf')
      const autoTableMod = await import('jspdf-autotable')
      const autoTable = autoTableMod.default

      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const margin = 40
      let y = margin

      doc.setFont('helvetica', 'bold')
      doc.setTextColor(225, 29, 46) // brand-500
      doc.setFontSize(20)
      doc.text('NHIS - Patient Health Record', margin, y)
      y += 24

      doc.setTextColor(82, 82, 82)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Generated ${formatDate(new Date().toISOString())}`,
        margin,
        y
      )
      y += 20

      // Profile block
      doc.setTextColor(10, 10, 10)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Profile', margin, y)
      y += 8

      const u = profile?.user
      const p = profile?.patient
      const profileRows: [string, string][] = [
        ['Name', u?.name ?? '—'],
        ['Email', u?.email ?? '—'],
        ['Phone', p?.phoneNumber ?? u?.phoneNumber ?? '—'],
        ['Date of birth', p?.dateOfBirth ?? '—'],
        ['Gender', p?.gender ?? '—'],
        ['Address', p?.address ?? '—'],
        ['Patient ID', p ? `#${p.patientId}` : 'Not linked to a clinical record yet'],
        ['QR token', p?.qrToken ?? '—'],
      ]
      autoTable(doc, {
        startY: y + 4,
        head: [['Field', 'Value']],
        body: profileRows,
        styles: { fontSize: 10, cellPadding: 6 },
        headStyles: { fillColor: [225, 29, 46], textColor: 255 },
        theme: 'striped',
        margin: { left: margin, right: margin },
      })
      // @ts-expect-error lastAutoTable is added by the plugin at runtime
      y = (doc.lastAutoTable?.finalY ?? y) + 24

      // Visits block
      doc.setTextColor(10, 10, 10)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(`Visits (${visits.length})`, margin, y)
      y += 4

      if (visits.length === 0) {
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(10)
        doc.setTextColor(82, 82, 82)
        doc.text('No visits on record yet.', margin, y + 16)
      } else {
        autoTable(doc, {
          startY: y + 8,
          head: [['Date', 'Location', 'Chief complaint', 'Risk', 'Outcome']],
          body: visits.map((v) => [
            formatDate(v.visitTime),
            v.locationName ?? '—',
            v.chiefComplaint ?? '—',
            String(v.riskLevel ?? '—'),
            v.outcomeDecision ?? (v.hasOutcome ? 'Recorded' : '—'),
          ]),
          styles: { fontSize: 9, cellPadding: 5 },
          headStyles: { fillColor: [14, 138, 62], textColor: 255 },
          theme: 'striped',
          margin: { left: margin, right: margin },
        })
      }

      // Footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(82, 82, 82)
        doc.text(
          `Page ${i} of ${pageCount} - Nigeria Healthcare Intelligence System`,
          margin,
          doc.internal.pageSize.getHeight() - 20
        )
      }

      doc.save(`nhis-record-${new Date().toISOString().slice(0, 10)}.pdf`)
      toast.success('PDF generated')
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not generate PDF'))
    } finally {
      setPdfBusy(false)
    }
  }

  return (
    <PageShell>
      <PageHeader
        title="Export my record"
        description="Download your full NHIS record as JSON or a formatted PDF. Your device, your data."
        icon={<Download className="h-5 w-5" />}
        actions={
          <Button asChild variant="ghost">
            <Link to="/patient">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5 text-brand-600" />
              JSON export
            </CardTitle>
            <CardDescription>
              Canonical export from the server when available, falling back to an
              aggregate built from your cached queries.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Button
                type="button"
                className="w-full"
                onClick={handleJson}
                disabled={jsonBusy}
              >
                {jsonBusy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download JSON
                  </>
                )}
              </Button>
            )}
            <PendingBackendCard
              title="Server-side export"
              endpoint="GET /api/v1/me/export"
              description="Returns an aggregated JSON envelope (profile + visits + outcomes) for the logged-in patient."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-flag-green-600" />
              PDF export
            </CardTitle>
            <CardDescription>
              Rendered on your device. No backend needed - just your cached record.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handlePdf}
                disabled={pdfBusy}
              >
                {pdfBusy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download PDF
                  </>
                )}
              </Button>
            )}
            <div className="rounded-lg border border-flag-green-500/30 bg-flag-green-500/5 p-3 text-xs text-flag-green-600">
              <p className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  The PDF is assembled locally and never leaves your browser. Keep it
                  safe - it contains personal health information.
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {profileMissing || visitsMissing ? (
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {profileMissing ? (
            <PendingBackendCard
              title="Profile data"
              endpoint="GET /api/v1/me/profile"
            />
          ) : null}
          {visitsMissing ? (
            <PendingBackendCard
              title="Visit data"
              endpoint="GET /api/v1/me/visits"
            />
          ) : null}
        </section>
      ) : null}
    </PageShell>
  )
}
