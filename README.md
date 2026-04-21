# Nigeria Healthcare Intelligence System (NHIS) — Cavista Hackathon

**Team:** Mannalon  
**Frontend (this repo — maintained by @prosperisadev):** https://github.com/prosperisadev/healthconnect-nigeria  
**Frontend author GitHub:** https://github.com/prosperisadev  
**Backend (main backend repo):** https://github.com/keneijeh760-ship-it/Clinic-BrainAI

HealthConnect Nigeria (NHIS) is a lightweight, mobile-first clinical flow that helps:
- **CHEWs** capture patient vitals + complaints quickly
- **Patients** get a **Health QR** they can share
- **Doctors** scan the QR to view the patient’s latest record, see AI-generated summaries, and get trend/preventive insights

## Live/Production Architecture

- **Frontend:** Vite + React + TypeScript + Tailwind (deployed on Vercel)
- **Backend:** Spring Boot (deployed on Render)
- **Routing in prod:** the frontend uses same-origin `/api/*` and Vercel rewrites it to Render
  - See [vercel.json](vercel.json)

## Core Product Flow

### 1) CHEW captures a visit
- Register patient demographics
- Submit a visit with:
  - Chief complaint (free text)
  - Vitals (BP, temp, pulse, SpO₂, etc.)
  - Location
- Backend returns:
  - `qrToken`
  - risk level
  - AI summary

### 2) Patient receives a QR
- QR encodes a URL like: `/doctor/patient/{qrToken}`
- This is the “Health ID” used for doctor lookup

### 3) Doctor scans QR
- The Doctor view fetches `/api/patients/qr/{qrToken}`
- Shows:
  - patient profile
  - latest visit + vitals
  - AI summary
  - local trend analysis + preventive guidance (frontend-only)

## Frontend (red/white NHIS theme)

The frontend is a fresh Vite + React + TypeScript + Tailwind v4 app styled in
the "bold Nigerian" red/white palette with a green accent. It uses:

- **shadcn-style primitives** on top of Radix UI for forms, dialogs, tabs, etc.
- **framer-motion** for page transitions, the animated top-nav underline, and
  the landing hero.
- **react-router-dom v6** with `RequireAuth` + `RequireRole` route guards.
- **TanStack Query + axios** with a bearer-token interceptor that auto-logs
  out on 401.
- **html5-qrcode** for uploading QR images in the doctor lookup flow, and
  **qrcode.react** for rendering the patient QR.

### Key paths

- App entry: [src/main.tsx](src/main.tsx)
- Routing: [src/App.tsx](src/App.tsx)
- Theme tokens: [src/index.css](src/index.css)
- Shared layout: [src/components/layout](src/components/layout)
- Brand logo: [src/components/brand/Logo.tsx](src/components/brand/Logo.tsx)
- Shared UI: [src/components/ui](src/components/ui) and [src/components/common](src/components/common)
- API client + endpoints + types: [src/lib/api](src/lib/api)
- Auth provider + JWT decode + guards: [src/lib/auth](src/lib/auth)
- QR helpers: [src/lib/qr](src/lib/qr)

### Pages

- Public
  - Landing: [src/pages/public/Landing.tsx](src/pages/public/Landing.tsx)
  - Login: [src/pages/public/Login.tsx](src/pages/public/Login.tsx)
  - Register (CHEW-only): [src/pages/public/Register.tsx](src/pages/public/Register.tsx)
- CHEW
  - Dashboard: [src/pages/chew/ChewDashboard.tsx](src/pages/chew/ChewDashboard.tsx)
  - New patient: [src/pages/chew/NewPatient.tsx](src/pages/chew/NewPatient.tsx)
  - New visit: [src/pages/chew/NewVisit.tsx](src/pages/chew/NewVisit.tsx)
  - Result + QR: [src/pages/chew/PatientResult.tsx](src/pages/chew/PatientResult.tsx)
- Doctor
  - Dashboard: [src/pages/doctor/DoctorDashboard.tsx](src/pages/doctor/DoctorDashboard.tsx)
  - Lookup (upload QR or paste token): [src/pages/doctor/DoctorLookup.tsx](src/pages/doctor/DoctorLookup.tsx)
  - Patient view + outcome: [src/pages/doctor/DoctorPatientView.tsx](src/pages/doctor/DoctorPatientView.tsx)
- Admin
  - Dashboard: [src/pages/admin/AdminDashboard.tsx](src/pages/admin/AdminDashboard.tsx)
  - Users list: [src/pages/admin/UsersList.tsx](src/pages/admin/UsersList.tsx)
  - Create user: [src/pages/admin/CreateUser.tsx](src/pages/admin/CreateUser.tsx)
  - Tools (find by ID / QR): [src/pages/admin/AdminTools.tsx](src/pages/admin/AdminTools.tsx)
- Shared
  - Leaderboard: [src/pages/shared/Leaderboard.tsx](src/pages/shared/Leaderboard.tsx)

### Backend API consumed today

Base path: `/api/v1` (proxied from `http://localhost:5173/api` to
`http://localhost:8080` in dev by [vite.config.ts](vite.config.ts)).

- `POST /auth/register` - always creates a CHEW account
- `POST /auth/login`
- `GET  /health`
- `POST /patients/register` - CHEW
- `POST /visits/submit` - CHEW
- `GET  /patients/qr/{qrToken}` - DOCTOR, ADMIN
- `POST /outcomes` - DOCTOR
- `POST /users` - ADMIN
- `GET  /users/{id}` - ADMIN, DOCTOR, CHEW
- `GET  /leaderboard?size=10` - authenticated

Anything the UI shows as "pending backend" is intentionally waiting on the
endpoints listed in [BACKEND_TODO.md](BACKEND_TODO.md).

## Run Locally

### Frontend
```bash
npm install
npm run dev
```

Copy [.env.example](.env.example) to `.env` if you want to override the
default API base URL (`/api/v1`).

### Backend (for local testing)
From `backend/`:
```bash
mvn spring-boot:run
```

Backend requires DB env vars if not using H2:
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

## Notes on AI

- The backend generates an **AI summary** for the latest visit and returns it in the visit response and doctor QR view.
- The **doctor-only “Trend Analysis”** and **“Preventive Steps”** sections are implemented on the frontend using available patient history (cached captures + latest backend snapshot).

## Repo Navigation (quick mental model)

- `src/pages/*` = screens
- `src/lib/api/*` = backend integration
- `src/hooks/*` = data-fetching hooks
- `backend/*` = Spring Boot service used by Render (also maintained in the backend repo listed above)

---

Built with love by **Mannalon** for the **Cavista Hackathon** 🇳🇬
