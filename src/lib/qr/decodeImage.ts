import { Html5Qrcode } from 'html5-qrcode'

/**
 * Decode a QR code from a File/Blob (e.g. user-uploaded PNG/JPG).
 * Returns the decoded text, or throws an Error with a friendly message.
 */
export async function decodeQrFromFile(file: File): Promise<string> {
  const scannerId = `__nhis_qr_scanner_${Date.now()}_${Math.random().toString(36).slice(2)}`

  // html5-qrcode requires an existing DOM element even for file decoding.
  const hidden = document.createElement('div')
  hidden.id = scannerId
  hidden.style.display = 'none'
  document.body.appendChild(hidden)

  const scanner = new Html5Qrcode(scannerId)
  try {
    const text = await scanner.scanFile(file, false)
    return text
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(
      `Could not read a QR code from that image. ${msg || 'Please try a clearer photo or paste the token instead.'}`
    )
  } finally {
    try {
      await scanner.clear()
    } catch {
      /* ignore */
    }
    hidden.remove()
  }
}

/** The QR may encode either the raw token or a full URL; extract the token. */
export function extractQrToken(decoded: string): string {
  const trimmed = decoded.trim()
  // Pattern: .../doctor/patient/<token>
  const urlMatch = trimmed.match(/\/doctor\/patient\/([^/?#]+)/i)
  if (urlMatch) return decodeURIComponent(urlMatch[1])
  // Pattern: .../patients/qr/<token>
  const apiMatch = trimmed.match(/\/patients\/qr\/([^/?#]+)/i)
  if (apiMatch) return decodeURIComponent(apiMatch[1])
  // Otherwise treat the whole string as the token.
  return trimmed
}
