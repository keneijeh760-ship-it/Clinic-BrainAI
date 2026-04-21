import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Brain,
  HeartPulse,
  QrCode,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/AuthProvider'
import { homePathFor } from '@/lib/auth/jwt'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/api/types'

interface RoleCard {
  role: UserRole
  title: string
  description: string
  icon: typeof Stethoscope
}

const ROLE_CARDS: RoleCard[] = [
  {
    role: 'CHEW',
    title: 'CHEW',
    description:
      'Register patients, capture vitals and chief complaints. Get AI-assisted triage and a QR to hand off.',
    icon: HeartPulse,
  },
  {
    role: 'DOCTOR',
    title: 'Doctor',
    description:
      'Open any patient by QR, review vitals, AI summary and history, then record the outcome in seconds.',
    icon: Stethoscope,
  },
  {
    role: 'ADMIN',
    title: 'Admin',
    description:
      'Provision CHEW, Doctor and Admin accounts, review leaderboards and monitor system health.',
    icon: ShieldCheck,
  },
]

const FEATURES = [
  {
    icon: Brain,
    title: 'AI clinical summary',
    description:
      'Every visit gets a concise, Groq-powered summary highlighting what matters for the reviewing doctor.',
  },
  {
    icon: QrCode,
    title: 'QR-first handoff',
    description:
      'Patients carry a Health QR between CHEWs and doctors. No paper, no lost records.',
  },
  {
    icon: UserRound,
    title: 'Role-safe workflows',
    description:
      'CHEW, Doctor and Admin each see only what they need. Method-level security, every request.',
  },
]

export default function Landing() {
  const { isAuthenticated, role } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col bg-surface-soft">
      {/* Header */}
      <header className="z-10 border-b border-transparent">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link to="/" aria-label="NHIS home">
            <Logo variant="white" />
          </Link>
          <nav className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button
                variant="secondary"
                onClick={() => navigate(homePathFor(role))}
                className="bg-white/15 text-white hover:bg-white/25 border-transparent"
              >
                Open dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                  onClick={() => navigate('/login')}
                >
                  Log in
                </Button>
                <Button
                  variant="default"
                  className="bg-white text-brand-700 hover:bg-white/90"
                  onClick={() => navigate('/register')}
                >
                  Register as CHEW
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden brand-gradient text-white">
        {/* Decorative animated blobs */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl"
          animate={{ y: [0, 18, 0], x: [0, 10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute right-[-6rem] top-[-4rem] h-[22rem] w-[22rem] rounded-full bg-brand-800/50 blur-3xl"
          animate={{ y: [0, -20, 0], x: [0, -16, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-24 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/90 ring-1 ring-white/20">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              Live · Cavista Hackathon · Team Mannalon
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Clinical intelligence
              <br />
              for rural Nigeria.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-white/85 sm:text-xl">
              NHIS links community health workers, doctors and admins in a single,
              AI-assisted flow - from first complaint to final outcome.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {isAuthenticated ? (
                <Button
                  size="lg"
                  className="bg-white text-brand-700 hover:bg-white/90"
                  onClick={() => navigate(homePathFor(role))}
                >
                  Open your dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="bg-white text-brand-700 hover:bg-white/90"
                    onClick={() => navigate('/register')}
                  >
                    Get started as a CHEW
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                    onClick={() => navigate('/login')}
                  >
                    I already have an account
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Role cards */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.25 }}
          className="text-xl font-bold tracking-tight text-foreground-default sm:text-2xl"
        >
          Built for the three people who move patients through the system.
        </motion.h2>
        <motion.div
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {ROLE_CARDS.map((card, idx) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.role}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0 },
                }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-white p-6 card-hover"
              >
                <div
                  aria-hidden
                  className={cn(
                    'absolute right-0 top-0 h-28 w-28 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-30',
                    idx === 2 ? 'bg-flag-green-500' : 'bg-brand-500'
                  )}
                />
                <div className="relative flex items-start gap-3">
                  <span
                    className={cn(
                      'grid h-11 w-11 place-items-center rounded-xl',
                      idx === 2
                        ? 'bg-flag-green-500/10 text-flag-green-600'
                        : 'bg-brand-50 text-brand-600'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-foreground-default">
                      {card.title}
                    </h3>
                    <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">
                      {card.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:grid-cols-3 sm:px-6 lg:px-8">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-foreground-default">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-white p-8 sm:p-12">
          <div
            aria-hidden
            className="absolute inset-y-0 right-0 w-1/2 brand-gradient opacity-10"
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-tight sm:text-2xl">
                Ready to capture your first visit?
              </h3>
              <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">
                Public registration always creates a CHEW account. Doctors and admins
                are provisioned by an existing administrator.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="lg" onClick={() => navigate('/register')}>
                Create CHEW account
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                Log in
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Logo />
          <p className="text-xs text-[color:var(--color-muted-foreground)]">
            Nigeria Healthcare Intelligence System · Built by Mannalon for the Cavista Hackathon
          </p>
        </div>
      </footer>
    </div>
  )
}
