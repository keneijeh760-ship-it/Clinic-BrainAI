import { QRCodeCanvas } from 'qrcode.react'
import { motion } from 'framer-motion'
import { Copy, Download } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { qrDataUrl, qrDoctorUrl } from '@/lib/qr/renderQr'
import { cn } from '@/lib/utils'

interface QrDisplayProps {
  qrToken: string
  /** If the backend returned a pre-rendered PNG (base64), we show that; otherwise we render client-side. */
  qrCodeBase64?: string | null
  className?: string
  size?: number
}

export function QrDisplay({
  qrToken,
  qrCodeBase64,
  className,
  size = 220,
}: QrDisplayProps) {
  const serverDataUrl = qrDataUrl(qrCodeBase64 ?? null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [busy, setBusy] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrToken)
      toast.success('QR token copied to clipboard')
    } catch {
      toast.error('Could not copy. Please copy manually.')
    }
  }

  const handleDownload = async () => {
    setBusy(true)
    try {
      let href: string | null = serverDataUrl
      if (!href && canvasRef.current) {
        href = canvasRef.current.toDataURL('image/png')
      }
      if (!href) throw new Error('No QR image available')
      const a = document.createElement('a')
      a.href = href
      a.download = `nhis-patient-${qrToken}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      toast.error('Could not download the QR image.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className={cn(
        'flex flex-col items-center gap-4 rounded-xl border border-border bg-white p-6',
        className
      )}
    >
      <div className="rounded-xl bg-white p-3 ring-4 ring-brand-500/10">
        {serverDataUrl ? (
          <img
            src={serverDataUrl}
            alt={`QR code for patient ${qrToken}`}
            width={size}
            height={size}
            className="h-[220px] w-[220px]"
          />
        ) : (
          <QRCodeCanvas
            ref={canvasRef}
            value={qrDoctorUrl(qrToken)}
            size={size}
            level="M"
            includeMargin
            bgColor="#ffffff"
            fgColor="#0a0a0a"
          />
        )}
      </div>
      <code className="max-w-full truncate rounded-md bg-surface-muted px-2 py-1 text-xs font-semibold">
        {qrToken}
      </code>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={handleCopy}>
          <Copy className="h-4 w-4" />
          Copy token
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={busy}
        >
          <Download className="h-4 w-4" />
          Download PNG
        </Button>
      </div>
    </motion.div>
  )
}
