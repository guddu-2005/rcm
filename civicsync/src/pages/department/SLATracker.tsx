import { useStore } from '../../store'
import { isOverdue } from '../../storage'
import { StatusBadge, PriorityBadge, EmptyState } from '../../components/ui'
import { Timer, AlertTriangle, CheckCircle } from 'lucide-react'

export default function SLATracker() {
  const { session, complaints } = useStore()
  const dept = session?.department

  const list = complaints
    .filter(c => c.department === dept && !['Resolved','Closed'].includes(c.status))
    .map(c => ({ ...c, overdue: isOverdue(c) }))
    .sort((a, b) => (b.overdue ? 1 : 0) - (a.overdue ? 1 : 0) || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const overdueCount = list.filter(c => c.overdue).length
  const onTrack = list.length - overdueCount

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">SLA Tracker</h1>
          <p className="text-sm text-gray-500">Complaints unresolved for more than 3 days are marked overdue.</p>
        </div>
      </div>

      {/* Overdue Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="cs-card border-red-100 flex items-center gap-4">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <AlertTriangle size={18} className="text-red-600" />
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-red-600">{overdueCount}</div>
            <div className="text-sm text-gray-500">Overdue</div>
          </div>
        </div>
        <div className="cs-card flex items-center gap-4">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <CheckCircle size={18} className="text-green-600" />
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-green-600">{onTrack}</div>
            <div className="text-sm text-gray-500">On Track</div>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="cs-card"><EmptyState icon={<Timer size={28} />} title="All resolved!" sub="No pending complaints for this department." /></div>
      ) : (
        <div className="space-y-3">
          {list.map(c => (
            <div key={c.id} className={`cs-card border-l-4 ${c.overdue ? 'border-l-red-500 bg-red-50/30' : 'border-l-green-500'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {c.overdue ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                        <AlertTriangle size={10} /> OVERDUE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        <CheckCircle size={10} /> On Track
                      </span>
                    )}
                    <PriorityBadge priority={c.priority} />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{c.title}</h3>
                  <div className="text-xs text-gray-500 mt-1">
                    📍 {c.location} · Filed: {new Date(c.createdAt).toLocaleDateString()}
                    {c.assignedWorkerName && ` · 👷 ${c.assignedWorkerName}`}
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
