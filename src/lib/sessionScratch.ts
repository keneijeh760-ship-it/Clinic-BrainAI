import { useEffect, useState, useCallback } from 'react'

/**
 * Lightweight per-tab scratch memory. Used for "last created patient" or
 * "last scanned QR" kind of hand-offs between pages without a real list API.
 *
 * Lives in sessionStorage so it vanishes with the tab; clears on logout.
 */
const PREFIX = 'nhis.scratch.'

export function readScratch<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(PREFIX + key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeScratch<T>(key: string, value: T): void {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(value))
    // Let listeners in the same tab react
    window.dispatchEvent(new CustomEvent(`scratch:${key}`))
  } catch {
    /* ignore quota */
  }
}

export function clearScratch(key: string): void {
  try {
    sessionStorage.removeItem(PREFIX + key)
    window.dispatchEvent(new CustomEvent(`scratch:${key}`))
  } catch {
    /* ignore */
  }
}

export function clearAllScratch(): void {
  try {
    const keys: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i)
      if (k && k.startsWith(PREFIX)) keys.push(k)
    }
    keys.forEach((k) => sessionStorage.removeItem(k))
  } catch {
    /* ignore */
  }
}

export function useScratch<T>(key: string): [T | null, (value: T | null) => void] {
  const [value, setValue] = useState<T | null>(() => readScratch<T>(key))

  useEffect(() => {
    const handler = () => setValue(readScratch<T>(key))
    window.addEventListener(`scratch:${key}`, handler as EventListener)
    return () => window.removeEventListener(`scratch:${key}`, handler as EventListener)
  }, [key])

  const update = useCallback(
    (next: T | null) => {
      if (next === null) clearScratch(key)
      else writeScratch(key, next)
    },
    [key]
  )

  return [value, update]
}

export const SCRATCH_KEYS = {
  lastPatient: 'lastPatient',
  lastVisit: 'lastVisit',
  lastDoctorLookup: 'lastDoctorLookup',
} as const
