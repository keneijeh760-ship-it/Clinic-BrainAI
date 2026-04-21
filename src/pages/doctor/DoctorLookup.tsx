import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Loader2, QrCode, Search, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader, PageShell } from '@/components/layout/PageShell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/field'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getPatientByQr } from '@/lib/api/endpoints'
import { extractErrorMessage } from '@/lib/api/client'
import { decodeQrFromFile, extractQrToken } from '@/lib/qr/decodeImage'
import { SCRATCH_KEYS, writeScratch } from '@/lib/sessionScratch'

export default function DoctorLookup() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [manualToken, setManualToken] = useState('')
  const [decoding, setDecoding] = useState(false)

  const resolveMutation = useMutation({
    mutationFn: (token: string) => getPatientByQr(token),
    onSuccess: (view) => {
      writeScratch(SCRATCH_KEYS.lastDoctorLookup, view)
      toast.success('Patient loaded')
      navigate(`/doctor/patient/${encodeURIComponent(view.qrToken)}`)
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'Could not find that patient')),
  })

  const handleFile = async (file: File) => {
    if (!file) return
    setDecoding(true)
    try {
      const raw = await decodeQrFromFile(file)
      const token = extractQrToken(raw)
      if (!token) {
        toast.error('QR was decoded but no token was found in it.')
        return
      }
      resolveMutation.mutate(token)
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not decode that image'))
    } finally {
      setDecoding(false)
    }
  }

  const onManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const token = extractQrToken(manualToken)
    if (!token) {
      toast.error('Enter a QR token')
      return
    }
    resolveMutation.mutate(token)
  }

  return (
    <PageShell>
      <PageHeader
        title="Look up a patient"
        description="Upload the patient&apos;s Health QR image or paste the token. No live camera is used."
        icon={<Search className="h-5 w-5" />}
      />

      <Tabs defaultValue="upload" className="w-full">
        <TabsList>
          <TabsTrigger value="upload">Upload QR image</TabsTrigger>
          <TabsTrigger value="manual">Paste token</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-brand-600" />
                Upload a photo of the QR
              </CardTitle>
              <CardDescription>
                PNG or JPG works best. Make sure the whole QR square is visible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <label
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  const file = e.dataTransfer.files?.[0]
                  if (file) void handleFile(file)
                }}
                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
                  dragOver
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-border bg-surface-soft hover:bg-brand-50/40'
                }`}
              >
                <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-500/10 text-brand-600">
                  <Upload className="h-7 w-7" />
                </span>
                <p className="text-sm font-semibold">
                  Drag a QR image here, or click to select
                </p>
                <p className="text-xs text-[color:var(--color-muted-foreground)]">
                  We decode on-device using html5-qrcode&apos;s file scanner.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void handleFile(file)
                    e.target.value = ''
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={decoding || resolveMutation.isPending}
                >
                  {decoding || resolveMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Working...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Choose file
                    </>
                  )}
                </Button>
              </label>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Paste a QR token or URL</CardTitle>
              <CardDescription>
                You can paste just the token (e.g. <code>q_xxxxx</code>) or a full
                <code> /doctor/patient/...</code> URL.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onManualSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <Field
                  label="QR token or URL"
                  htmlFor="qr-token"
                  className="flex-1"
                >
                  <Input
                    id="qr-token"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="q_xxxxxxxxxx or https://.../doctor/patient/q_xxxxx"
                  />
                </Field>
                <Button type="submit" disabled={resolveMutation.isPending}>
                  {resolveMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Open patient
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}
