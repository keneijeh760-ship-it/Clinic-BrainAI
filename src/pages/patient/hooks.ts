import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import {
  getMyProfile,
  getMyQr,
  getMyVisit,
  getMyVisitRequests,
  getMyVisits,
} from '@/lib/api/endpoints'

/**
 * Some of the patient portal endpoints are not yet implemented on the
 * backend. We treat 404/501 as a "not yet implemented" signal so the UI can
 * render a PendingBackendCard instead of a generic error toast.
 */
export function isNotImplemented(err: unknown): boolean {
  if (!axios.isAxiosError(err)) return false
  const status = err.response?.status
  return status === 404 || status === 501
}

/**
 * React Query defaults used by every patient portal query. Keeps retries
 * off for 404/501 and 401 so we don't hammer unimplemented routes.
 */
const PATIENT_QUERY_OPTS = {
  retry: (failureCount: number, err: unknown) => {
    if (!axios.isAxiosError(err)) return failureCount < 1
    const status = err.response?.status ?? 0
    if (status === 404 || status === 501 || status === 401 || status === 403) return false
    return failureCount < 1
  },
  staleTime: 30_000,
}

export function useMyProfile() {
  return useQuery({
    queryKey: ['me', 'profile'],
    queryFn: getMyProfile,
    ...PATIENT_QUERY_OPTS,
  })
}

export function useMyVisits(page = 0, size = 20) {
  return useQuery({
    queryKey: ['me', 'visits', page, size],
    queryFn: () => getMyVisits(page, size),
    ...PATIENT_QUERY_OPTS,
  })
}

export function useMyVisit(visitId: number | undefined) {
  return useQuery({
    queryKey: ['me', 'visits', visitId],
    queryFn: () => getMyVisit(visitId as number),
    enabled: !!visitId,
    ...PATIENT_QUERY_OPTS,
  })
}

export function useMyQr() {
  return useQuery({
    queryKey: ['me', 'qr'],
    queryFn: getMyQr,
    ...PATIENT_QUERY_OPTS,
  })
}

export function useMyVisitRequests() {
  return useQuery({
    queryKey: ['me', 'visit-requests'],
    queryFn: getMyVisitRequests,
    ...PATIENT_QUERY_OPTS,
  })
}
