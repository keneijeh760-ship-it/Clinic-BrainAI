import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, Loader2, Mail, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/field'
import { Logo } from '@/components/brand/Logo'
import { loginAccount } from '@/lib/api/endpoints'
import { useAuth } from '@/lib/auth/AuthProvider'
import { homePathFor } from '@/lib/auth/jwt'
import { extractErrorMessage } from '@/lib/api/client'
import { AuthHeroPanel } from './AuthHeroPanel'

const schema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginValues = z.infer<typeof schema>

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const from = (location.state as { from?: string } | null)?.from

  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: loginAccount,
    onSuccess: ({ token }) => {
      const session = login(token)
      toast.success('Welcome back!')
      navigate(from && from !== '/login' ? from : homePathFor(session?.role), {
        replace: true,
      })
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Could not log you in'))
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(values)
  })

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
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
            Log in to access your NHIS dashboard.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <Field
              label="Email"
              htmlFor="login-email"
              required
              error={form.formState.errors.email?.message}
            >
              <div className="relative">
                <Mail
                  aria-hidden
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted-foreground)]"
                />
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  className="pl-10"
                  placeholder="you@clinic.ng"
                  {...form.register('email')}
                />
              </div>
            </Field>

            <Field
              label="Password"
              htmlFor="login-password"
              required
              error={form.formState.errors.password?.message}
            >
              <div className="relative">
                <Lock
                  aria-hidden
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted-foreground)]"
                />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="pl-10 pr-20"
                  placeholder="Your password"
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
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-sm text-[color:var(--color-muted-foreground)]">
            New CHEW?{' '}
            <Link
              to="/register"
              className="font-semibold text-brand-600 hover:underline"
            >
              Create an account
            </Link>
          </p>
          <p className="mt-2 text-xs text-[color:var(--color-muted-foreground)]">
            Doctors and admins are provisioned by an existing administrator.
          </p>
        </motion.div>
      </main>
    </div>
  )
}
