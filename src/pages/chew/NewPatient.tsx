import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader, PageShell } from '@/components/layout/PageShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { registerPatient } from '@/lib/api/endpoints'
import { extractErrorMessage } from '@/lib/api/client'
import { SCRATCH_KEYS, writeScratch } from '@/lib/sessionScratch'
import type { PatientProfileDto } from '@/lib/api/types'

const schema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  dateOfBirth: z.string().trim().optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  phoneNumber: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || /^[+0-9][0-9 \-]{5,19}$/.test(v),
      'Enter a valid phone number'
    ),
  address: z.string().trim().optional(),
  paymentOptions: z
    .enum(['NHIS', 'HMO', 'SELF_PAY', 'COMM_FUND', 'UNKNOWN'])
    .optional(),
})

type Values = z.infer<typeof schema>

export default function NewPatient() {
  const navigate = useNavigate()
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: undefined,
      phoneNumber: '',
      address: '',
      paymentOptions: undefined,
    },
  })

  const mutation = useMutation({
    mutationFn: (values: Values) =>
      registerPatient({
        demographics: {
          firstName: values.firstName,
          lastName: values.lastName,
          dateOfBirth: values.dateOfBirth || undefined,
          gender: values.gender,
          phoneNumber: values.phoneNumber || undefined,
          address: values.address || undefined,
        },
      }),
    onSuccess: (patient: PatientProfileDto) => {
      writeScratch(SCRATCH_KEYS.lastPatient, patient)
      toast.success('Patient registered and Health QR generated')
      navigate('/chew/result', { state: { patient } })
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Could not register patient'))
    },
  })

  const onSubmit = form.handleSubmit((values) => mutation.mutate(values))

  return (
    <PageShell>
      <PageHeader
        title="Register a new patient"
        description="Capture demographics now - you can submit their first visit on the next screen."
        icon={<UserPlus className="h-5 w-5" />}
      />

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Demographics</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field
              label="First name"
              htmlFor="firstName"
              required
              error={form.formState.errors.firstName?.message}
            >
              <Input id="firstName" {...form.register('firstName')} />
            </Field>
            <Field
              label="Last name"
              htmlFor="lastName"
              required
              error={form.formState.errors.lastName?.message}
            >
              <Input id="lastName" {...form.register('lastName')} />
            </Field>
            <Field
              label="Date of birth"
              htmlFor="dateOfBirth"
              hint="Optional - estimate is fine"
            >
              <Input
                id="dateOfBirth"
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                {...form.register('dateOfBirth')}
              />
            </Field>
            <Field label="Gender">
              <Select
                value={form.watch('gender') ?? ''}
                onValueChange={(v) =>
                  form.setValue('gender', v as 'MALE' | 'FEMALE', { shouldDirty: true })
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
            <Field
              label="Phone number"
              htmlFor="phoneNumber"
              hint="Optional, include country code"
              error={form.formState.errors.phoneNumber?.message}
            >
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+234 803 555 1234"
                {...form.register('phoneNumber')}
              />
            </Field>
            <Field label="Payment option">
              <Select
                value={form.watch('paymentOptions') ?? ''}
                onValueChange={(v) =>
                  form.setValue(
                    'paymentOptions',
                    v as 'NHIS' | 'HMO' | 'SELF_PAY' | 'COMM_FUND' | 'UNKNOWN',
                    { shouldDirty: true }
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unknown" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NHIS">NHIS</SelectItem>
                  <SelectItem value="HMO">HMO</SelectItem>
                  <SelectItem value="SELF_PAY">Self pay</SelectItem>
                  <SelectItem value="COMM_FUND">Community fund</SelectItem>
                  <SelectItem value="UNKNOWN">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field
              label="Address"
              htmlFor="address"
              className="sm:col-span-2"
              hint="Optional - town/city and landmark"
            >
              <Input
                id="address"
                placeholder="E.g. 12 Ifite Road, Awka, Anambra"
                {...form.register('address')}
              />
            </Field>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>What happens next</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[color:var(--color-muted-foreground)]">
            <p>1. We create a patient record and a unique Health QR.</p>
            <p>
              2. You can hand the QR to the patient to present at any NHIS-enabled
              clinic.
            </p>
            <p>3. You&apos;ll be taken straight to the QR preview screen.</p>
            <Button type="submit" className="mt-4 w-full" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Register patient
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </PageShell>
  )
}
