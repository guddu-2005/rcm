import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useStore } from './store'
import { seedIfNeeded } from './storage'
import { useEffect } from 'react'

// Pages
import Landing from './pages/Landing'
import CitizenRegister from './pages/auth/CitizenRegister'
import CitizenLogin from './pages/auth/CitizenLogin'
import AdminLogin from './pages/auth/AdminLogin'
import DepartmentLogin from './pages/auth/DepartmentLogin'
import WorkerRegister from './pages/auth/WorkerRegister'
import WorkerLogin from './pages/auth/WorkerLogin'
import CitizenPortal from './pages/citizen/CitizenPortal'
import AdminPortal from './pages/admin/AdminPortal'
import DepartmentPortal from './pages/department/DepartmentPortal'
import WorkerPortal from './pages/worker/WorkerPortal'
import VoiceAgent from './components/VoiceAgent'

// Protected Route Guard
function Guard({ children, role }: { children: React.ReactNode; role: string | string[] }) {
  const { session } = useStore()
  if (!session) return <Navigate to="/" replace />
  const roles = Array.isArray(role) ? role : [role]
  if (!roles.includes(session.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const { loadComplaints } = useStore()

  useEffect(() => {
    seedIfNeeded()
    loadComplaints()
  }, [])

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { fontFamily: 'Inter, sans-serif', fontSize: 13, borderRadius: 12 },
        success: { iconTheme: { primary: '#16A34A', secondary: 'white' } },
      }} />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/citizen/register" element={<CitizenRegister />} />
        <Route path="/citizen/login" element={<CitizenLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/department/login" element={<DepartmentLogin />} />
        <Route path="/worker/register" element={<WorkerRegister />} />
        <Route path="/worker/login" element={<WorkerLogin />} />

        {/* Protected — Citizen */}
        <Route path="/citizen/dashboard/*" element={
          <Guard role="citizen"><CitizenPortal /></Guard>
        } />

        {/* Protected — Admin */}
        <Route path="/admin/dashboard/*" element={
          <Guard role="admin"><AdminPortal /></Guard>
        } />

        {/* Protected — Department */}
        <Route path="/department/dashboard/*" element={
          <Guard role="department"><DepartmentPortal /></Guard>
        } />

        {/* Protected — Worker */}
        <Route path="/worker/dashboard/*" element={
          <Guard role="worker"><WorkerPortal /></Guard>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Voice Agent — visible on every page */}
      <VoiceAgent />
    </BrowserRouter>
  )
}
