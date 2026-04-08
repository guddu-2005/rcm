import { useState } from 'react'
import { useStore } from '../../store'
import { updateComplaint, getWorkers } from '../../storage'
import { StatusBadge, PriorityBadge, EmptyState } from '../../components/ui'
import { UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AssignToWorker() {
  const { session, complaints, refreshComplaints } = useStore()
  const dept = session?.department
  const workers = getWorkers().filter(w => w.department === dept)

  const assignable = complaints.filter(c => c.department === dept && !['Resolved','Closed'].includes(c.status))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const [selections, setSelections] = useState<Record<string, string>>({})

  const handleAssign = (complaintId: string) => {
    const workerId = selections[complaintId]
    if (!workerId) { toast.error('Please select a worker first'); return }
    const worker = workers.find(w => w.id === workerId)
    if (!worker) return
    updateComplaint(complaintId, {
      status: 'Assigned',
      assignedWorkerId: worker.id,
      assignedWorkerName: worker.name,
      assignedDept: dept as any,
    }, { note: `Assigned to ${worker.name} by ${dept} department.`, by: dept || 'Department' })
    refreshComplaints()
    toast.success(`Complaint assigned to ${worker.name}!`)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Assign to Worker</h1>
        <p className="text-sm text-gray-500">{workers.length} workers available in {dept}</p>
      </div>

      {assignable.length === 0 ? (
        <div className="cs-card"><EmptyState icon={<UserCheck size={28} />} title="Nothing to assign" sub="All complaints are resolved or already assigned." /></div>
      ) : (
        <div className="space-y-4">
          {assignable.map(c => (
            <div key={c.id} className="cs-card">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{c.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">📍 {c.location} · 👤 {c.citizenName}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                </div>
              </div>
              {c.assignedWorkerName && (
                <p className="text-xs text-blue-600 mb-3">Current: {c.assignedWorkerName}</p>
              )}
              <div className="flex gap-3">
                <select className="flex-1 cs-input !py-2 appearance-none cursor-pointer"
                  value={selections[c.id] || ''}
                  onChange={e => setSelections(prev => ({ ...prev, [c.id]: e.target.value }))}>
                  <option value="">-- Select Worker --</option>
                  {workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.employeeId})</option>)}
                </select>
                <button onClick={() => handleAssign(c.id)}
                  className="cs-btn-primary py-2 text-sm whitespace-nowrap">
                  <UserCheck size={14} /> Assign
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
