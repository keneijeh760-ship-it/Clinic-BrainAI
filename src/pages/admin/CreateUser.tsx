import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  UserPlus,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader, PageShell } from '@/components/layout/PageShell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Badge } from '@/components/ui/badge'
import { createUser } from '@/lib/api/endpoints'
import { extractErrorMessage } from '@/lib/api/client'
import type { UserRole, UserResponse } from '@/lib/api/types'
import { useState } from 'react'

const schema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  phoneNumber: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || /^[+0-9][0-9 \-]{5,19}$/.test(v),
      'Enter a valid phone number'
    ),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['CHEW', 'DOCTOR', 'ADMIN'], { message: 'Role is required' }),
})
type Values = z.infer<typeof schema>

export default function CreateUser() {
  const navigate = useNavigate()
  const [created, setCreated] = useState<UserResponse | null>(null)

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phoneNumber: '', password: '', role: 'CHEW' },
  })

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: (user) => {
      toast.success(`${user.role} account created for ${user.name}`)
      setCreated(user)
      form.reset({ name: '', email: '', phoneNumber: '', password: '', role: user.role })
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'Could not create user')),
  })

  const onSubmit = form.handleSubmit((values) => mutation.mutate(values))

  return (
    <PageShell>
      <PageHeader
        title="Create a user"
        description="Provision a CHEW, Doctor or Admin account. The user can log in immediately with the password you set."
        icon={<UserPlus className="h-5 w-5" />}
        actions={
          <Button asChild variant="ghost">
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
            <CardDescription>
              Passwords are hashed on the server with BCrypt; no plaintext is stored.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-4">
              <Field
                label="Full name"
                htmlFor="create-name"
                required
                error={form.formState.errors.name?.message}
              >
                <div className="relative">
                  <UserRound
                    aria-hidden
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted-foreground)]"
                  />
                  <Input
                    id="create-name"
                    autoComplete="name"
                    className="pl-10"
                    {...form.register('name')}
                  />
                </div>
              </Field>

              <Field
                label="Email"
                htmlFor="create-email"
                required
                error={form.formState.errors.email?.message}
              >
                <div className="relative">
                  <Mail
                    aria-hidden
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted-foreground)]"
                  />
                  <Input
                    id="create-email"
                    type="email"
                    autoComplete="off"
                    className="pl-10"
                    {...form.register('email')}
                  />
                </div>
              </Field>

              <Field
                label="Phone"
                htmlFor="create-phone"
                hint="Optional. Include country code."
                error={form.formState.errors.phoneNumber?.message}
              >
                <div className="relative">
                  <Phone
                    aria-hidden
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted-foreground)]"
                  />
                  <Input
                    id="create-phone"
                    type="tel"
                    className="pl-10"
                    placeholder="+234 803 555 1234"
                    {...form.register('phoneNumber')}
                  />
                </div>
              </Field>

              <Field
                label="Password"
                htmlFor="create-password"
                required
                hint="Minimum 8 characters. Share this securely with the user."
                error={form.formState.errors.password?.message}
              >
                <div className="relative">
                  <Lock
                    aria-hidden
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted-foreground)]"
                  />
                  <Input
                    id="create-password"
                    type="text"
                    autoComplete="new-password"
                    className="pl-10"
                    {...form.register('password')}
                  />
                </div>
              </Field>

              <Field
                label="Role"
                required
                error={form.formState.errors.role?.message}
              >
                <Select
                  value={form.watch('role')}
                  onValueChange={(v) =>
                    form.setValue('role', v as UserRole, { shouldDirty: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CHEW">CHEW</SelectItem>
                    <SelectItem value="DOCTOR">DOCTOR</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Create user
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-brand-600" />
                Role cheat sheet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <Badge className="mb-1">CHEW</Badge>
                <p className="text-[color:var(--color-muted-foreground)]">
                  Registers patients and submits visits. Earns leaderboard points.
                </p>
              </div>
              <div>
                <Badge variant="secondary" className="mb-1">
                  DOCTOR
                </Badge>
                <p className="text-[color:var(--color-muted-foreground)]">
                  Reviews visits by QR and records clinical outcomes.
                </p>
              </div>
              <div>
                <Badge variant="outline" className="mb-1">
                  ADMIN
                </Badge>
                <p className="text-[color:var(--color-muted-foreground)]">
                  Manages accounts and has full read access.
                </p>
              </div>
            </CardContent>
          </Card>

          {created ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-flag-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  Last created
                </CardTitle>
                <CardDescription>Verify the details match your intent.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-1 text-sm">
                <p>
                  <span className="text-[color:var(--color-muted-foreground)]">Name:</span>{' '}
                  <strong>{created.name}</strong>
                </p>
                <p>
                  <span className="text-[color:var(--color-muted-foreground)]">Email:</span>{' '}
                  {created.email}
                </p>
                <p>
                  <span className="text-[color:var(--color-muted-foreground)]">Role:</span>{' '}
                  <Badge variant="outline">{created.role}</Badge>
                </p>
                {created.staffId ? (
                  <p>
                    <span className="text-[color:var(--color-muted-foreground)]">Staff ID:</span>{' '}
                    <code>{created.staffId}</code>
                  </p>
                ) : null}
                <p>
                  <span className="text-[color:var(--color-muted-foreground)]">User ID:</span>{' '}
                  {created.id}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </PageShell>
  )
}
