import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { ClipboardPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { PageHeader, PageShell } from '@/components/layout/PageShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/ui/field'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { submitVisit } from '@/lib/api/endpoints'
import { extractErrorMessage } from '@/lib/api/client'
import { SCRATCH_KEYS, useScratch, writeScratch } from '@/lib/sessionScratch'
import type {
  PatientProfileDto,
  SubmitVisitResponse,
  SubmitVisitRequest,
} from '@/lib/api/types'

const emptyToUndef = (v: string | undefined) => (v === '' || v === undefined ? undefined : v)

const numStrOptional = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || !Number.isNaN(Number(v)), 'Enter a number')

const parseOptNum = (v: string | undefined): number | undefined => {
  if (v === undefined || v === null || v === '') return undefined
  const n = Number(v)
  return Number.isNaN(n) ? undefined : n
}

const schema = z
  .object({
    mode: z.enum(['existing', 'inline']),
    patientId: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || /^[0-9]+$/.test(v), 'Enter a numeric patient ID'),
    demographics: z
      .object({
        firstName: z.string().trim().optional(),
        lastName: z.string().trim().optional(),
        dateOfBirth: z.string().trim().optional(),
        gender: z.enum(['MALE', 'FEMALE']).optional(),
        phoneNumber: z.string().trim().optional(),
        address: z.string().trim().optional(),
      })
      .optional(),
    chiefComplaint: z.string().trim().min(3, 'Briefly describe the chief complaint'),
    locationName: z.string().trim().min(1, 'Required'),
    vitals: z
      .object({
        bloodPressureSystolic: numStrOptional,
        bloodPressureDiastolic: numStrOptional,
        temperature: numStrOptional,
        pulse: numStrOptional,
        respiratoryRate: numStrOptional,
        oxygenSaturation: numStrOptional,
      })
      .optional(),
    symptomFlags: z
      .object({
        fever: z.boolean().optional(),
        cough: z.boolean().optional(),
        difficultyBreathing: z.boolean().optional(),
        chestPain: z.boolean().optional(),
        severeHeadache: z.boolean().optional(),
        confusion: z.boolean().optional(),
        bleeding: z.boolean().optional(),
        lossOfConsciousness: z.boolean().optional(),
        severeDehydration: z.boolean().optional(),
        convulsions: z.boolean().optional(),
      })
      .optional(),
  })
  .superRefine((v, ctx) => {
    if (v.mode === 'existing' && !v.patientId) {
      ctx.addIssue({
        code: 'custom',
        path: ['patientId'],
        message: 'Patient ID is required',
      })
    }
    if (v.mode === 'inline') {
      if (!v.demographics?.firstName) {
        ctx.addIssue({
          code: 'custom',
          path: ['demographics', 'firstName'],
          message: 'First name is required',
        })
      }
      if (!v.demographics?.lastName) {
        ctx.addIssue({
          code: 'custom',
          path: ['demographics', 'lastName'],
          message: 'Last name is required',
        })
      }
    }
  })

type Values = z.infer<typeof schema>

const SYMPTOM_KEYS: { key: keyof NonNullable<Values['symptomFlags']>; label: string }[] = [
  { key: 'fever', label: 'Fever' },
  { key: 'cough', label: 'Cough' },
  { key: 'difficultyBreathing', label: 'Difficulty breathing' },
  { key: 'chestPain', label: 'Chest pain' },
  { key: 'severeHeadache', label: 'Severe headache' },
  { key: 'confusion', label: 'Confusion' },
  { key: 'bleeding', label: 'Bleeding' },
  { key: 'lossOfConsciousness', label: 'Loss of consciousness' },
  { key: 'severeDehydration', label: 'Severe dehydration' },
  { key: 'convulsions', label: 'Convulsions' },
]

export default function NewVisit() {
  const navigate = useNavigate()
  const [lastPatient] = useScratch<PatientProfileDto>(SCRATCH_KEYS.lastPatient)
  const [tab, setTab] = useState<'existing' | 'inline'>(lastPatient ? 'existing' : 'inline')

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      mode: lastPatient ? 'existing' : 'inline',
      patientId: lastPatient?.patientId ? String(lastPatient.patientId) : '',
      demographics: {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: undefined,
        phoneNumber: '',
        address: '',
      },
      chiefComplaint: '',
      locationName: '',
      vitals: {
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        temperature: '',
        pulse: '',
        respiratoryRate: '',
        oxygenSaturation: '',
      },
      symptomFlags: {},
    },
  })

  const handleTab = (next: string) => {
    if (next !== 'existing' && next !== 'inline') return
    setTab(next)
    form.setValue('mode', next, { shouldDirty: true })
  }

  const mutation = useMutation({
    mutationFn: (values: Values) => {
      const vitalsIn = values.vitals ?? {}
      const payload: SubmitVisitRequest = {
        chiefComplaint: values.chiefComplaint,
        locationName: values.locationName,
        vitals: {
          bloodPressureSystolic: parseOptNum(vitalsIn.bloodPressureSystolic),
          bloodPressureDiastolic: parseOptNum(vitalsIn.bloodPressureDiastolic),
          temperature: parseOptNum(vitalsIn.temperature),
          pulse: parseOptNum(vitalsIn.pulse),
          respiratoryRate: parseOptNum(vitalsIn.respiratoryRate),
          oxygenSaturation: parseOptNum(vitalsIn.oxygenSaturation),
        },
        symptomFlags: values.symptomFlags,
        patientId:
          values.mode === 'existing' && values.patientId
            ? Number(values.patientId)
            : null,
        patientDemographics:
          values.mode === 'inline'
            ? {
                firstName: values.demographics?.firstName ?? '',
                lastName: values.demographics?.lastName ?? '',
                dateOfBirth: emptyToUndef(values.demographics?.dateOfBirth),
                gender: values.demographics?.gender,
                phoneNumber: emptyToUndef(values.demographics?.phoneNumber),
                address: emptyToUndef(values.demographics?.address),
              }
            : null,
      }
      return submitVisit(payload)
    },
    onSuccess: (result: SubmitVisitResponse) => {
      writeScratch(SCRATCH_KEYS.lastVisit, result)
      toast.success(`Visit submitted. You earned +${result.pointsEarned} points.`)
      navigate('/chew/result', { state: { visit: result } })
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'Could not submit visit')),
  })

  const onSubmit = form.handleSubmit((values) => mutation.mutate(values))

  return (
    <PageShell>
      <PageHeader
        title="Submit a new visit"
        description="Capture the chief complaint, vitals and symptom flags. We&apos;ll triage, summarize and update the patient record."
        icon={<ClipboardPlus className="h-5 w-5" />}
      />

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Who is this visit for?</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={handleTab} className="w-full">
              <TabsList>
                <TabsTrigger value="existing">Existing patient</TabsTrigger>
                <TabsTrigger value="inline">Register during visit</TabsTrigger>
              </TabsList>

              <TabsContent value="existing">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Patient ID"
                    htmlFor="patientId"
                    required
                    hint={
                      lastPatient
                        ? `Most recent: ${lastPatient.firstName} ${lastPatient.lastName} (ID ${lastPatient.patientId})`
                        : 'Paste the numeric ID from the Health QR screen'
                    }
                    error={form.formState.errors.patientId?.message}
                  >
                    <Input
                      id="patientId"
                      type="number"
                      inputMode="numeric"
                      placeholder="123"
                      {...form.register('patientId')}
                    />
                  </Field>
                  {lastPatient ? (
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          form.setValue('patientId', String(lastPatient.patientId), {
                            shouldDirty: true,
                          })
                        }
                      >
                        Use last patient
                      </Button>
                    </div>
                  ) : null}
                </div>
              </TabsContent>

              <TabsContent value="inline">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="First name"
                    required
                    htmlFor="demographics.firstName"
                    error={form.formState.errors.demographics?.firstName?.message}
                  >
                    <Input
                      id="demographics.firstName"
                      {...form.register('demographics.firstName')}
                    />
                  </Field>
                  <Field
                    label="Last name"
                    required
                    htmlFor="demographics.lastName"
                    error={form.formState.errors.demographics?.lastName?.message}
                  >
                    <Input
                      id="demographics.lastName"
                      {...form.register('demographics.lastName')}
                    />
                  </Field>
                  <Field label="Date of birth" htmlFor="demographics.dateOfBirth">
                    <Input
                      id="demographics.dateOfBirth"
                      type="date"
                      max={new Date().toISOString().slice(0, 10)}
                      {...form.register('demographics.dateOfBirth')}
                    />
                  </Field>
                  <Field label="Gender">
                    <Select
                      value={form.watch('demographics.gender') ?? ''}
                      onValueChange={(v) =>
                        form.setValue(
                          'demographics.gender',
                          v as 'MALE' | 'FEMALE',
                          { shouldDirty: true }
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Phone number" htmlFor="demographics.phoneNumber">
                    <Input
                      id="demographics.phoneNumber"
                      type="tel"
                      placeholder="+234 ..."
                      {...form.register('demographics.phoneNumber')}
                    />
                  </Field>
                  <Field label="Address" htmlFor="demographics.address">
                    <Input
                      id="demographics.address"
                      {...form.register('demographics.address')}
                    />
                  </Field>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chief complaint and location</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field
              label="Chief complaint"
              htmlFor="chiefComplaint"
              required
              error={form.formState.errors.chiefComplaint?.message}
              hint="Capture the patient&apos;s main reason for the visit"
            >
              <Textarea
                id="chiefComplaint"
                rows={3}
                placeholder="E.g. 3-day history of fever, chills and cough"
                {...form.register('chiefComplaint')}
              />
            </Field>
            <Field
              label="Location"
              htmlFor="locationName"
              required
              hint="Where the visit happened, e.g. Awka PHC"
              error={form.formState.errors.locationName?.message}
            >
              <Input id="locationName" {...form.register('locationName')} />
            </Field>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Vitals</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="BP systolic (mmHg)" htmlFor="vitals.bloodPressureSystolic">
                <Input
                  id="vitals.bloodPressureSystolic"
                  inputMode="decimal"
                  placeholder="120"
                  {...form.register('vitals.bloodPressureSystolic')}
                />
              </Field>
              <Field label="BP diastolic (mmHg)" htmlFor="vitals.bloodPressureDiastolic">
                <Input
                  id="vitals.bloodPressureDiastolic"
                  inputMode="decimal"
                  placeholder="80"
                  {...form.register('vitals.bloodPressureDiastolic')}
                />
              </Field>
              <Field label="Temperature (°C)" htmlFor="vitals.temperature">
                <Input
                  id="vitals.temperature"
                  inputMode="decimal"
                  placeholder="37.2"
                  {...form.register('vitals.temperature')}
                />
              </Field>
              <Field label="Pulse (bpm)" htmlFor="vitals.pulse">
                <Input
                  id="vitals.pulse"
                  inputMode="decimal"
                  placeholder="76"
                  {...form.register('vitals.pulse')}
                />
              </Field>
              <Field label="Respiratory rate" htmlFor="vitals.respiratoryRate">
                <Input
                  id="vitals.respiratoryRate"
                  inputMode="decimal"
                  placeholder="18"
                  {...form.register('vitals.respiratoryRate')}
                />
              </Field>
              <Field label="SpO₂ (%)" htmlFor="vitals.oxygenSaturation">
                <Input
                  id="vitals.oxygenSaturation"
                  inputMode="decimal"
                  placeholder="98"
                  {...form.register('vitals.oxygenSaturation')}
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Red-flag symptoms</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {SYMPTOM_KEYS.map(({ key, label }) => (
                <Controller
                  key={key}
                  control={form.control}
                  name={`symptomFlags.${key}` as const}
                  render={({ field }) => (
                    <label
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm transition-colors hover:bg-surface-soft ${
                        field.value ? 'border-brand-500 bg-brand-50 text-brand-700' : ''
                      }`}
                    >
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={(v) => field.onChange(!!v)}
                      />
                      <Label className="cursor-pointer text-sm">{label}</Label>
                    </label>
                  )}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <ClipboardPlus className="h-4 w-4" />
                Submit visit
              </>
            )}
          </Button>
        </div>
      </form>
    </PageShell>
  )
}
