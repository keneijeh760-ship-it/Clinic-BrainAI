/** Turn a backend-provided base64 PNG (no prefix) into a data URL for <img src>. */
export function qrDataUrl(base64?: string | null): string | null {
  if (!base64) return null
  if (base64.startsWith('data:')) return base64
  return `data:image/png;base64,${base64}`
}

/** Build the canonical patient handoff URL we encode inside the QR for the doctor app. */
export function qrDoctorUrl(qrToken: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}/doctor/patient/${encodeURIComponent(qrToken)}`
}
