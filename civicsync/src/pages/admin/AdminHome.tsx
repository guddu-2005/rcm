import { useStore } from '../../store'
import { getComplaints } from '../../storage'
import { StatusBadge, PriorityBadge } from '../../components/ui'
import { TrendingUp, CheckCircle, Clock, AlertTriangle, Users, Building2, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { timeAgo } from '../../storage'

export default function AdminHome() {
  const { complaints } = useStore()
  const navigate = useNavigate()

  const stats = [
    { label: 'Total', val: complaints.length, icon: <TrendingUp size={18} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending', val: complaints.filter(c => !['Resolved','Closed'].includes(c.status)).length, icon: <Clock size={18} />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Resolved', val: complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length, icon: <CheckCircle size={18} />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'High Priority', val: complaints.filter(c => c.priority === 'High' && c.status !== 'Resolved').length, icon: <AlertTriangle size={18} />, color: 'text-red-600', bg: 'bg-red-50' },
  ]

  const recent = [...complaints].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8)

  const unverified = complaints.filter(c => c.status === 'Submitted').length

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Admin Command Center</h1>
          <p className="text-sm text-gray-500">Full oversight of all civic complaints and resolutions.</p>
        </div>
        {unverified > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-sm text-amber-700 font-semibold">
            <AlertTriangle size={15} /> {unverified} unverified
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, val, icon, color, bg }) => (
          <div key={label} className="cs-card">
            <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center mb-3`}>{icon}</div>
            <div className={`font-display text-3xl font-bold ${color} mb-0.5`}>{val}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Manage Complaints', sub: 'Assign, verify & close', href: '/admin/dashboard/complaints', color: 'bg-primary-600', icon: <Building2 size={20} className="text-white" /> },
          { label: 'Department View', sub: 'Track dept performance', href: '/admin/dashboard/departments', color: 'bg-green-600', icon: <Building2 size={20} className="text-white" /> },
          { label: 'Analytics', sub: 'Reports & trends', href: '/admin/dashboard/analytics', color: 'bg-purple-600', icon: <Users size={20} className="text-white" /> },
        ].map(({ label, sub, href, color, icon }) => (
          <button key={href} onClick={() => navigate(href)}
            className="cs-card flex items-center gap-4 text-left hover:shadow-md transition-shadow group">
            <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>{icon}</div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 text-sm">{label}</div>
              <div className="text-xs text-gray-500">{sub}</div>
            </div>
            <ArrowRight size={15} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </button>
        ))}
      </div>

      {/* Recent Complaints */}
      <div className="cs-card overflow-hidden !p-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-display font-bold text-gray-900">Recent Complaints</h2>
          <button onClick={() => navigate('/admin/dashboard/complaints')} className="text-xs text-primary-600 font-semibold flex items-center gap-1 hover:underline">
            View All <ArrowRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Complaint', 'Department', 'Priority', 'Status', 'Filed'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {recent.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900 max-w-xs">
                    <div className="truncate">{c.title}</div>
                    <div className="text-xs text-gray-400">{c.citizenName}</div>
                  </td>
                  <td className="px-5 py-3 text-gray-600 text-xs">{c.department}</td>
                  <td className="px-5 py-3"><PriorityBadge priority={c.priority} /></td>
                  <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">{timeAgo(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
