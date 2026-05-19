import { Logo } from '@/components/brand/Logo'

export function Footer() {
  return (
    <footer className="border-t border-border bg-[#0d0d0d]">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Logo />
        <div className="flex flex-col gap-0.5 text-xs text-[color:var(--color-muted-foreground)] sm:text-right">
          <span>© 2026 ClinicBrain</span>
          <span>AI-powered clinical intelligence</span>
        </div>
      </div>
    </footer>
  )
}
