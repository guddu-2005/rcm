import { useStore } from '../../store'
import { DEPARTMENTS, DEPT_ICONS, type Department } from '../../types'
import { BarChart3, TrendingUp, Clock, CheckCircle } from 'lucide-react'
export default function Analytics() {
  const { complaints } = useStore()
  const total = complaints.length
  const resolved = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length
  const pending = complaints.filter(c => !['Resolved','Closed'].includes(c.status)).length
  const resolvedComplaints = complaints.filter(c => c.resolvedAt)
  const avgResHours = resolvedComplaints.length
    ? Math.round(resolvedComplaints.reduce((sum, c) => {
        return sum + (new Date(c.resolvedAt!).getTime() - new Date(c.createdAt).getTime())
      }, 0) / resolvedComplaints.length / 3600000)
    : 0
  const deptData = DEPARTMENTS.map(dept => {
    const dc = complaints.filter(c => c.department === dept)
    return { dept, count: dc.length, resolved: dc.filter(c => c.status === 'Resolved' || c.status === 'Closed').length }
  })
  const maxCount = Math.max(...deptData.map(d => d.count), 1)
  const priorityData = [
    { label: 'High', count: complaints.filter(c => c.priority === 'High').length, color: 'bg-red-500' },
    { label: 'Medium', count: complaints.filter(c => c.priority === 'Medium').length, color: 'bg-amber-500' },
    { label: 'Low', count: complaints.filter(c => c.priority === 'Low').length, color: 'bg-gray-400' },
  ]
  const statusData = ['Submitted','Verified','Assigned','In Progress','Resolved','Closed'].map(s => ({
    label: s,
    count: complaints.filter(c => c.status === s).length,
  }))
  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Analytics</h1>
        <p className="text-sm text-gray-500">Citywide complaint performance metrics.</p>
      </div>
      {}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <TrendingUp size={18} />, label: 'Total Complaints', val: total, color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: <CheckCircle size={18} />, label: 'Resolved', val: resolved, color: 'text-green-600', bg: 'bg-green-50' },
          { icon: <Clock size={18} />, label: 'Pending', val: pending, color: 'text-amber-600', bg: 'bg-amber-50' },
          { icon: <BarChart3 size={18} />, label: 'Avg Resolution', val: avgResHours ? `${avgResHours}h` : 'N/A', color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(({ icon, label, val, color, bg }) => (
          <div key={label} className="cs-card">
            <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center mb-3`}>{icon}</div>
            <div className={`font-display text-3xl font-bold ${color} mb-0.5`}>{val}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {}
        <div className="cs-card">
          <h3 className="font-display font-bold text-gray-900 mb-5">Complaints by Department</h3>
          <div className="space-y-3">
            {deptData.map(({ dept, count, resolved }) => (
              <div key={dept}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700 flex items-center gap-1.5">
                    <span>{DEPT_ICONS[dept as Department]}</span>
                    <span className="truncate max-w-[150px]">{dept}</span>
                  </span>
                  <span className="text-gray-500 flex-shrink-0">{resolved}/{count}</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(count / maxCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        {}
        <div className="space-y-6">
          {}
          <div className="cs-card">
            <h3 className="font-display font-bold text-gray-900 mb-4">Priority Breakdown</h3>
            <div className="space-y-3">
              {priorityData.map(({ label, count, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">{label} Priority</span>
                    <span className="text-gray-500">{count} ({total ? Math.round((count/total)*100) : 0}%)</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${total ? (count / total) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {}
          <div className="cs-card">
            <h3 className="font-display font-bold text-gray-900 mb-4">Status Distribution</h3>
            <div className="grid grid-cols-3 gap-2">
              {statusData.map(({ label, count }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="font-bold text-xl text-gray-900">{count}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
