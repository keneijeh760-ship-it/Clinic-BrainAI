import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/lib/auth/AuthProvider'
import { homePathFor } from '@/lib/auth/jwt'
import { RequireAuth } from '@/lib/auth/RequireAuth'
import { RequireRole } from '@/lib/auth/RequireRole'
import { AppShell } from '@/components/layout/AppShell'

import Landing from '@/pages/public/Landing'
import Login from '@/pages/public/Login'
import Register from '@/pages/public/Register'
import RegisterPatient from '@/pages/public/RegisterPatient'
import NotFound from '@/pages/shared/NotFound'
import Unauthorized from '@/pages/shared/Unauthorized'
import Leaderboard from '@/pages/shared/Leaderboard'

import ChewDashboard from '@/pages/chew/ChewDashboard'
import NewPatient from '@/pages/chew/NewPatient'
import NewVisit from '@/pages/chew/NewVisit'
import PatientResult from '@/pages/chew/PatientResult'

import DoctorDashboard from '@/pages/doctor/DoctorDashboard'
import DoctorLookup from '@/pages/doctor/DoctorLookup'
import DoctorPatientView from '@/pages/doctor/DoctorPatientView'

import AdminDashboard from '@/pages/admin/AdminDashboard'
import UsersList from '@/pages/admin/UsersList'
import CreateUser from '@/pages/admin/CreateUser'
import AdminTools from '@/pages/admin/AdminTools'

import PatientDashboard from '@/pages/patient/PatientDashboard'
import PatientProfile from '@/pages/patient/PatientProfile'
import PatientVisits from '@/pages/patient/PatientVisits'
import PatientVisitDetail from '@/pages/patient/PatientVisitDetail'
import PatientQr from '@/pages/patient/PatientQr'
import PatientRequestVisit from '@/pages/patient/PatientRequestVisit'
import PatientRequests from '@/pages/patient/PatientRequests'
import PatientExport from '@/pages/patient/PatientExport'

function PublicOnly({ element }: { element: React.ReactElement }) {
  const { isAuthenticated, role } = useAuth()
  if (isAuthenticated) return <Navigate to={homePathFor(role)} replace />
  return element
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicOnly element={<Login />} />} />
      <Route path="/register" element={<PublicOnly element={<Register />} />} />
      <Route
        path="/register/patient"
        element={<PublicOnly element={<RegisterPatient />} />}
      />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Authenticated shell */}
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/leaderboard" element={<Leaderboard />} />

          {/* CHEW */}
          <Route element={<RequireRole allow={['CHEW']} />}>
            <Route path="/chew" element={<ChewDashboard />} />
            <Route path="/chew/new-patient" element={<NewPatient />} />
            <Route path="/chew/new-visit" element={<NewVisit />} />
            <Route path="/chew/result" element={<PatientResult />} />
          </Route>

          {/* DOCTOR */}
          <Route element={<RequireRole allow={['DOCTOR']} />}>
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/lookup" element={<DoctorLookup />} />
            <Route path="/doctor/patient/:qrToken" element={<DoctorPatientView />} />
          </Route>

          {/* ADMIN */}
          <Route element={<RequireRole allow={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UsersList />} />
            <Route path="/admin/create-user" element={<CreateUser />} />
            <Route path="/admin/tools" element={<AdminTools />} />
          </Route>

          {/* PATIENT */}
          <Route element={<RequireRole allow={['PATIENT']} />}>
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/patient/profile" element={<PatientProfile />} />
            <Route path="/patient/visits" element={<PatientVisits />} />
            <Route path="/patient/visits/:visitId" element={<PatientVisitDetail />} />
            <Route path="/patient/qr" element={<PatientQr />} />
            <Route path="/patient/request" element={<PatientRequestVisit />} />
            <Route path="/patient/requests" element={<PatientRequests />} />
            <Route path="/patient/export" element={<PatientExport />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
