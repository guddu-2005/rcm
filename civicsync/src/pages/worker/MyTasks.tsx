import { useStore } from '../../store'
import { StatusBadge, PriorityBadge, EmptyState } from '../../components/ui'
import { ClipboardList, MapPin } from 'lucide-react'
import { timeAgo } from '../../storage'

export default function MyTasks() {
  const { session, complaints } = useStore()
  const myTasks = complaints
    .filter(c => c.assignedWorkerId === session?.userId)
    .sort((a, b) => {
      const prio = { High: 0, Medium: 1, Low: 2 }
      return prio[a.priority] - prio[b.priority] || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const active = myTasks.filter(c => !['Resolved','Closed'].includes(c.status))
  const done = myTasks.filter(c => c.status === 'Resolved' || c.status === 'Closed')

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">My Tasks</h1>
        <p className="text-sm text-gray-500">{active.length} active · {done.length} completed</p>
      </div>

      {myTasks.length === 0 ? (
        <div className="cs-card"><EmptyState icon={<ClipboardList size={28} />} title="No tasks assigned yet" sub="The department will assign complaints to you." /></div>
      ) : (
        <div className="space-y-3">
          {myTasks.map(c => (
            <div key={c.id} className={`cs-card ${c.status === 'Resolved' || c.status === 'Closed' ? 'opacity-60' : 'hover:shadow-md transition-shadow'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <PriorityBadge priority={c.priority} />
                    <span className="text-xs font-mono text-gray-400">{c.id}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{c.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{c.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MapPin size={10} /> {c.location}</span>
                    <span>🏷️ {c.category}</span>
                    <span>👤 {c.citizenName}</span>
                    <span>🕐 {timeAgo(c.createdAt)}</span>
                  </div>
                </div>
                <StatusBadge status={c.status} />
              </div>
              {c.resolutionNote && (
                <div className="mt-3 p-2 bg-green-50 rounded-lg text-xs text-green-700 border border-green-100">
                  <strong>Resolution:</strong> {c.resolutionNote}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
