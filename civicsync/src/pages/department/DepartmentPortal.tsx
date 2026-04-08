import { Routes, Route } from 'react-router-dom'
import { SidebarShell } from '../../components/SidebarShell'
import { LayoutDashboard, Inbox, UserCheck, Users, Timer } from 'lucide-react'
import DeptDashboardHome from './DeptDashboardHome'
import IncomingComplaints from './IncomingComplaints'
import AssignToWorker from './AssignToWorker'
import MyWorkers from './MyWorkers'
import SLATracker from './SLATracker'

const navItems = [
  { label: 'Dashboard Overview', href: '/department/dashboard', icon: <LayoutDashboard size={17} /> },
  { label: 'Incoming Complaints', href: '/department/dashboard/incoming', icon: <Inbox size={17} /> },
  { label: 'Assign to Worker', href: '/department/dashboard/assign', icon: <UserCheck size={17} /> },
  { label: 'My Workers', href: '/department/dashboard/workers', icon: <Users size={17} /> },
  { label: 'SLA Tracker', href: '/department/dashboard/sla', icon: <Timer size={17} /> },
]

export default function DepartmentPortal() {
  return (
    <SidebarShell title="Department" subtitle="Department Portal" navItems={navItems} accentColor="bg-green-700">
      <Routes>
        <Route index element={<DeptDashboardHome />} />
        <Route path="incoming" element={<IncomingComplaints />} />
        <Route path="assign" element={<AssignToWorker />} />
        <Route path="workers" element={<MyWorkers />} />
        <Route path="sla" element={<SLATracker />} />
      </Routes>
    </SidebarShell>
  )
}
