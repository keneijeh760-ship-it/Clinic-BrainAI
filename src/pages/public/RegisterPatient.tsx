import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowRight,
  HeartPulse,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'
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
import { Checkbox } from '@/components/ui/checkbox'
import { registerPatientAccount } from '@/lib/api/endpoints'
import { useAuth } from '@/lib/auth/AuthProvider'
import { homePathFor } from '@/lib/auth/jwt'
import { extractErrorMessage } from '@/lib/api/client'
import { AuthHeroPanel } from './AuthHeroPanel'
import { RoleSwitch } from './RoleSwitch'
import { PublicNav } from '@/components/layout/PublicNav'

const schema = z
  .object({
    firstName: z.string().trim().min(2, 'First name is required'),
    lastName: z.string().trim().min(2, 'Last name is required'),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
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
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
    consent: z.boolean().refine((v) => v === true, {
      message: 'You must accept the terms to continue',
    }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type SignupValues = z.infer<typeof schema>

export default function RegisterPatient() {
  const navigate = useNavigate()
  const { login, setDisplayName } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<SignupValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: '',
      gender: undefined,
      address: '',
      password: '',
      confirmPassword: '',
      consent: false,
    },
  })

  const mutation = useMutation({
    mutationFn: (values: SignupValues) =>
      registerPatientAccount({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        gender: values.gender,
        address: values.address || undefined,
      }),
    onSuccess: ({ token }, variables) => {
      const session = login(token)
      const fullName = `${variables.firstName} ${variables.lastName}`.trim()
      setDisplayName(fullName)
      toast.success(`Welcome to ClinicBrain, ${variables.firstName}!`)
      navigate(homePathFor(session?.role ?? 'PATIENT'), { replace: true })
    },
    onError: (err) => {
      toast.error(
        extractErrorMessage(
          err,
          'Could not create your account. Patient signup may not be enabled on this server yet.'
        )
      )
    },
  })

  const onSubmit = form.handleSubmit((values) => mutation.mutate(values))

  return (
    <div className="flex min-h-screen flex-col bg-surface-soft">
      <PublicNav page="register-patient" />

      <div className="flex flex-1 lg:grid lg:grid-cols-2">
        <AuthHeroPanel />

        <main className="flex items-center justify-center px-4 py-12 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-xl rounded-2xl bg-[#1a1a1a] p-8 shadow-card-md"
          >
            <RoleSwitch active="patient" />

            <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
              Create your patient account
            </h1>
            <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
              Own your health records. Get your Health QR, view outcomes, and request a
              visit when you need one.
            </p>

            <div className="mt-5 flex items-start gap-3 rounded-lg border border-flag-green-500/30 bg-flag-green-500/5 p-3 text-sm text-flag-green-600">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">Your clinical record is created on your first visit.</p>
                <p className="text-xs text-[color:var(--color-muted-foreground)]">
                  Until a CHEW captures your first visit, your dashboard will be empty - that
                  is normal. We pre-fill visits with the info you save here.
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="First name"
                  htmlFor="pt-first"
                  required
                  error={form.formState.errors.firstName?.message}
                >
                  <div className="relative">
                    <UserRound
                      aria-hidden
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted-foreground)]"
                    />
                    <Input
                      id="pt-first"
                      autoComplete="given-name"
                      className="pl-10"
                      placeholder="Ada"
                      {...form.register('firstName')}
                    />
                  </div>
                </Field>
                <Field
                  label="Last name"
                  htmlFor="pt-last"
                  required
                  error={form.formState.errors.lastName?.message}
                >
                  <Input
                    id="pt-last"
                    autoComplete="family-name"
                    placeholder="Okeke"
                    {...form.register('lastName')}
                  />
                </Field>
              </div>

              <Field
                label="Email"
                htmlFor="pt-email"
                required
                error={form.formState.errors.email?.message}
              >
                <div className="relative">
                  <Mail
                    aria-hidden
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted-foreground)]"
                  />
                  <Input
                    id="pt-email"
                    type="email"
                    autoComplete="email"
                    className="pl-10"
                    placeholder="you@example.com"
                    {...form.register('email')}
                  />
                </div>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Phone number"
                  htmlFor="pt-phone"
                  hint="Helps clinicians reach you"
                  error={form.formState.errors.phoneNumber?.message}
                >
                  <div className="relative">
                    <Phone
                      aria-hidden
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted-foreground)]"
                    />
                    <Input
                      id="pt-phone"
                      type="tel"
                      autoComplete="tel"
                      className="pl-10"
                      placeholder="+234 803 555 1234"
                      {...form.register('phoneNumber')}
                    />
                  </div>
                </Field>
                <Field
                  label="Date of birth"
                  htmlFor="pt-dob"
                  error={form.formState.errors.dateOfBirth?.message}
                >
                  <Input
                    id="pt-dob"
                    type="date"
                    max={new Date().toISOString().slice(0, 10)}
                    {...form.register('dateOfBirth')}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
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
                  htmlFor="pt-address"
                  error={form.formState.errors.address?.message}
                >
                  <div className="relative">
                    <MapPin
                      aria-hidden
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted-foreground)]"
                    />
                    <Input
                      id="pt-address"
                      className="pl-10"
                      placeholder="Awka, Anambra"
                      {...form.register('address')}
                    />
                  </div>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Password"
                  htmlFor="pt-password"
                  required
                  hint="At least 8 characters"
                  error={form.formState.errors.password?.message}
                >
                  <div className="relative">
                    <Lock
                      aria-hidden
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted-foreground)]"
                    />
                    <Input
                      id="pt-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className="pl-10 pr-20"
                      placeholder="Strong password"
                      {...form.register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </Field>
                <Field
                  label="Confirm password"
                  htmlFor="pt-password-confirm"
                  required
                  error={form.formState.errors.confirmPassword?.message}
                >
                  <Input
                    id="pt-password-confirm"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Re-type password"
                    {...form.register('confirmPassword')}
                  />
                </Field>
              </div>

              <label className="flex items-start gap-3 rounded-lg border border-border bg-white p-3 text-sm">
                <Checkbox
                  checked={form.watch('consent')}
                  onCheckedChange={(v) =>
                    form.setValue('consent', !!v, { shouldValidate: true })
                  }
                />
                <span>
                  I agree to ClinicBrain storing my health information to enable care, and I
                  understand that clinicians may view my record during visits.
                  {form.formState.errors.consent?.message ? (
                    <span className="mt-1 block text-xs font-medium text-brand-600">
                      {form.formState.errors.consent.message}
                    </span>
                  ) : null}
                </span>
              </label>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <HeartPulse className="h-4 w-4" />
                    Create my health account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-sm text-[color:var(--color-muted-foreground)]">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600 hover:underline">
                Log in
              </Link>
            </p>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
