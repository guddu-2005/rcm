import { useStore } from '../../store'
import { getWorkers, getComplaints } from '../../storage'
import { Avatar, EmptyState } from '../../components/ui'
import { Users } from 'lucide-react'

export default function MyWorkers() {
  const { session } = useStore()
  const dept = session?.department
  const workers = getWorkers().filter(w => w.department === dept)
  const complaints = getComplaints()

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">My Workers</h1>
        <p className="text-sm text-gray-500">{workers.length} workers in {dept}</p>
      </div>
      {workers.length === 0 ? (
        <div className="cs-card"><EmptyState icon={<Users size={28} />} title="No workers yet" sub="Workers register via the Worker portal." /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workers.map(w => {
            const assigned = complaints.filter(c => c.assignedWorkerId === w.id)
            const resolved = assigned.filter(c => c.status === 'Resolved' || c.status === 'Closed')
            return (
              <div key={w.id} className="cs-card hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar name={w.name} size="md" />
                  <div>
                    <div className="font-semibold text-gray-900">{w.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{w.employeeId}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="font-bold text-gray-900">{assigned.length}</div>
                    <div className="text-xs text-gray-500">Assigned</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <div className="font-bold text-green-700">{resolved.length}</div>
                    <div className="text-xs text-gray-500">Resolved</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-400">{w.email}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
