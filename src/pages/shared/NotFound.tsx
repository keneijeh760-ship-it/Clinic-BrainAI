import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/brand/Logo'

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-surface-soft px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-10 text-center shadow-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
          Error 404
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
          This page doesn&apos;t exist.
        </h1>
        <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
          The link might be broken or the page may have been moved.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild>
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
