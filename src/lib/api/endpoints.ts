import { api } from './client'
import type {
  AuthenticationRequest,
  AuthenticationResponse,
  CreateUserRequest,
  DoctorPatientViewDto,
  LeaderboardEntryDto,
  OutcomeDto,
  PatientProfileDto,
  RecordOutcomeRequest,
  RegisterPatientRequest,
  RegisterRequest,
  SubmitVisitRequest,
  SubmitVisitResponse,
  UserResponse,
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
