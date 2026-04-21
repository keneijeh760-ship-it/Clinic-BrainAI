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

## 11. Nice-to-have enhancements

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
- `src/pages/admin/AdminDashboard.tsx` (items 7)
- `src/pages/admin/UsersList.tsx` (item 6)

And `src/lib/api/endpoints.ts` already has typed placeholders ready - just
add new exported functions that call the new paths and plug them into the
consumers listed above.
