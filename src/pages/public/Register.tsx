import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowRight,
  Info,
  Loader2,
  Lock,
  Mail,
  Phone,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/field'
import { Logo } from '@/components/brand/Logo'
import { registerAccount } from '@/lib/api/endpoints'
import { useAuth } from '@/lib/auth/AuthProvider'
import { homePathFor } from '@/lib/auth/jwt'
import { extractErrorMessage } from '@/lib/api/client'
import { AuthHeroPanel } from './AuthHeroPanel'

const schema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[+0-9][0-9 \-]{6,19}$/, 'Enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type RegisterValues = z.infer<typeof schema>

export default function Register() {
  const navigate = useNavigate()
  const { login, setDisplayName } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phoneNumber: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: registerAccount,
    onSuccess: ({ token }, variables) => {
      const session = login(token)
      setDisplayName(variables.name)
      toast.success(`Welcome to NHIS, ${variables.name.split(' ')[0]}!`)
      navigate(homePathFor(session?.role ?? 'CHEW'), { replace: true })
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Could not create your account'))
    },
  })

  const onSubmit = form.handleSubmit((values) => mutation.mutate(values))

  return (
    <div className="grid min-h-screen bg-surface-soft lg:grid-cols-2">
      <AuthHeroPanel />

      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Create your CHEW account
          </h1>
          <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
            Start capturing visits in minutes.
          </p>

          <div className="mt-5 flex items-start gap-3 rounded-lg border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Public registration creates CHEW accounts only.</p>
              <p className="text-xs">
                Doctors and admins are provisioned by an existing administrator via the
                admin console.
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <Field
              label="Full name"
              htmlFor="reg-name"
              required
              error={form.formState.errors.name?.message}
            >
              <div className="relative">
                <UserRound
                  aria-hidden
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted-foreground)]"
                />
                <Input
                  id="reg-name"
                  autoComplete="name"
                  className="pl-10"
                  placeholder="Chinonso Okeke"
                  {...form.register('name')}
                />
              </div>
            </Field>

            <Field
              label="Email"
              htmlFor="reg-email"
              required
              error={form.formState.errors.email?.message}
            >
              <div className="relative">
                <Mail
                  aria-hidden
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted-foreground)]"
                />
                <Input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  className="pl-10"
                  placeholder="you@clinic.ng"
                  {...form.register('email')}
                />
              </div>
            </Field>

            <Field
              label="Phone number"
              htmlFor="reg-phone"
              required
              error={form.formState.errors.phoneNumber?.message}
              hint="Include country code, e.g. +234 803 555 1234"
            >
              <div className="relative">
                <Phone
                  aria-hidden
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted-foreground)]"
                />
                <Input
                  id="reg-phone"
                  type="tel"
                  autoComplete="tel"
                  className="pl-10"
                  placeholder="+234 803 555 1234"
                  {...form.register('phoneNumber')}
                />
              </div>
            </Field>

            <Field
              label="Password"
              htmlFor="reg-password"
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
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="pl-10 pr-20"
                  placeholder="Choose a strong password"
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
                  Create CHEW account
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
  )
}
