# Patient Portal - Frontend / Backend Handoff

This document is the high-level companion to [BACKEND_TODO.md](BACKEND_TODO.md). It
lists every frontend file added or modified in this branch and maps each one to
the backend additions required to light up the new patient self-serve portal.

For exact DTO bodies, validation rules, SQL, and `SecurityConfig` matchers, see
section 11 of [BACKEND_TODO.md](BACKEND_TODO.md).

---

## TL;DR

- New `PATIENT` user role - sits alongside `CHEW`, `DOCTOR`, `ADMIN`.
- Patients sign themselves up at `POST /api/v1/auth/register/patient` (public, no
  admin needed). Only a `UserEntity` is created at signup - **no** `PatientEntity`
  yet.
- A new family of `/api/v1/me/*` endpoints powers the patient portal: profile,
  visits, QR, visit-requests, export.
- A clinical `PatientEntity` is created lazily on the patient's first CHEW visit.
  At that moment the backend auto-links the patient row to an existing
  `users.id` by matching email / phone (sets `patients.user_id`).
- New `visit_requests` table backs the patient "I need a visit" inbox.
- The frontend treats `404` / `501` from any `/me/*` route as "not yet
  implemented" and renders a graceful pending state, so backend can ship these
  endpoints incrementally without breaking the UI.

---

## 1. Frontend file changes

### 1.1 New files

| File | Purpose |
| --- | --- |
| [src/pages/public/RegisterPatient.tsx](src/pages/public/RegisterPatient.tsx) | Public patient signup form. Calls `POST /auth/register/patient`, then logs the user in with the returned JWT. |
| [src/pages/public/RoleSwitch.tsx](src/pages/public/RoleSwitch.tsx) | Segmented toggle ("I'm a CHEW" / "I'm a patient") shown at the top of the two `/register` pages. |
| [src/pages/patient/PatientDashboard.tsx](src/pages/patient/PatientDashboard.tsx) | Patient home. Pulls `/me/profile`, recent `/me/visits`, recent `/me/visit-requests`. |
| [src/pages/patient/PatientProfile.tsx](src/pages/patient/PatientProfile.tsx) | Read/write own demographics. `GET /me/profile`, `PATCH /me/profile`. |
| [src/pages/patient/PatientVisits.tsx](src/pages/patient/PatientVisits.tsx) | Paginated visit list. `GET /me/visits?page=&size=`. |
| [src/pages/patient/PatientVisitDetail.tsx](src/pages/patient/PatientVisitDetail.tsx) | Single-visit view (vitals, AI summary, outcome). `GET /me/visits/{id}`. |
| [src/pages/patient/PatientQr.tsx](src/pages/patient/PatientQr.tsx) | Health QR display + print. `GET /me/qr`. Uses the new print CSS hook `#nhis-print-card`. |
| [src/pages/patient/PatientRequestVisit.tsx](src/pages/patient/PatientRequestVisit.tsx) | Self-serve "request a visit" form. `POST /me/visit-requests`. |
| [src/pages/patient/PatientRequests.tsx](src/pages/patient/PatientRequests.tsx) | List of the user's visit-requests with status. `GET /me/visit-requests`. |
| [src/pages/patient/PatientExport.tsx](src/pages/patient/PatientExport.tsx) | Download a JSON export of the patient's record. `GET /me/export` with a client-side fallback that assembles the export from cached queries if the endpoint 404s. |
| [src/pages/patient/hooks.ts](src/pages/patient/hooks.ts) | React-Query wrappers for every `/me/*` endpoint. Exports `isNotImplemented(err)` which the pages use to switch to a `PendingBackendCard` on `404` / `501`. |
| [src/components/common/LinkedRecordBanner.tsx](src/components/common/LinkedRecordBanner.tsx) | Status banner shown on the patient portal: green when `MyProfileDto.patient` is non-null, brand-red while the user has no clinical record yet (i.e. before their first CHEW visit). |

### 1.2 Modified files

| File | What changed |
| --- | --- |
| [src/App.tsx](src/App.tsx) | Added `/register/patient` (public) and the `/patient/*` route tree, all guarded by `RequireRole(['PATIENT'])`. |
| [src/components/layout/TopNav.tsx](src/components/layout/TopNav.tsx) | Added PATIENT nav items (Dashboard / My visits / My QR / Request visit / Export). Leaderboard link is now hidden for `PATIENT`; avatar dropdown gets "My profile" + "Export my record" entries when the role is `PATIENT`. |
| [src/lib/api/types.ts](src/lib/api/types.ts) | Added `PATIENT` to `UserRole`. Added new types: `PatientSignupRequest`, `MyProfileDto`, `MyVisitSummaryDto`, `MyVisitDetailDto`, `MyQrDto`, `CreateVisitRequestRequest`, `VisitRequestDto`, `UpdateMyProfileRequest`, `VisitRequestUrgency`, `VisitRequestStatus`, generic `PageResponse<T>`. |
| [src/lib/api/endpoints.ts](src/lib/api/endpoints.ts) | New API client functions: `registerPatientAccount`, `getMyProfile`, `updateMyProfile`, `getMyVisits`, `getMyVisit`, `getMyQr`, `createVisitRequest`, `getMyVisitRequests`, `exportMyRecord`. |
| [src/lib/auth/jwt.ts](src/lib/auth/jwt.ts) | `normalizeRole` now recognizes `PATIENT` (and `ROLE_PATIENT`). `homePathFor('PATIENT')` returns `/patient`. |
| [src/lib/sessionScratch.ts](src/lib/sessionScratch.ts) | Two new scratch keys: `lastPatientVisitViewed`, `lastVisitRequest`. |
| [src/pages/admin/CreateUser.tsx](src/pages/admin/CreateUser.tsx) | Admin user creation is now typed to a local `StaffRole = 'CHEW' \| 'DOCTOR' \| 'ADMIN'` so admins cannot accidentally provision a `PATIENT` account through this form. |
| [src/pages/public/Landing.tsx](src/pages/public/Landing.tsx) | 4-card role grid (Patient first), patient-first CTA in the hero, and a dual signup CTA in the footer. |
| [src/pages/public/Login.tsx](src/pages/public/Login.tsx) | Sub-line under the form now offers both "Create a CHEW account" and "Sign up as a patient". |
| [src/pages/public/Register.tsx](src/pages/public/Register.tsx) | Renders the new `RoleSwitch` at the top with `active="chew"`. No behavior change for CHEW signup. |
| [src/index.css](src/index.css) | Added `@media print` rule that isolates `#nhis-print-card` so the QR page prints cleanly. |

---

## 2. Backend changes required

The full granular spec lives in [BACKEND_TODO.md - section 11](BACKEND_TODO.md).
Below is the condensed checklist.

### 2.1 Schema migrations

```sql
-- New role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'PATIENT';

-- Optional FK from a clinical record to a user account
ALTER TABLE patients
  ADD COLUMN user_id BIGINT NULL UNIQUE REFERENCES users(id);

-- Patient self-serve visit-request inbox
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

### 2.2 Identity model

- Add `PATIENT` to the `Role` enum.
- Patient signup creates a `UserEntity` only. **Do not** create a
  `PatientEntity` at signup.
- A `PatientEntity` is created the way it already is today - on the CHEW's
  first visit submission / patient registration. After persisting the entity,
  add an auto-link step: if any existing `UserEntity` with `role = PATIENT`
  matches the new patient's `email` or `phoneNumber`, set
  `patient.userId = user.id`. Otherwise leave it null.
- No clinical-data leak: `patients.user_id` is server-side only and must not
  appear in any response payload.

### 2.3 New endpoints

| Method & path | Role | Frontend consumer |
| --- | --- | --- |
| `POST /api/v1/auth/register/patient` | Public (`permitAll`) | [RegisterPatient.tsx](src/pages/public/RegisterPatient.tsx) |
| `GET  /api/v1/me/profile` | PATIENT | [PatientDashboard](src/pages/patient/PatientDashboard.tsx), [PatientProfile](src/pages/patient/PatientProfile.tsx), [PatientQr](src/pages/patient/PatientQr.tsx), [PatientExport](src/pages/patient/PatientExport.tsx) |
| `PATCH /api/v1/me/profile` | PATIENT | [PatientProfile](src/pages/patient/PatientProfile.tsx) |
| `GET  /api/v1/me/visits?page=&size=` | PATIENT | [PatientDashboard](src/pages/patient/PatientDashboard.tsx), [PatientVisits](src/pages/patient/PatientVisits.tsx), [PatientExport](src/pages/patient/PatientExport.tsx) |
| `GET  /api/v1/me/visits/{visitId}` | PATIENT | [PatientVisitDetail](src/pages/patient/PatientVisitDetail.tsx) |
| `GET  /api/v1/me/qr` | PATIENT | [PatientQr](src/pages/patient/PatientQr.tsx) |
| `POST /api/v1/me/visit-requests` | PATIENT | [PatientRequestVisit](src/pages/patient/PatientRequestVisit.tsx) |
| `GET  /api/v1/me/visit-requests` | PATIENT | [PatientDashboard](src/pages/patient/PatientDashboard.tsx), [PatientRequests](src/pages/patient/PatientRequests.tsx) |
| `GET  /api/v1/me/export` *(optional)* | PATIENT | [PatientExport](src/pages/patient/PatientExport.tsx) - falls back to client-side assembly if absent |

Every `/me/*` handler must scope strictly by the authenticated principal's user
id. **Never** accept a patient id in the URL on these routes.

### 2.4 Existing endpoints to modify (auto-link side effect)

Both of these endpoints already exist. Add a small post-persist step:

- `POST /api/v1/visits/submit`
- `POST /api/v1/patients/register`

After saving the new `PatientEntity`, look up an existing `UserEntity` with
`role = PATIENT` whose `email` (if present in the demographics) or
`phoneNumber` matches the patient's. If found, set `patient.userId = user.id`.
If not found, do nothing - the patient can still register later. **No response
shape change is required.**

### 2.5 SecurityConfig

Add the following matchers (full snippet in
[BACKEND_TODO.md - section 11.3](BACKEND_TODO.md)):

```java
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/v1/auth/register/patient").permitAll()
    .requestMatchers("/api/v1/me/**").hasRole("PATIENT")
    // ... existing matchers stay as-is
);
```

### 2.6 DTO mirrors

The Java records must mirror the TypeScript shapes already declared in
[src/lib/api/types.ts](src/lib/api/types.ts). Field names and casing must match
exactly:

- `PatientSignupRequest`
- `UpdateMyProfileRequest`
- `MyProfileDto` (`{ user: UserResponse, patient: PatientProfileDto | null }`)
- `MyVisitSummaryDto`, `MyVisitDetailDto`
- `MyQrDto` (`qrToken`, optional `qrCodeBase64`)
- `CreateVisitRequestRequest`, `VisitRequestDto`
- `VisitRequestUrgency` (`ROUTINE` | `URGENT`)
- `VisitRequestStatus` (`PENDING` | `ACCEPTED` | `DECLINED` | `CONVERTED`)
- Paginated responses can use Spring's default `Page<T>` shape - the
  frontend's `PageResponse<T>` is a structural superset of it.

---

## 3. Graceful-degradation contract

Every patient query goes through [src/pages/patient/hooks.ts](src/pages/patient/hooks.ts).
That module exposes `isNotImplemented(err)` which returns true for HTTP `404`
or `501`, and the pages use it to render a `PendingBackendCard` instead of an
error toast. Auth failures (`401` / `403`) and network errors still surface
normally.

In practice this means the backend can ship the endpoints in any order without
breaking the UI - any unimplemented `/me/*` route just shows a "pending
backend" card on the relevant card / page until it lands.

---

## 4. Suggested rollout order

1. `Role.PATIENT` enum value + migration + `POST /auth/register/patient`.
   This alone unlocks signup, login, and the empty patient dashboard.
2. `GET /me/profile` (returns `{ user, patient: null }` initially is fine).
3. Auto-link side-effect on `POST /visits/submit` and `POST /patients/register`.
   From this point a CHEW visit links the patient's record to their account.
4. `GET /me/visits`, `GET /me/visits/{id}`, `GET /me/qr`, `PATCH /me/profile`.
5. `visit_requests` table + `POST /me/visit-requests` + `GET /me/visit-requests`.
6. `GET /me/export` (optional - frontend already has a working client fallback).

---

## 5. See also

- [BACKEND_TODO.md](BACKEND_TODO.md) - canonical, granular spec (full DTO
  bodies, validation, SQL, `SecurityConfig` snippet, future work).
- [src/pages/patient/hooks.ts](src/pages/patient/hooks.ts) - the contract the
  UI uses to detect "not yet implemented" responses.
- [src/lib/api/types.ts](src/lib/api/types.ts) - source of truth for DTO
  shapes the backend must mirror.
