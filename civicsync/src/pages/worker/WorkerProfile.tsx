import { useStore } from '../../store'
import { getWorkers, getComplaints } from '../../storage'
import { Avatar } from '../../components/ui'
import { HardHat, CheckCircle, Mail, Briefcase } from 'lucide-react'

export default function WorkerProfile() {
  const { session } = useStore()
  const workers = getWorkers()
  const worker = workers.find(w => w.id === session?.userId)
  const complaints = getComplaints()
  const myTasks = complaints.filter(c => c.assignedWorkerId === session?.userId)

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
      <div className="cs-card">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={session?.name || 'Worker'} size="lg" />
          <div>
            <h2 className="font-display font-bold text-xl text-gray-900">{worker?.name || session?.name}</h2>
            <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2.5 py-1 rounded-full">Field Worker</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: <Mail size={15} />, label: 'Email', val: worker?.email || session?.email },
            { icon: <Briefcase size={15} />, label: 'Employee ID', val: worker?.employeeId || '—' },
            { icon: <HardHat size={15} />, label: 'Department', val: worker?.department || session?.department },
            { icon: <CheckCircle size={15} />, label: 'Tasks Completed', val: myTasks.filter(c => c.status === 'Resolved' || c.status === 'Closed').length },
          ].map(({ icon, label, val }) => (
            <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="text-amber-600">{icon}</div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-gray-900">{val}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
