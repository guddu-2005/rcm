import { Routes, Route } from 'react-router-dom'
import { SidebarShell } from '../../components/SidebarShell'
import { ClipboardList, RefreshCw, User } from 'lucide-react'
import MyTasks from './MyTasks'
import UpdateTask from './UpdateTask'
import WorkerProfile from './WorkerProfile'
const navItems = [
  { label: 'My Tasks', href: '/worker/dashboard', icon: <ClipboardList size={17} /> },
  { label: 'Update Task', href: '/worker/dashboard/update', icon: <RefreshCw size={17} /> },
  { label: 'Profile', href: '/worker/dashboard/profile', icon: <User size={17} /> },
]
export default function WorkerPortal() {
  return (
    <SidebarShell title="Field Worker" subtitle="Worker Portal" navItems={navItems} accentColor="bg-amber-600">
      <Routes>
        <Route index element={<MyTasks />} />
        <Route path="update" element={<UpdateTask />} />
        <Route path="profile" element={<WorkerProfile />} />
      </Routes>
    </SidebarShell>
  )
}
