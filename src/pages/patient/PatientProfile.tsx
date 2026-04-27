import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { Loader2, Save, UserRound } from 'lucide-react'
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
import { Field } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { PendingBackendCard } from '@/components/common/PendingBackendCard'
import { LinkedRecordBanner } from '@/components/common/LinkedRecordBanner'
import { updateMyProfile } from '@/lib/api/endpoints'
import { extractErrorMessage } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/AuthProvider'
import { isNotImplemented, useMyProfile } from './hooks'

const schema = z.object({
  firstName: z.string().trim().min(2, 'First name is required'),
  lastName: z.string().trim().min(2, 'Last name is required'),
  phoneNumber: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || /^[+0-9][0-9 \-]{5,19}$/.test(v),
      'Enter a valid phone number'
    ),
  dateOfBirth: z.string().trim().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  address: z.string().trim().optional(),
})

type Values = z.infer<typeof schema>

export default function PatientProfile() {
  const { session, setDisplayName } = useAuth()
  const profileQuery = useMyProfile()
  const queryClient = useQueryClient()

  const profile = profileQuery.data
  const profileMissing = isNotImplemented(profileQuery.error)
  const linked = !!profile?.patient

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      dateOfBirth: '',
      gender: undefined,
      address: '',
    },
  })

  // Pre-fill the form as soon as we have a profile response.
  useEffect(() => {
    if (!profile) return
    const u = profile.user
    const p = profile.patient
    const [firstName, ...rest] = (u.name ?? '').split(' ')
    const lastName = rest.join(' ')
    form.reset({
      firstName: p?.firstName ?? firstName ?? '',
      lastName: p?.lastName ?? lastName ?? '',
      phoneNumber: p?.phoneNumber ?? u.phoneNumber ?? '',
      dateOfBirth: p?.dateOfBirth ?? '',
      gender:
        p?.gender === 'MALE' || p?.gender === 'FEMALE' ? p.gender : undefined,
      address: p?.address ?? '',
    })
  }, [profile, form])

  const mutation = useMutation({
    mutationFn: (values: Values) =>
      updateMyProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        gender: values.gender,
        address: values.address || undefined,
      }),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['me', 'profile'], data)
      const fullName = `${variables.firstName} ${variables.lastName}`.trim()
      if (fullName) setDisplayName(fullName)
      toast.success('Profile updated')
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Could not save profile'))
    },
  })

  const onSubmit = form.handleSubmit((values) => mutation.mutate(values))

  return (
    <PageShell>
      <PageHeader
        title="My profile"
        description="Keep your demographics current. CHEWs will pre-fill visits with this information."
        icon={<UserRound className="h-5 w-5" />}
      />

      {profileQuery.isLoading ? (
        <Skeleton className="h-20 w-full rounded-xl" />
      ) : profileMissing ? (
        <PendingBackendCard
          title="Profile endpoint"
          endpoint="GET/PATCH /api/v1/me/profile"
          description="Returns and updates the logged-in patient's demographics. Must write-through to PatientEntity when linked."
        />
      ) : (
        <LinkedRecordBanner linked={linked} />
      )}

      <form onSubmit={onSubmit} className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Demographics</CardTitle>
            <CardDescription>
              Changes save to your account immediately. When a clinical record is linked,
              updates flow to both.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field
              label="First name"
              htmlFor="pp-first"
              required
              error={form.formState.errors.firstName?.message}
            >
              <Input id="pp-first" {...form.register('firstName')} />
            </Field>
            <Field
              label="Last name"
              htmlFor="pp-last"
              required
              error={form.formState.errors.lastName?.message}
            >
              <Input id="pp-last" {...form.register('lastName')} />
            </Field>
            <Field
              label="Phone number"
              htmlFor="pp-phone"
              hint="Include country code"
              error={form.formState.errors.phoneNumber?.message}
            >
              <Input
                id="pp-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+234 803 555 1234"
                {...form.register('phoneNumber')}
              />
            </Field>
            <Field label="Date of birth" htmlFor="pp-dob">
              <Input
                id="pp-dob"
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                {...form.register('dateOfBirth')}
              />
            </Field>
            <Field label="Gender">
              <Select
                value={form.watch('gender') ?? ''}
                onValueChange={(v) =>
                  form.setValue('gender', v as 'MALE' | 'FEMALE', {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Prefer not to say" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field
              label="Home address"
              htmlFor="pp-address"
              className="sm:col-span-2"
            >
              <Input
                id="pp-address"
                placeholder="E.g. 12 Ifite Road, Awka, Anambra"
                {...form.register('address')}
              />
            </Field>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Your login email is managed by the admin console. Contact support to
              change it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-muted-foreground)]">
                Email
              </p>
              <p className="break-all font-medium">
                {profile?.user.email ?? session?.email ?? '—'}
              </p>
            </div>
            {linked ? (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-muted-foreground)]">
                  Clinical record
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">ID #{profile!.patient!.patientId}</Badge>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {profile!.patient!.qrToken}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-brand-200 bg-brand-50/40 p-3 text-xs text-brand-700">
                No clinical record linked yet. Your preferred demographics are still
                saved on the user account.
              </div>
            )}
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </PageShell>
  )
}
