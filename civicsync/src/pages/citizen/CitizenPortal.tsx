import { Routes, Route } from 'react-router-dom'
import { SidebarShell } from '../../components/SidebarShell'
import {
  LayoutDashboard, FilePlus, List, User
} from 'lucide-react'

// Sub-pages
import CitizenHome from './CitizenHome'
import FileComplaint from './FileComplaint'
import MyComplaints from './MyComplaints'
import CitizenProfile from './CitizenProfile'

const navItems = [
  { label: 'Dashboard', href: '/citizen/dashboard', icon: <LayoutDashboard size={17} /> },
  { label: 'File New Complaint', href: '/citizen/dashboard/file', icon: <FilePlus size={17} /> },
  { label: 'My Complaints', href: '/citizen/dashboard/complaints', icon: <List size={17} /> },
  { label: 'Profile', href: '/citizen/dashboard/profile', icon: <User size={17} /> },
]

export default function CitizenPortal() {
  return (
    <SidebarShell title="Citizen Portal" subtitle="Citizen Portal" navItems={navItems} accentColor="bg-primary-600">
      <Routes>
        <Route index element={<CitizenHome />} />
        <Route path="file" element={<FileComplaint />} />
        <Route path="complaints" element={<MyComplaints />} />
        <Route path="profile" element={<CitizenProfile />} />
      </Routes>
    </SidebarShell>
  )
}
