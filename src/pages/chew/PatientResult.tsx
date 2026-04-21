import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ClipboardPlus, Sparkles, Stethoscope } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PageHeader, PageShell } from '@/components/layout/PageShell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QrDisplay } from '@/components/common/QrDisplay'
import { RiskBadge } from '@/components/common/RiskBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { SCRATCH_KEYS, useScratch } from '@/lib/sessionScratch'
import type { PatientProfileDto, SubmitVisitResponse } from '@/lib/api/types'

interface LocationState {
  patient?: PatientProfileDto
  visit?: SubmitVisitResponse
}

function useTypingReveal(text: string | undefined, speed = 14) {
  const [shown, setShown] = useState('')
  useEffect(() => {
    if (!text) {
      setShown('')
      return
    }
    setShown('')
    const id = window.setInterval(() => {
      setShown((prev) => {
        if (prev.length >= text.length) {
          window.clearInterval(id)
          return prev
        }
        return text.slice(0, prev.length + 1)
      })
    }, speed)
    return () => window.clearInterval(id)
  }, [text, speed])
  return shown
}

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!Number.isFinite(target) || target <= 0) {
      setValue(target || 0)
      return
    }
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      setValue(Math.round(target * progress))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

export default function PatientResult() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as LocationState | null) ?? null

  const [fallbackPatient] = useScratch<PatientProfileDto>(SCRATCH_KEYS.lastPatient)
  const [fallbackVisit] = useScratch<SubmitVisitResponse>(SCRATCH_KEYS.lastVisit)

  const patient = state?.patient ?? fallbackPatient ?? null
  const visit = state?.visit ?? fallbackVisit ?? null

  const qrToken = useMemo(() => visit?.qrToken ?? patient?.qrToken ?? null, [visit, patient])
  const qrBase64 = useMemo(
    () => visit?.qrCodeBase64 ?? patient?.qrCodeBase64 ?? null,
    [visit, patient]
  )

  const typedSummary = useTypingReveal(visit?.aiSummary ?? undefined)
  const points = useCountUp(visit?.pointsEarned ?? 0)

  if (!qrToken) {
    return (
      <PageShell>
        <EmptyState
          title="Nothing to display"
          description="Register a patient or submit a visit first to see the Health QR here."
          action={
            <Button asChild>
              <Link to="/chew/new-patient">Register a patient</Link>
            </Button>
          }
        />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader
        title={visit ? 'Visit submitted' : 'Patient registered'}
        description={
          visit
            ? 'AI triage complete. Share the QR with the next clinician.'
            : 'Health QR generated. Share it with the patient or clinician.'
        }
        icon={<Sparkles className="h-5 w-5" />}
        actions={
          <>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button asChild>
              <Link to="/chew/new-visit">
                <ClipboardPlus className="h-4 w-4" />
                Submit another visit
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="flex flex-col gap-6">
          <QrDisplay qrToken={qrToken} qrCodeBase64={qrBase64} />
          {patient ? (
            <Card>
              <CardHeader>
                <CardTitle>Patient</CardTitle>
                <CardDescription>Demographics captured on this device.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[color:var(--color-muted-foreground)]">Name</span>
                  <span className="font-semibold">
                    {patient.firstName} {patient.lastName}
                  </span>
                </div>
                {patient.gender ? (
                  <div className="flex justify-between">
                    <span className="text-[color:var(--color-muted-foreground)]">Gender</span>
                    <span>{patient.gender}</span>
                  </div>
                ) : null}
                {patient.dateOfBirth ? (
                  <div className="flex justify-between">
                    <span className="text-[color:var(--color-muted-foreground)]">DOB</span>
                    <span>{patient.dateOfBirth}</span>
                  </div>
                ) : null}
                {patient.phoneNumber ? (
                  <div className="flex justify-between">
                    <span className="text-[color:var(--color-muted-foreground)]">Phone</span>
                    <span>{patient.phoneNumber}</span>
                  </div>
                ) : null}
                {patient.address ? (
                  <div className="flex justify-between">
                    <span className="text-[color:var(--color-muted-foreground)]">Address</span>
                    <span className="max-w-[60%] text-right">{patient.address}</span>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="flex flex-col gap-6">
          {visit ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-brand-600" />
                        Triage
                      </CardTitle>
                      <CardDescription>
                        Calculated on submit from vitals and red flags.
                      </CardDescription>
                    </div>
                    <RiskBadge level={visit.riskLevel} size="lg" />
                  </div>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-brand-600" />
                    AI clinical summary
                  </CardTitle>
                  <CardDescription>
                    Powered by Groq. The reviewing doctor sees this first.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {visit.aiSummary ? (
                    <motion.p
                      key={visit.aiSummary}
                      className="whitespace-pre-wrap text-sm leading-relaxed text-foreground-default"
                    >
                      {typedSummary}
                      <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-brand-500 motion-safe:animate-pulse" />
                    </motion.p>
                  ) : (
                    <p className="text-sm text-[color:var(--color-muted-foreground)]">
                      AI summary will arrive shortly - it&apos;s generated asynchronously
                      after submit.
                    </p>
                  )}
                </CardContent>
              </Card>

              <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                className="relative overflow-hidden rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 p-6 text-white shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
                      Points earned
                    </p>
                    <p className="mt-1 text-4xl font-extrabold">+{points}</p>
                  </div>
                  <Sparkles className="h-10 w-10 text-white/80" />
                </div>
                <p className="mt-2 text-xs text-white/70">
                  Keep capturing quality visits to climb the leaderboard.
                </p>
              </motion.div>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Next step</CardTitle>
                <CardDescription>
                  Submit this patient&apos;s first visit to generate an AI summary and
                  risk level.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link to="/chew/new-visit">
                    <ClipboardPlus className="h-4 w-4" />
                    Submit a visit
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageShell>
  )
}
