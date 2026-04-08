import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { getComplaints } from '../../storage'
import { StatusBadge, PriorityBadge, EmptyState } from '../../components/ui'
import { FilePlus, Clock, CheckCircle, AlertCircle, TrendingUp, ArrowRight } from 'lucide-react'
import { timeAgo } from '../../storage'

export default function CitizenHome() {
  const { session, complaints: allComplaints } = useStore()
  const navigate = useNavigate()
  const complaints = allComplaints.filter(c => c.citizenId === session?.userId)

  const stats = [
    { label: 'Total Filed', val: complaints.length, icon: <TrendingUp size={18} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active', val: complaints.filter(c => !['Resolved','Closed'].includes(c.status)).length, icon: <Clock size={18} />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Resolved', val: complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length, icon: <CheckCircle size={18} />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Critical', val: complaints.filter(c => c.priority === 'High' && c.status !== 'Resolved').length, icon: <AlertCircle size={18} />, color: 'text-red-600', bg: 'bg-red-50' },
  ]

  const recent = [...complaints].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">
            Welcome, {session?.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 text-sm">Here's an overview of your civic complaints.</p>
        </div>
        <button onClick={() => navigate('/citizen/dashboard/file')}
          className="cs-btn-primary">
          <FilePlus size={15} /> New Complaint
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, val, icon, color, bg }) => (
          <div key={label} className="cs-card">
            <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center mb-3`}>
              {icon}
            </div>
            <div className={`font-display text-3xl font-bold ${color} mb-0.5`}>{val}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent Complaints */}
      <div className="cs-card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-gray-900">Recent Complaints</h2>
          <button onClick={() => navigate('/citizen/dashboard/complaints')}
            className="text-xs text-primary-600 font-semibold flex items-center gap-1 hover:underline">
            View All <ArrowRight size={12} />
          </button>
        </div>

        {recent.length === 0 ? (
          <EmptyState icon={<FilePlus size={28} />} title="No complaints yet" sub="File your first complaint and track its resolution." />
        ) : (
          <div className="space-y-3">
            {recent.map(c => (
              <div key={c.id}
                onClick={() => navigate('/citizen/dashboard/complaints')}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 truncate mb-1">{c.title}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{c.category}</span>
                    <span>·</span>
                    <span>{timeAgo(c.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
