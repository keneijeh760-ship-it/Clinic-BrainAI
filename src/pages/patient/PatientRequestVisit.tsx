import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { CalendarClock, ClipboardList, Loader2, Phone } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/ui/field'
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { PendingBackendCard } from '@/components/common/PendingBackendCard'
import { createVisitRequest } from '@/lib/api/endpoints'
import { extractErrorMessage } from '@/lib/api/client'
import { SCRATCH_KEYS, writeScratch } from '@/lib/sessionScratch'
import { isNotImplemented } from './hooks'
import type { VisitRequestUrgency } from '@/lib/api/types'

const schema = z.object({
  preferredLocation: z.string().trim().min(2, 'Where should we reach you?'),
  urgency: z.enum(['ROUTINE', 'URGENT'], {
    message: 'Pick an urgency',
  }),
  description: z
    .string()
    .trim()
    .min(10, 'Tell us a little more (at least 10 characters)')
    .max(1500, 'Too long'),
  phoneNumber: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || /^[+0-9][0-9 \-]{5,19}$/.test(v),
      'Enter a valid phone number'
    ),
  consent: z.boolean().refine((v) => v === true, {
    message: 'We need your consent to dispatch a CHEW',
  }),
})

type Values = z.infer<typeof schema>

const URGENCY_LABELS: Record<VisitRequestUrgency, { label: string; blurb: string }> = {
  ROUTINE: {
    label: 'Routine',
    blurb: 'I can wait a day or two. No emergency.',
  },
  URGENT: {
    label: 'Urgent',
    blurb: 'I need a visit as soon as possible today.',
  },
}

export default function PatientRequestVisit() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      preferredLocation: '',
      urgency: 'ROUTINE',
      description: '',
      phoneNumber: '',
      consent: false,
    },
  })

  const mutation = useMutation({
    mutationFn: (values: Values) =>
      createVisitRequest({
        preferredLocation: values.preferredLocation,
        urgency: values.urgency,
        description: values.description,
        phoneNumber: values.phoneNumber || undefined,
        consent: values.consent,
      }),
    onSuccess: (request) => {
      writeScratch(SCRATCH_KEYS.lastVisitRequest, request)
      qc.invalidateQueries({ queryKey: ['me', 'visit-requests'] })
      toast.success('Visit request sent. A CHEW will reach out shortly.')
      navigate('/patient/requests')
    },
    onError: (err) => {
      if (isNotImplemented(err)) {
        toast.info(
          'Visit requests are not enabled on this server yet. Your request was not saved.'
        )
      } else {
        toast.error(extractErrorMessage(err, 'Could not send the request'))
      }
    },
  })

  const onSubmit = form.handleSubmit((values) => mutation.mutate(values))
  const urgency = form.watch('urgency')

  return (
    <PageShell>
      <PageHeader
        title="Request a visit"
        description="Tell us where you are and what's going on. A CHEW will reach out to arrange care."
        icon={<CalendarClock className="h-5 w-5" />}
        actions={
          <Button asChild variant="ghost">
            <Link to="/patient/requests">
              <ClipboardList className="h-4 w-4" />
              My requests
            </Link>
          </Button>
        }
      />

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>What's going on?</CardTitle>
            <CardDescription>
              This is not an emergency channel. If you are in danger, call local
              emergency services immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <Field
              label="Preferred location"
              htmlFor="vr-location"
              required
              hint="A town, community, or clinic name."
              error={form.formState.errors.preferredLocation?.message}
            >
              <Input
                id="vr-location"
                placeholder="E.g. Awka, Anambra - Community centre"
                {...form.register('preferredLocation')}
              />
            </Field>

            <Field
              label="Urgency"
              required
              error={form.formState.errors.urgency?.message}
            >
              <RadioGroup
                value={urgency}
                onValueChange={(v) =>
                  form.setValue('urgency', v as VisitRequestUrgency, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className="grid gap-2 sm:grid-cols-2"
              >
                {(Object.keys(URGENCY_LABELS) as VisitRequestUrgency[]).map((key) => {
                  const selected = urgency === key
                  return (
                    <label
                      key={key}
                      className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition-colors ${
                        selected
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-border bg-white hover:bg-surface-soft'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value={key} id={`urgency-${key}`} />
                        <Label
                          htmlFor={`urgency-${key}`}
                          className="cursor-pointer font-semibold"
                        >
                          {URGENCY_LABELS[key].label}
                        </Label>
                      </div>
                      <p className="text-xs text-[color:var(--color-muted-foreground)]">
                        {URGENCY_LABELS[key].blurb}
                      </p>
                    </label>
                  )
                })}
              </RadioGroup>
            </Field>

            <Field
              label="Describe your symptoms"
              htmlFor="vr-description"
              required
              hint="When it started, how severe, anything you've tried."
              error={form.formState.errors.description?.message}
            >
              <Textarea
                id="vr-description"
                rows={5}
                placeholder="E.g. Persistent headache for 3 days, fever reaching 38.5, no relief from paracetamol."
                {...form.register('description')}
              />
            </Field>

            <Field
              label="Callback phone"
              htmlFor="vr-phone"
              hint="Optional - we may call to confirm details."
              error={form.formState.errors.phoneNumber?.message}
            >
              <div className="relative">
                <Phone
                  aria-hidden
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted-foreground)]"
                />
                <Input
                  id="vr-phone"
                  type="tel"
                  autoComplete="tel"
                  className="pl-10"
                  placeholder="+234 803 555 1234"
                  {...form.register('phoneNumber')}
                />
              </div>
            </Field>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Before you send</CardTitle>
            <CardDescription>
              A CHEW in your area will review the request and get back to you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-start gap-3 rounded-lg border border-border bg-surface-soft p-3 text-sm">
              <Checkbox
                checked={form.watch('consent')}
                onCheckedChange={(v) =>
                  form.setValue('consent', !!v, { shouldValidate: true })
                }
              />
              <span>
                I consent to NHIS sharing this request with a CHEW for the purpose of
                scheduling care.
                {form.formState.errors.consent?.message ? (
                  <span className="mt-1 block text-xs font-medium text-brand-600">
                    {form.formState.errors.consent.message}
                  </span>
                ) : null}
              </span>
            </label>

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <CalendarClock className="h-4 w-4" />
                  Send request
                </>
              )}
            </Button>

            <PendingBackendCard
              title="Visit-request endpoint"
              endpoint="POST /api/v1/me/visit-requests"
              description="Creates a VisitRequestEntity for the logged-in patient, default status = PENDING."
            />
          </CardContent>
        </Card>
      </form>
    </PageShell>
  )
}
