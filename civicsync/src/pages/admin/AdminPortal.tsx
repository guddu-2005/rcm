import { Routes, Route } from 'react-router-dom'
import { SidebarShell } from '../../components/SidebarShell'
import { LayoutDashboard, List, Building2, Users, BarChart3, Settings } from 'lucide-react'
import AdminHome from './AdminHome'
import AllComplaints from './AllComplaints'
import DepartmentPanel from './DepartmentPanel'
import WorkerPanel from './WorkerPanel'
import Analytics from './Analytics'
import AdminSettings from './AdminSettings'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={17} /> },
  { label: 'All Complaints', href: '/admin/dashboard/complaints', icon: <List size={17} /> },
  { label: 'Department Panel', href: '/admin/dashboard/departments', icon: <Building2 size={17} /> },
  { label: 'Worker Panel', href: '/admin/dashboard/workers', icon: <Users size={17} /> },
  { label: 'Analytics', href: '/admin/dashboard/analytics', icon: <BarChart3 size={17} /> },
  { label: 'Settings', href: '/admin/dashboard/settings', icon: <Settings size={17} /> },
]

export default function AdminPortal() {
  return (
    <SidebarShell title="Administration" subtitle="Admin Panel" navItems={navItems} accentColor="bg-purple-700">
      <Routes>
        <Route index element={<AdminHome />} />
        <Route path="complaints" element={<AllComplaints />} />
        <Route path="departments" element={<DepartmentPanel />} />
        <Route path="workers" element={<WorkerPanel />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<AdminSettings />} />
      </Routes>
    </SidebarShell>
  )
}
