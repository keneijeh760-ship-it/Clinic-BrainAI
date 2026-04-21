import { motion } from 'framer-motion'
import { Activity, HeartPulse, ShieldCheck, Sparkles } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'

const BULLETS = [
  { icon: HeartPulse, text: 'Capture patient visits and vitals in under 2 minutes.' },
  { icon: Sparkles, text: 'AI-generated clinical summaries on every submission.' },
  { icon: ShieldCheck, text: 'Role-aware, JWT-secured, method-level authorization.' },
  { icon: Activity, text: 'Real-time leaderboard and outcome tracking.' },
]

/** The left red brand panel shared by Login + Register. */
export function AuthHeroPanel() {
  return (
    <aside className="relative hidden overflow-hidden brand-gradient text-white lg:block">
      {/* Decorative animated blobs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl"
        animate={{ y: [0, 18, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-[-6rem] top-[-4rem] h-80 w-80 rounded-full bg-brand-800/50 blur-3xl"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative flex h-full flex-col justify-between p-12">
        <Logo variant="white" />
        <div>
          <h2 className="max-w-md text-4xl font-extrabold leading-[1.05] tracking-tight">
            Faster triage. Safer handoff. Smarter clinics.
          </h2>
          <p className="mt-4 max-w-md text-white/80">
            NHIS connects Community Health Extension Workers, doctors and admins
            with AI-assisted summaries and QR-based patient records.
          </p>

          <ul className="mt-10 space-y-3">
            {BULLETS.map((b, idx) => {
              const Icon = b.icon
              return (
                <motion.li
                  key={b.text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.08 }}
                  className="flex items-center gap-3 rounded-lg bg-white/10 p-3 backdrop-blur-sm ring-1 ring-white/15"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-md bg-white/15">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm text-white/90">{b.text}</span>
                </motion.li>
              )
            })}
          </ul>
        </div>
        <p className="text-xs text-white/60">
          Built by Mannalon · Nigeria Healthcare Intelligence System
        </p>
      </div>
    </aside>
  )
}
