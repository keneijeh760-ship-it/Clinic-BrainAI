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

## Key Frontend Paths

- App entry: [src/main.tsx](src/main.tsx)
- Routing: [src/App.tsx](src/App.tsx)

### Pages
- CHEW
  - Dashboard: [src/pages/CHEWDashboard.tsx](src/pages/CHEWDashboard.tsx)
  - New patient capture: [src/pages/NewPatient.tsx](src/pages/NewPatient.tsx)
  - Patient result + QR: [src/pages/PatientResult.tsx](src/pages/PatientResult.tsx)
- Doctor
  - Dashboard: [src/pages/DoctorDashboard.tsx](src/pages/DoctorDashboard.tsx)
  - Manual QR entry: [src/pages/DoctorScan.tsx](src/pages/DoctorScan.tsx)
  - QR patient record view: [src/pages/DoctorPatientView.tsx](src/pages/DoctorPatientView.tsx)
- Shared
  - Leaderboard: [src/pages/Leaderboard.tsx](src/pages/Leaderboard.tsx)

### API Layer
- Fetch client + endpoints: [src/lib/api/index.ts](src/lib/api/index.ts)
- DTO types (kept aligned with Spring DTOs): [src/lib/api/types.ts](src/lib/api/types.ts)
- React hooks wrapper: [src/hooks/useApi.ts](src/hooks/useApi.ts)

### Local “Offline-First” Storage
For hackathon reliability (even when the backend is slow/unavailable), we store captures locally:
- Cache helpers: [src/lib/patientCache.ts](src/lib/patientCache.ts)
- Starter/demo captures: [src/lib/starterData.ts](src/lib/starterData.ts)

## Backend API (expected)

Base path: `/api`

- `GET /health`
- `POST /users`
- `POST /patients/register`
- `POST /visits/submit`
- `GET /patients/qr/{qrToken}`
- `POST /outcomes`
- `GET /leaderboard?top=10`

## Run Locally

### Frontend
```bash
npm install
npm run dev
```

Optional: point the frontend to a different API base URL in local dev:
- `VITE_API_BASE_URL=http://localhost:8080/api`

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
