import { api } from './client'
import type {
  AuthenticationRequest,
  AuthenticationResponse,
  CreateUserRequest,
  CreateVisitRequestRequest,
  DoctorPatientViewDto,
  LeaderboardEntryDto,
  MyProfileDto,
  MyQrDto,
  MyVisitDetailDto,
  MyVisitSummaryDto,
  OutcomeDto,
  PageResponse,
  PatientProfileDto,
  PatientSignupRequest,
  RecordOutcomeRequest,
  RegisterPatientRequest,
  RegisterRequest,
  SubmitVisitRequest,
  SubmitVisitResponse,
  UpdateMyProfileRequest,
  UserResponse,
  VisitRequestDto,
} from './types'

// ----- Auth -------------------------------------------------------------

export async function registerAccount(payload: RegisterRequest): Promise<AuthenticationResponse> {
  const { data } = await api.post<AuthenticationResponse>('/auth/register', payload)
  return data
}

export async function loginAccount(payload: AuthenticationRequest): Promise<AuthenticationResponse> {
  const { data } = await api.post<AuthenticationResponse>('/auth/login', payload)
  return data
}

// ----- Health -----------------------------------------------------------

export interface HealthStatus {
  status: string
}

export async function getHealth(): Promise<HealthStatus> {
  const { data } = await api.get<HealthStatus>('/health')
  return data
}

// ----- Patients ---------------------------------------------------------

export async function registerPatient(payload: RegisterPatientRequest): Promise<PatientProfileDto> {
  const { data } = await api.post<PatientProfileDto>('/patients/register', payload)
  return data
}

export async function getPatientByQr(qrToken: string): Promise<DoctorPatientViewDto> {
  const { data } = await api.get<DoctorPatientViewDto>(
    `/patients/qr/${encodeURIComponent(qrToken)}`
  )
  return data
}

// ----- Visits -----------------------------------------------------------

export async function submitVisit(payload: SubmitVisitRequest): Promise<SubmitVisitResponse> {
  const { data } = await api.post<SubmitVisitResponse>('/visits/submit', payload)
  return data
}

// ----- Outcomes ---------------------------------------------------------

export async function recordOutcome(payload: RecordOutcomeRequest): Promise<OutcomeDto> {
  const { data } = await api.post<OutcomeDto>('/outcomes', payload)
  return data
}

// ----- Users ------------------------------------------------------------

export async function createUser(payload: CreateUserRequest): Promise<UserResponse> {
  const { data } = await api.post<UserResponse>('/users', payload)
  return data
}

export async function getUserById(id: number): Promise<UserResponse> {
  const { data } = await api.get<UserResponse>(`/users/${id}`)
  return data
}

// ----- Leaderboard ------------------------------------------------------

export async function getLeaderboard(size = 10): Promise<LeaderboardEntryDto[]> {
  const { data } = await api.get<LeaderboardEntryDto[]>('/leaderboard', {
    params: { size },
  })
  return data
}

// ----- Patient portal ---------------------------------------------------
// Endpoints below are consumed by the `/patient/*` UI. Several of these are
// not yet implemented on the backend (see BACKEND_TODO.md, Patient Portal
// section) - the UI catches 404/501 responses and renders a pending state.

export async function registerPatientAccount(
  payload: PatientSignupRequest
): Promise<AuthenticationResponse> {
  const { data } = await api.post<AuthenticationResponse>(
    '/auth/register/patient',
    payload
  )
  return data
}

export async function getMyProfile(): Promise<MyProfileDto> {
  const { data } = await api.get<MyProfileDto>('/me/profile')
  return data
}

export async function updateMyProfile(
  payload: UpdateMyProfileRequest
): Promise<MyProfileDto> {
  const { data } = await api.patch<MyProfileDto>('/me/profile', payload)
  return data
}

export async function getMyVisits(
  page = 0,
  size = 20
): Promise<PageResponse<MyVisitSummaryDto>> {
  const { data } = await api.get<PageResponse<MyVisitSummaryDto>>('/me/visits', {
    params: { page, size },
  })
  return data
}

export async function getMyVisit(visitId: number): Promise<MyVisitDetailDto> {
  const { data } = await api.get<MyVisitDetailDto>(`/me/visits/${visitId}`)
  return data
}

export async function getMyQr(): Promise<MyQrDto> {
  const { data } = await api.get<MyQrDto>('/me/qr')
  return data
}

export async function createVisitRequest(
  payload: CreateVisitRequestRequest
): Promise<VisitRequestDto> {
  const { data } = await api.post<VisitRequestDto>('/me/visit-requests', payload)
  return data
}

export async function getMyVisitRequests(): Promise<VisitRequestDto[]> {
  const { data } = await api.get<VisitRequestDto[]>('/me/visit-requests')
  return data
}

export async function exportMyRecord(): Promise<unknown> {
  const { data } = await api.get<unknown>('/me/export')
  return data
}
