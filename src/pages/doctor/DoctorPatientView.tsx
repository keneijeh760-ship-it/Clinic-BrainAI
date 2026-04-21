import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  MapPin,
  Phone,
  Sparkles,
  Stethoscope,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader, PageShell } from '@/components/layout/PageShell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { RiskBadge } from '@/components/common/RiskBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { getPatientByQr, recordOutcome } from '@/lib/api/endpoints'
import { extractErrorMessage } from '@/lib/api/client'
import { calcAge, formatDate } from '@/lib/utils'
import { SCRATCH_KEYS, writeScratch } from '@/lib/sessionScratch'
import type { OutcomeDecision } from '@/lib/api/types'

const outcomeSchema = z.object({
  decision: z.enum(['ADMIT', 'REFER', 'DISCHARGE'], {
    message: 'Choose an outcome',
  }),
  note: z.string().trim().max(2000, 'Note is too long').optional(),
})
type OutcomeValues = z.infer<typeof outcomeSchema>

const DECISION_LABELS: Record<OutcomeDecision, { label: string; description: string }> = {
  ADMIT: {
    label: 'Admit',
    description: 'Patient stays for further in-clinic care or observation.',
  },
  REFER: {
    label: 'Refer',
    description: 'Escalate to a higher-level facility or specialist.',
  },
  DISCHARGE: {
    label: 'Discharge',
    description: 'Send the patient home with instructions and/or medication.',
  },
}

function VitalsTable({
  vitals,
}: {
  vitals?: {
    bloodPressureSystolic?: number | null
    bloodPressureDiastolic?: number | null
    temperature?: number | null
    pulse?: number | null
    respiratoryRate?: number | null
    oxygenSaturation?: number | null
  } | null
}) {
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
              <td className="px-4 py-2 text-[color:var(--color-muted-foreground)]">{label}</td>
              <td className="px-4 py-2 font-semibold">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function DoctorPatientView() {
  const params = useParams<{ qrToken: string }>()
  const qrToken = params.qrToken ?? ''
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['patient-qr', qrToken],
    queryFn: () => getPatientByQr(qrToken),
    enabled: !!qrToken,
  })

  const form = useForm<OutcomeValues>({
    resolver: zodResolver(outcomeSchema),
    defaultValues: { decision: undefined, note: '' },
  })

  const mutation = useMutation({
    mutationFn: (values: OutcomeValues) => {
      if (!query.data?.latestVisitId) {
        throw new Error('No current visit to log an outcome against')
      }
      return recordOutcome({
        visitId: query.data.latestVisitId,
        decision: values.decision,
        note: values.note || undefined,
      })
    },
    onSuccess: (outcome) => {
      toast.success('Outcome recorded')
      // Optimistically patch the cache.
      if (query.data) {
        const next = { ...query.data, outcome }
        qc.setQueryData(['patient-qr', qrToken], next)
        writeScratch(SCRATCH_KEYS.lastDoctorLookup, next)
      }
      form.reset({ decision: undefined, note: '' })
    },
    onError: (err) =>
      toast.error(extractErrorMessage(err, 'Could not record the outcome')),
  })

  const onSubmit = form.handleSubmit((values) => mutation.mutate(values))

  const age = useMemo(() => calcAge(query.data?.dateOfBirth), [query.data?.dateOfBirth])
  const existingOutcome = query.data?.outcome

  return (
    <PageShell>
      <PageHeader
        title="Patient review"
        description="Full picture of the patient, their latest visit, and the outcome form."
        icon={<Stethoscope className="h-5 w-5" />}
        actions={
          <Button asChild variant="ghost">
            <Link to="/doctor/lookup">
              <ArrowLeft className="h-4 w-4" />
              Back to lookup
            </Link>
          </Button>
        }
      />

      {query.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : query.isError ? (
        <EmptyState
          icon={<AlertTriangle className="h-5 w-5" />}
          title="Could not load that patient"
          description={extractErrorMessage(query.error, 'Unknown error')}
          action={
            <Button asChild variant="outline">
              <Link to="/doctor/lookup">Back to lookup</Link>
            </Button>
          }
        />
      ) : query.data ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* Patient column */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">
                      {query.data.firstName} {query.data.lastName}
                    </CardTitle>
                    <CardDescription>
                      {age != null ? `${age} y/o` : 'Age unknown'} ·{' '}
                      {query.data.gender ?? 'Gender unknown'}
                    </CardDescription>
                  </div>
                  <RiskBadge level={query.data.riskLevel} size="lg" />
                </div>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm">
                {query.data.phoneNumber ? (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-brand-600" />
                    <span>{query.data.phoneNumber}</span>
                  </div>
                ) : null}
                {query.data.address ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand-600" />
                    <span>{query.data.address}</span>
                  </div>
                ) : null}
                <Separator className="my-2" />
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[color:var(--color-muted-foreground)]">
                  <span>
                    <strong className="text-foreground-default">Patient ID:</strong>{' '}
                    {query.data.patientId}
                  </span>
                  <span className="break-all">
                    <strong className="text-foreground-default">QR token:</strong>{' '}
                    <code>{query.data.qrToken}</code>
                  </span>
                  <span>
                    <strong className="text-foreground-default">Visit:</strong>{' '}
                    {formatDate(query.data.visitTime)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chief complaint &amp; location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="whitespace-pre-wrap">
                  {query.data.chiefComplaint ?? 'No chief complaint recorded.'}
                </p>
                {query.data.locationName ? (
                  <p className="text-xs text-[color:var(--color-muted-foreground)]">
                    Captured at <strong>{query.data.locationName}</strong>
                  </p>
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

          {/* AI + outcome column */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand-600" />
                  AI clinical summary
                </CardTitle>
                <CardDescription>
                  Generated at capture time. Use as a starting point.
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
                    AI summary not available yet for this visit.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-brand-600" />
                  Outcome
                </CardTitle>
                <CardDescription>
                  {existingOutcome
                    ? 'An outcome has already been recorded for this visit.'
                    : 'Log the decision for this visit. This action is final.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {existingOutcome ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 rounded-lg border border-border bg-surface-soft p-4"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-flag-green-500" />
                    <div>
                      <p className="text-sm font-semibold">
                        {existingOutcome.decision}
                      </p>
                      {existingOutcome.note ? (
                        <p className="mt-1 whitespace-pre-wrap text-sm text-[color:var(--color-muted-foreground)]">
                          {existingOutcome.note}
                        </p>
                      ) : null}
                      {existingOutcome.recordedAt ? (
                        <p className="mt-2 text-xs text-[color:var(--color-muted-foreground)]">
                          Recorded {formatDate(existingOutcome.recordedAt)}
                        </p>
                      ) : null}
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={onSubmit} className="space-y-4">
                    <Field
                      label="Decision"
                      required
                      error={form.formState.errors.decision?.message}
                    >
                      <RadioGroup
                        value={form.watch('decision') ?? ''}
                        onValueChange={(v) =>
                          form.setValue('decision', v as OutcomeDecision, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        className="grid gap-2 sm:grid-cols-3"
                      >
                        {(Object.keys(DECISION_LABELS) as OutcomeDecision[]).map(
                          (key) => {
                            const isSelected = form.watch('decision') === key
                            return (
                              <label
                                key={key}
                                className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition-colors ${
                                  isSelected
                                    ? 'border-brand-500 bg-brand-50'
                                    : 'border-border bg-white hover:bg-surface-soft'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <RadioGroupItem value={key} id={`outcome-${key}`} />
                                  <Label
                                    htmlFor={`outcome-${key}`}
                                    className="cursor-pointer font-semibold"
                                  >
                                    {DECISION_LABELS[key].label}
                                  </Label>
                                </div>
                                <p className="text-xs text-[color:var(--color-muted-foreground)]">
                                  {DECISION_LABELS[key].description}
                                </p>
                              </label>
                            )
                          }
                        )}
                      </RadioGroup>
                    </Field>

                    <Field
                      label="Note"
                      htmlFor="outcome-note"
                      hint="Optional clinician note visible on the patient record."
                    >
                      <Textarea
                        id="outcome-note"
                        rows={4}
                        placeholder="E.g. Started IV fluids, referred to general hospital for X-ray."
                        {...form.register('note')}
                      />
                    </Field>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Recording...
                          </>
                        ) : (
                          <>
                            <ClipboardCheck className="h-4 w-4" />
                            Record outcome
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </PageShell>
  )
}
