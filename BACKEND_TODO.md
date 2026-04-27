# Backend TODO for NHIS frontend

The red/white frontend at the repo root is already fully built. Several UI
surfaces render a clearly-labeled "pending backend" placeholder because the
backend does not yet expose the required endpoint. This document lists every
missing capability, with suggested shapes and the exact frontend component
that will consume them.

All paths are relative to the Spring context root, so they sit under
`/api/v1`. JWT auth + method security already applies to every route. Update
`SecurityConfig` allowlists as each endpoint lands.

Update statuses:

- [ ] = not implemented
- [x] = implemented (remove the `PendingBackendCard` + swap the frontend hook)

---

## 1. `GET /api/v1/auth/me` (whoami) - **high priority**

Why: the navbar currently shows the token's `sub`/`email` because we only
decode JWT client-side. `UserResponse` for the current user makes the avatar
dropdown accurate (display name, staffId, role) and removes our fallback.

- Auth: any authenticated user
- Response: existing `UserResponse`
  ```json
  {
    "id": 42,
    "staffId": "CHEW-123",
    "name": "Chinonso Okeke",
    "email": "chinonso@example.com",
    "phoneNumber": "+234...",
    "role": "CHEW"
  }
  ```
- Frontend consumers:
  - `AuthProvider` -> call once on mount after login to hydrate the session.
  - `TopNav` avatar dropdown, `ChewDashboard`, `DoctorDashboard`, `AdminDashboard` headers.
- Security: `permitAll` behind `RequireAuth`, i.e. allow any authenticated user.

## 2. `GET /api/v1/patients/mine` - CHEW persistent patient history

Why: the CHEW dashboard currently only remembers the last patient created in
this browser tab. We need a persistent list so the dashboard shows real
metrics and `NewVisit` can offer a patient picker.

- Auth: `CHEW` (or `ADMIN` if you want to reuse)
- Query params: `page` (int, default 0), `size` (int, default 20, cap 100).
  Optional `q` (search by first name / last name / phone).
- Response: `Page<PatientProfileDto>` (ordered by `createdAt DESC`).
- Frontend consumers:
  - `src/pages/chew/ChewDashboard.tsx` -> replace the "Persistent count needs backend" stat + the "My patient history" `PendingBackendCard`.
  - `src/pages/chew/NewVisit.tsx` -> replace the patient ID text input in the "Existing patient" tab with a searchable dropdown.
- Repository: add `PatientRepository.findByCreatedByUserId(userId, Pageable)`.
- Security: filter strictly by `createdByUserId == authenticated user id`.

## 3. `GET /api/v1/visits/mine` - CHEW persistent visit history

Why: the CHEW dashboard can then show real "visits today", "last N visits"
and trend metrics beyond the session.

- Auth: `CHEW`
- Query params: `page`, `size`, optional `since` (ISO instant), optional `riskLevel`.
- Suggested response DTO (new):
  ```java
  public record VisitSummaryDto(
      Long visitId,
      Long patientId,
      String qrToken,
      String patientName,
      String chiefComplaint,
      RiskLevel riskLevel,
      Instant visitTime,
      boolean hasOutcome
  ) {}
  ```
- Response: `Page<VisitSummaryDto>`.
- Frontend consumers: `ChewDashboard` recent activity, future analytics page.

## 4. `GET /api/v1/visits/pending-review` - Doctor triage queue

Why: the Doctor dashboard currently shows a `PendingBackendCard` for "Pending
reviews". This powers the real queue.

- Auth: `DOCTOR`, `ADMIN`
- Query params: `page`, `size`, optional `riskLevel` filter, optional
  `locationName` filter.
- Response: `Page<VisitSummaryDto>` filtered to `outcome IS NULL`, newest
  first, usually `RED` then `YELLOW` then `GREEN`.
- Frontend consumers: `src/pages/doctor/DoctorDashboard.tsx` queue card; the
  Doctor Lookup page can additionally show a "Pending visits" shortcut list.

## 5. `GET /api/v1/outcomes/mine?since=today` - Doctor personal stats

Why: the Doctor dashboard wants "outcomes today" and "outcomes this week"
stat cards.

- Auth: `DOCTOR`
- Query params: `since` (`today` | `7d` | `30d` | ISO instant)
- Suggested response:
  ```json
  {
    "total": 12,
    "byDecision": {
      "ADMIT": 3,
      "REFER": 2,
      "DISCHARGE": 7
    }
  }
  ```
- Frontend consumers: `DoctorDashboard` stat cards, future outcome analytics.

## 6. `GET /api/v1/users` - Admin user directory

Why: the Admin > Users page is a fully-wired table (filters, search,
pagination, role chips, page size selector). It currently renders one big
placeholder card. This endpoint unlocks it entirely.

- Auth: `ADMIN`
- Query params:
  - `page` (int, default 0)
  - `size` (int, default 20, cap 100)
  - `role` (`CHEW` | `DOCTOR` | `ADMIN`, optional)
  - `q` (optional - matches `name`, `email`, `staffId`)
  - `sort` (optional, e.g. `createdAt,desc`)
- Response: `Page<UserResponse>`
- Frontend consumers: `src/pages/admin/UsersList.tsx`.
- Security: `@PreAuthorize("hasRole('ADMIN')")`.
- Repo: `UserRepository.findByRoleAndSearch(...)` with a Specification.

## 7. `GET /api/v1/stats/overview` - Admin dashboard stats

Why: the Admin dashboard shows four `PendingBackendCard` tiles at the top
("Total users", "Total patients", "Visits today", "Outcomes today"). This
endpoint replaces them with real numbers.

- Auth: `ADMIN`
- Response suggestion:
  ```json
  {
    "totalUsers": 321,
    "usersByRole": {
      "CHEW": 250,
      "DOCTOR": 60,
      "ADMIN": 11
    },
    "totalPatients": 4821,
    "totalVisits": 8120,
    "visitsToday": 32,
    "outcomesToday": 18,
    "visitsLast7Days": [18, 22, 31, 24, 27, 30, 32]
  }
  ```
- Frontend consumers: `src/pages/admin/AdminDashboard.tsx` stat tiles.
- Recommend caching via Redis for 60s - all counts are cheap to recompute.

## 8. `GET /api/v1/patients/search?q=` - Doctor fallback search

Why: the doctor's primary entry is QR, but they occasionally need to find
a patient by name or phone (phone battery is dead, QR is smudged, etc.).

- Auth: `DOCTOR`, `ADMIN`
- Query params: `q` (min length 2), `page`, `size`
- Response: `Page<PatientProfileDto>` ordered by most-recent visit.
- Frontend consumers: `src/pages/doctor/DoctorLookup.tsx` - add a third tab
  "Search by name/phone" once this exists.

## 9. `POST /api/v1/auth/refresh` - token rotation (nice-to-have)

Why: without it we rely on localStorage JWT + short expiry. A refresh
endpoint + httpOnly cookie refresh token is the long-term answer.

- Auth: valid refresh cookie (out of band)
- Response: `AuthenticationResponse { token }`
- Frontend consumers: `src/lib/api/client.ts` 401 interceptor - it would try
  `refresh` once before logging the user out.

## 10. `SecurityConfig` matchers to add

When the routes above land, add the following matchers:

```java
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/v1/auth/me").authenticated()
    .requestMatchers("/api/v1/patients/mine").hasRole("CHEW")
    .requestMatchers("/api/v1/visits/mine").hasRole("CHEW")
    .requestMatchers("/api/v1/visits/pending-review").hasAnyRole("DOCTOR", "ADMIN")
    .requestMatchers("/api/v1/outcomes/mine").hasRole("DOCTOR")
    .requestMatchers("/api/v1/users").hasRole("ADMIN")
    .requestMatchers("/api/v1/stats/**").hasRole("ADMIN")
    .requestMatchers("/api/v1/patients/search").hasAnyRole("DOCTOR", "ADMIN")
    ...
);
```

## 11. Patient Self-Serve Portal (PATIENT role)

A full patient-facing portal ships on the frontend today under `/patient/*` and
`/register/patient`. Every page degrades gracefully to a `PendingBackendCard`
when these endpoints are missing, so the UI is fully usable the moment each
backend item lands.

### 11.1 Identity model

- Add a new value to the `Role` enum: `PATIENT` (alongside `CHEW`, `DOCTOR`,
  `ADMIN`).
- Patients sign up directly (no admin needed) and the `UserEntity` is created
  immediately. A clinical `PatientEntity` is **not** created at signup.
- On the CHEW side, `PatientEntity` is created lazily on the first visit. When
  a visit is submitted or a patient is registered by a CHEW, the backend must
  try to **auto-link** the new `PatientEntity` to an existing `UserEntity` with
  `role = PATIENT` whose `email` or `phoneNumber` matches. If a match exists,
  set `PatientEntity.userId`. Otherwise leave null and do nothing.
- Optional follow-up endpoint (not needed for MVP):
  `POST /api/v1/patients/{id}/link-user` with body `{ userId }` - CHEW/ADMIN
  override to link a clinical record to a user account manually.

### 11.2 Schema migrations

```sql
-- Extend the role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'PATIENT';

-- Link a user account to a clinical record (nullable, unique).
ALTER TABLE patients
  ADD COLUMN user_id BIGINT NULL UNIQUE REFERENCES users(id);

-- Visit requests (self-serve "I need a visit" inbox)
CREATE TABLE visit_requests (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  preferred_location VARCHAR(200) NOT NULL,
  urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('ROUTINE', 'URGENT')),
  description TEXT NOT NULL,
  phone_number VARCHAR(32),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'CONVERTED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  converted_visit_id BIGINT NULL REFERENCES visits(id)
);
CREATE INDEX idx_visit_requests_user ON visit_requests(user_id, created_at DESC);
CREATE INDEX idx_visit_requests_status ON visit_requests(status, urgency);
```

### 11.3 SecurityConfig

- `POST /api/v1/auth/register/patient` - **public** (permitAll).
- `/api/v1/me/**` - requires `ROLE_PATIENT`. Every handler must scope data by
  the authenticated principal's user id; never accept a patient id in the URL.
- Existing CHEW/doctor endpoints keep their current authorization. The new
  `patients.user_id` column is server-side only; no response needs to leak it.

### 11.4 Endpoints (all must be implemented)

| Method & path | Role | Request body | Response | Notes |
| --- | --- | --- | --- | --- |
| `POST /api/v1/auth/register/patient` | Public | `PatientSignupRequest` | `AuthenticationResponse` | Creates `UserEntity` with `role=PATIENT`. Do **not** create a `PatientEntity`. Hash password with BCrypt. Enforce unique email. |
| `GET  /api/v1/me/profile` | PATIENT | - | `MyProfileDto` | Returns the current user + their `PatientEntity` if linked, else `patient: null`. |
| `PATCH /api/v1/me/profile` | PATIENT | `UpdateMyProfileRequest` | `MyProfileDto` | Updates the `UserEntity`'s preferred demographics. If a `PatientEntity` is linked, write-through to the clinical record too. |
| `GET  /api/v1/me/visits?page=&size=` | PATIENT | - | `Page<MyVisitSummaryDto>` | Filter by `visit.patientId` where `patient.userId == currentUserId`. Return an empty page if not linked. |
| `GET  /api/v1/me/visits/{visitId}` | PATIENT | - | `MyVisitDetailDto` | Must 403 (or 404) if the visit does not belong to the current user. |
| `GET  /api/v1/me/qr` | PATIENT | - | `MyQrDto` | 404 if no `PatientEntity`. Include `qrCodeBase64` if cheap to generate. |
| `POST /api/v1/me/visit-requests` | PATIENT | `CreateVisitRequestRequest` | `VisitRequestDto` | Persists a `PENDING` row. No PatientEntity required. |
| `GET  /api/v1/me/visit-requests` | PATIENT | - | `List<VisitRequestDto>` | Newest first. |
| `GET  /api/v1/me/export` | PATIENT | - | `{ exportedAt, profile, visits, outcomes }` | Optional. The frontend falls back to assembling JSON from cached queries if this 404s. |

### 11.5 DTO shapes (mirror the frontend `types.ts`)

```java
// PatientSignupRequest
record PatientSignupRequest(
    @Email @NotBlank String email,
    @Size(min = 8) String password,
    @NotBlank String firstName,
    @NotBlank String lastName,
    String phoneNumber,
    LocalDate dateOfBirth,
    Sex gender,          // reuse existing enum
    String address
) {}

// UpdateMyProfileRequest (all optional, PATCH semantics)
record UpdateMyProfileRequest(
    String firstName, String lastName, String phoneNumber,
    LocalDate dateOfBirth, Sex gender, String address
) {}

// MyProfileDto
record MyProfileDto(UserResponse user, PatientProfileDto patient) {} // patient may be null

// MyVisitSummaryDto (list view)
record MyVisitSummaryDto(
    Long visitId, String qrToken, Instant visitTime, String locationName,
    String chiefComplaint, RiskLevel riskLevel, boolean hasOutcome,
    OutcomeDecision outcomeDecision
) {}

// MyVisitDetailDto (detail view)
record MyVisitDetailDto(
    Long visitId, Long patientId, String qrToken, Instant visitTime,
    String locationName, String chiefComplaint, RiskLevel riskLevel,
    String aiSummary, VitalsDto vitals, SymptomFlagsDto symptomFlags,
    OutcomeDto outcome, CapturedBy capturedBy
) {
  record CapturedBy(Long id, String name) {}
}

// MyQrDto
record MyQrDto(String qrToken, String qrCodeBase64) {}

// VisitRequest
record CreateVisitRequestRequest(
    @NotBlank String preferredLocation,
    @NotNull VisitRequestUrgency urgency,
    @Size(min = 10, max = 1500) String description,
    String phoneNumber,
    @AssertTrue boolean consent
) {}

record VisitRequestDto(
    Long id, String preferredLocation, VisitRequestUrgency urgency,
    String description, String phoneNumber, VisitRequestStatus status,
    Instant createdAt, Long convertedVisitId
) {}

enum VisitRequestUrgency { ROUTINE, URGENT }
enum VisitRequestStatus  { PENDING, ACCEPTED, DECLINED, CONVERTED }
```

### 11.6 CHEW-side linking rule (modify existing endpoints)

On `POST /api/v1/visits/submit` and `POST /api/v1/patients/register`, after
persisting the `PatientEntity`:

1. If `demographics.email` (if added) or `demographics.phoneNumber` matches a
   `UserEntity` with `role=PATIENT`, set `patient.userId = user.id`.
2. If there is no match, do nothing. The patient can still self-register later;
   an admin can manually link if needed.

No response shape change is required for the CHEW flow - just the side-effect.

### 11.7 Frontend consumers

Every `/patient/*` page lives in `src/pages/patient/` and every query goes
through `src/pages/patient/hooks.ts`. Direct map from endpoint to consumer:

| Endpoint | Consumers |
| --- | --- |
| `POST /auth/register/patient` | `src/pages/public/RegisterPatient.tsx` |
| `GET /me/profile` | `PatientDashboard.tsx`, `PatientProfile.tsx`, `PatientQr.tsx`, `PatientExport.tsx` |
| `PATCH /me/profile` | `PatientProfile.tsx` |
| `GET /me/visits` | `PatientDashboard.tsx`, `PatientVisits.tsx`, `PatientExport.tsx` |
| `GET /me/visits/{id}` | `PatientVisitDetail.tsx` |
| `GET /me/qr` | `PatientQr.tsx` |
| `POST /me/visit-requests` | `PatientRequestVisit.tsx` |
| `GET /me/visit-requests` | `PatientDashboard.tsx`, `PatientRequests.tsx` |
| `GET /me/export` | `PatientExport.tsx` (optional; client fallback built in) |

The frontend already treats HTTP 404/501 from any of the `/me/*` endpoints as
"not yet implemented" and renders a `PendingBackendCard`, so partial rollout
of these endpoints is safe.

### 11.8 Out of scope for MVP (future work)

- Email/phone verification (OTP) on patient signup.
- Admin UI for reviewing pending `visit_requests` and accepting them
  (converts a request into a scheduled visit and stamps `converted_visit_id`).
- SSE/WebSocket push so patients see outcome updates without refresh.

---

## 12. Nice-to-have enhancements

- Return `createdAt` in `PatientProfileDto` and `UserResponse` for sort & display.
- Return `qrCodeBase64` on `submitVisit` AND `registerPatient` consistently (already done for `registerPatient`; double check the visit path).
- Add `DoctorPatientViewDto.latestVisitHasOutcome` so the UI can simplify its
  "readonly vs form" branching.
- `GET /api/v1/leaderboard/me` - return the current CHEW's row (rank, points,
  patients, visits) without parsing the whole list client-side.
- Server-sent events or a WebSocket for "new pending visit" so doctors see
  RED-flag arrivals live.

---

## Frontend files that reference this TODO

Search the frontend for `PendingBackendCard` - every usage corresponds to an
entry above:

- `src/pages/chew/ChewDashboard.tsx` (items 2, 3)
- `src/pages/doctor/DoctorDashboard.tsx` (items 4, 5)
- `src/pages/admin/AdminDashboard.tsx` (item 7)
- `src/pages/admin/UsersList.tsx` (item 6)
- `src/pages/patient/PatientDashboard.tsx` (item 11)
- `src/pages/patient/PatientProfile.tsx` (item 11)
- `src/pages/patient/PatientVisits.tsx` (item 11)
- `src/pages/patient/PatientVisitDetail.tsx` (item 11)
- `src/pages/patient/PatientQr.tsx` (item 11)
- `src/pages/patient/PatientRequestVisit.tsx` (item 11)
- `src/pages/patient/PatientRequests.tsx` (item 11)
- `src/pages/patient/PatientExport.tsx` (item 11)

And `src/lib/api/endpoints.ts` already has typed placeholders ready - just
add new exported functions that call the new paths and plug them into the
consumers listed above.
