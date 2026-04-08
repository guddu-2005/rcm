import { useState } from 'react'
import { useStore } from '../../store'
import { StatusBadge, PriorityBadge, EmptyState, Avatar } from '../../components/ui'
import { STATUS_CONFIG, type ComplaintStatus, type Complaint } from '../../types'
import { List, ChevronDown, ChevronUp, MapPin, Clock, CheckCircle, X } from 'lucide-react'
import { timeAgo } from '../../storage'

const STATUSES: ComplaintStatus[] = ['Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Closed']

export default function MyComplaints() {
  const { session, complaints: allComplaints } = useStore()
  const [filter, setFilter] = useState<ComplaintStatus | 'All'>('All')
  const [expanded, setExpanded] = useState<string | null>(null)

  const myComplaints = allComplaints
    .filter(c => c.citizenId === session?.userId)
    .filter(c => filter === 'All' || c.status === filter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">My Complaints</h1>
          <p className="text-sm text-gray-500">{myComplaints.length} complaint{myComplaints.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['All', ...STATUSES] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              filter === s
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
            }`}>
            {s}
          </button>
        ))}
      </div>

      {myComplaints.length === 0 ? (
        <div className="cs-card">
          <EmptyState icon={<List size={28} />} title="No complaints found" sub="Try a different filter or file a new complaint." />
        </div>
      ) : (
        <div className="space-y-3">
          {myComplaints.map(c => (
            <ComplaintCard key={c.id} complaint={c} expanded={expanded === c.id} onToggle={() => setExpanded(prev => prev === c.id ? null : c.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function ComplaintCard({ complaint: c, expanded, onToggle }: { complaint: Complaint; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="cs-card !p-0 overflow-hidden">
      <button className="w-full text-left p-5" onClick={onToggle}>
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-mono text-gray-400">{c.id}</span>
              <PriorityBadge priority={c.priority} />
            </div>
            <h3 className="font-semibold text-gray-900 truncate mb-1">{c.title}</h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span>🏢 {c.department}</span>
              <span className="flex items-center gap-0.5"><MapPin size={10} /> {c.location.slice(0, 30)}{c.location.length > 30 ? '…' : ''}</span>
              <span className="flex items-center gap-0.5"><Clock size={10} /> {timeAgo(c.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <StatusBadge status={c.status} />
            {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 p-5 animate-fade-in">
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-gray-700">{c.description}</p>
            </div>
            {c.photo && (
              <img src={c.photo} alt="complaint" className="w-full h-32 object-cover rounded-xl border border-gray-200" />
            )}
          </div>

          {c.assignedWorkerName && (
            <div className="mb-5 p-3 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800">
              <strong>Assigned to:</strong> {c.assignedWorkerName} ({c.assignedDept})
            </div>
          )}

          {c.resolutionNote && (
            <div className="mb-5 p-3 bg-green-50 rounded-xl border border-green-100 text-sm text-green-800">
              <strong>Resolution:</strong> {c.resolutionNote}
            </div>
          )}

          {/* Timeline */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Status Timeline</p>
            <div className="space-y-3">
              {c.timeline.map((t, i) => {
                const cfg = STATUS_CONFIG[t.status]
                return (
                  <div key={i} className="flex gap-3">
                    <div className={`w-7 h-7 rounded-full ${cfg.dot} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <CheckCircle size={14} className="text-white" />
                    </div>
                    <div>
                      <span className={`text-xs font-bold ${cfg.color}`}>{t.status}</span>
                      <span className="text-xs text-gray-500 ml-2">by {t.by}</span>
                      <p className="text-xs text-gray-600 mt-0.5">{t.note}</p>
                      <p className="text-xs text-gray-400">{new Date(t.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
