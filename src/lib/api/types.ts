// Mirrors of backend DTOs and enums. Keep these aligned with the Spring DTOs.

export type UserRole = 'CHEW' | 'DOCTOR' | 'ADMIN' | 'PATIENT'
export type RiskLevel = 'GREEN' | 'YELLOW' | 'RED'
export type PaymentOptions = 'NHIS' | 'HMO' | 'SELF_PAY' | 'COMM_FUND' | 'UNKNOWN'
export type OutcomeDecision = 'ADMIT' | 'REFER' | 'DISCHARGE'
export type Sex = 'MALE' | 'FEMALE'

// Auth
export interface RegisterRequest {
  email: string
  password: string
  name: string
  phoneNumber: string
}

export interface AuthenticationRequest {
  email: string
  password: string
}

export interface AuthenticationResponse {
  token: string
}

// User
export interface CreateUserRequest {
  name: string
  email: string
  phoneNumber?: string
  password: string
  role: UserRole
}

export interface UserResponse {
  id: number
  staffId?: string
  name: string
  email: string
  phoneNumber?: string
  role: UserRole
}

// Patient
export interface PatientDemographicsDto {
  firstName: string
  lastName: string
  dateOfBirth?: string // ISO yyyy-mm-dd
  gender?: string
  phoneNumber?: string
  address?: string
}

export interface RegisterPatientRequest {
  demographics: PatientDemographicsDto
}

export interface PatientProfileDto {
  patientId: number
  qrToken: string
  firstName: string
  lastName: string
  dateOfBirth?: string
  gender?: string
  phoneNumber?: string
  address?: string
  qrCodeBase64?: string
  paymentOptions?: PaymentOptions
}

// Visit
export interface VitalsDto {
  bloodPressureSystolic?: number | null
  bloodPressureDiastolic?: number | null
  temperature?: number | null
  pulse?: number | null
  respiratoryRate?: number | null
  oxygenSaturation?: number | null
}

export interface SymptomFlagsDto {
  fever?: boolean
  cough?: boolean
  difficultyBreathing?: boolean
  chestPain?: boolean
  severeHeadache?: boolean
  confusion?: boolean
  bleeding?: boolean
  lossOfConsciousness?: boolean
  severeDehydration?: boolean
  convulsions?: boolean
}

export interface SubmitVisitRequest {
  patientId?: number | null
  patientDemographics?: PatientDemographicsDto | null
  chiefComplaint: string
  symptomFlags?: SymptomFlagsDto
  vitals?: VitalsDto
  locationName: string
}

export interface SubmitVisitResponse {
  patientId: number
  qrToken: string
  riskLevel: RiskLevel | string
  aiSummary?: string
  visitId: number
  pointsEarned: number
  qrCodeBase64?: string
}

// Outcome
export interface OutcomeDto {
  id: number
  decision: OutcomeDecision | string
  note?: string
  recordedAt?: string
}

export interface RecordOutcomeRequest {
  visitId: number
  decision: OutcomeDecision
  note?: string
}

// Doctor QR view
export interface DoctorPatientViewDto {
  patientId: number
  qrToken: string
  firstName: string
  lastName: string
  dateOfBirth?: string
  gender?: string
  phoneNumber?: string
  address?: string

  latestVisitId?: number | null
  visitTime?: string
  chiefComplaint?: string
  riskLevel?: RiskLevel | string
  aiSummary?: string
  locationName?: string

  vitals?: VitalsDto
  outcome?: OutcomeDto | null
}

// Leaderboard
export interface LeaderboardEntryDto {
  chewId: string
  chewName: string
  totalPoints: number
  totalPatientsCaptured: number
  visitCount: number
}

// Backend error envelope (ProblemDetail-like)
export interface ApiError {
  status?: number
  title?: string
  detail?: string
  instance?: string
  errors?: Record<string, string>
  message?: string
}

// ----- Patient portal ---------------------------------------------------
// Frontend-side shapes for the self-serve patient portal. Mirror these on
// the backend as the endpoints in BACKEND_TODO.md are implemented.

export interface PatientSignupRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber?: string
  dateOfBirth?: string
  gender?: Sex
  address?: string
}

export interface MyProfileDto {
  user: UserResponse
  patient: PatientProfileDto | null
}

export interface MyVisitSummaryDto {
  visitId: number
  qrToken?: string
  visitTime: string
  locationName?: string
  chiefComplaint: string
  riskLevel?: RiskLevel | string
  hasOutcome: boolean
  outcomeDecision?: OutcomeDecision | string
}

export interface MyVisitDetailDto {
  visitId: number
  patientId: number
  qrToken?: string
  visitTime: string
  locationName?: string
  chiefComplaint: string
  riskLevel?: RiskLevel | string
  aiSummary?: string
  vitals?: VitalsDto
  symptomFlags?: SymptomFlagsDto
  outcome?: OutcomeDto | null
  capturedBy?: { id: number; name: string } | null
}

export interface MyQrDto {
  qrToken: string
  qrCodeBase64?: string
}

export type VisitRequestUrgency = 'ROUTINE' | 'URGENT'
export type VisitRequestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CONVERTED'

export interface CreateVisitRequestRequest {
  preferredLocation: string
  urgency: VisitRequestUrgency
  description: string
  phoneNumber?: string
  consent: boolean
}

export interface VisitRequestDto {
  id: number
  preferredLocation: string
  urgency: VisitRequestUrgency
  description: string
  phoneNumber?: string
  status: VisitRequestStatus
  createdAt: string
  convertedVisitId?: number | null
}

export interface UpdateMyProfileRequest {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  dateOfBirth?: string
  gender?: Sex
  address?: string
}

// Minimal page wrapper used by paginated endpoints.
export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
