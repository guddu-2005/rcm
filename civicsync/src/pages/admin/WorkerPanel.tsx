import { useStore } from '../../store'
import { getWorkers } from '../../storage'
import { Avatar, EmptyState } from '../../components/ui'
import { HardHat } from 'lucide-react'

export default function WorkerPanel() {
  const { complaints } = useStore()
  const workers = getWorkers()

  const workerStats = workers.map(w => {
    const assigned = complaints.filter(c => c.assignedWorkerId === w.id)
    const resolved = assigned.filter(c => c.status === 'Resolved' || c.status === 'Closed')
    return { ...w, assigned: assigned.length, resolved: resolved.length, rate: assigned.length ? Math.round((resolved.length / assigned.length) * 100) : 0 }
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Worker Panel</h1>
        <p className="text-sm text-gray-500">{workers.length} registered field workers</p>
      </div>

      {workers.length === 0 ? (
        <div className="cs-card"><EmptyState icon={<HardHat size={28} />} title="No workers registered" sub="Workers can register via the Worker portal." /></div>
      ) : (
        <div className="cs-card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Worker', 'Employee ID', 'Department', 'Assigned', 'Resolved', 'Rate'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {workerStats.map(w => (
                  <tr key={w.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={w.name} size="sm" />
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{w.name}</div>
                          <div className="text-xs text-gray-400">{w.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-600">{w.employeeId}</td>
                    <td className="px-5 py-3 text-sm text-gray-700">{w.department}</td>
                    <td className="px-5 py-3 font-bold text-gray-900">{w.assigned}</td>
                    <td className="px-5 py-3 text-green-600 font-bold">{w.resolved}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${w.rate >= 70 ? 'bg-green-500' : w.rate >= 40 ? 'bg-amber-500' : 'bg-red-400'}`}
                            style={{ width: `${w.rate}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-gray-700">{w.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
