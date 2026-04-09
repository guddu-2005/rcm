import { useState } from 'react'
import { useStore } from '../../store'
import { StatusBadge, PriorityBadge, EmptyState } from '../../components/ui'
import { type ComplaintStatus } from '../../types'
import { Inbox } from 'lucide-react'
import { timeAgo } from '../../storage'
const STATUSES: ComplaintStatus[] = ['Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Closed']
export default function IncomingComplaints() {
  const { session, complaints } = useStore()
  const [filter, setFilter] = useState<ComplaintStatus | 'All'>('All')
  const dept = session?.department
  const myComplaints = complaints
    .filter(c => c.department === dept)
    .filter(c => filter === 'All' || c.status === filter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Incoming Complaints</h1>
        <p className="text-sm text-gray-500">{dept} — {myComplaints.length} complaint{myComplaints.length !== 1 ? 's' : ''}</p>
      </div>
      {}
      <div className="flex flex-wrap gap-2 mb-5">
        {(['All', ...STATUSES] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filter === s ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
            }`}>
            {s}
          </button>
        ))}
      </div>
      {myComplaints.length === 0 ? (
        <div className="cs-card"><EmptyState icon={<Inbox size={28} />} title="No complaints" sub="No complaints for this department matching the filter." /></div>
      ) : (
        <div className="space-y-3">
          {myComplaints.map(c => (
            <div key={c.id} className="cs-card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">{c.id}</span>
                    <PriorityBadge priority={c.priority} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{c.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{c.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>📍 {c.location}</span>
                    <span>👤 {c.citizenName}</span>
                    <span>🕐 {timeAgo(c.createdAt)}</span>
                    {c.assignedWorkerName && <span className="text-blue-600">👷 {c.assignedWorkerName}</span>}
                  </div>
                </div>
                <StatusBadge status={c.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
