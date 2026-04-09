import { useStore } from '../../store'
import { isOverdue, getWorkers } from '../../storage'
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts'
import { BarChart3, PieChart as PieIcon, Activity, Inbox, AlertTriangle, Users } from 'lucide-react'
interface TooltipProps { active?: boolean; payload?: any[]; label?: string }
const CustomPieTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white/90 backdrop-blur-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.12)] rounded-2xl border border-white min-w-[160px] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
        <p className="font-bold text-slate-800 mb-2 flex items-center gap-2 relative z-10">
          <span className="w-3 h-3 rounded-full shadow-sm border border-black/5" style={{ background: data.color }}></span>
          {data.name}
        </p>
        <div className="text-sm text-slate-600 flex justify-between relative z-10 mb-1">
          <span className="font-medium">Tickets:</span> <span className="font-bold text-slate-900">{data.value}</span>
        </div>
        <div className="text-sm text-slate-600 flex justify-between relative z-10">
          <span className="font-medium">Share:</span> <span className="font-bold text-slate-900">{data.percentage}%</span>
        </div>
      </div>
    )
  }
  return null
}
const CustomBarTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white/90 backdrop-blur-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.12)] rounded-2xl border border-white min-w-[200px] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
        <p className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 relative z-10 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          {label}
        </p>
        <div className="flex justify-between items-center text-sm text-blue-600 font-bold mb-2 relative z-10">
          <span>Active</span>
          <span>{data.Active} <span className="text-xs text-blue-400 opacity-80 font-medium tracking-wider">({data.activePct}%)</span></span>
        </div>
        <div className="flex justify-between items-center text-sm text-emerald-600 font-bold relative z-10">
          <span>Resolved</span>
          <span>{data.Resolved} <span className="text-xs text-emerald-400 opacity-80 font-medium tracking-wider">({data.resolvedPct}%)</span></span>
        </div>
      </div>
    )
  }
  return null
}
const MetricCard = ({ title, value, icon, bg }: any) => (
  <div className="relative bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] group">
    <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent opacity-50 pointer-events-none" />
    <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-125 duration-300">
      {icon}
    </div>
    <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${bg} shadow-inner border border-black/5`}>
      {icon}
    </div>
    <div className="space-y-1 relative z-10">
      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</h4>
      <div className="text-4xl font-black text-slate-900 font-display tracking-tight drop-shadow-sm">{value}</div>
    </div>
    <div className="absolute inset-0 border-t-2 border-white pointer-events-none rounded-2xl" />
  </div>
)
export default function DeptDashboardHome() {
  const { session, complaints } = useStore()
  const dept = session?.department
  const deptComplaints = complaints.filter(c => c.department === dept)
  const pending = deptComplaints.filter(c => !['Resolved','Closed'].includes(c.status))
  const overdueCount = pending.filter(isOverdue).length
  const onTrackCount = pending.length - overdueCount
  const totalSla = pending.length || 1
  const slaData = [
    { name: 'Overdue', value: overdueCount, percentage: Math.round((overdueCount/totalSla)*100), color: '#ef4444' },
    { name: 'On Track', value: onTrackCount, percentage: Math.round((onTrackCount/totalSla)*100), color: '#22c55e' }
  ]
  const unassigned = pending.filter(c => ['Submitted', 'Verified'].includes(c.status)).length
  const assigned = pending.filter(c => ['Assigned', 'In Progress'].includes(c.status)).length
  const totalAssign = unassigned + assigned || 1
  const assignData = [
    { name: 'Unassigned', value: unassigned, percentage: Math.round((unassigned/totalAssign)*100), color: '#f59e0b' },
    { name: 'Assigned / WIP', value: assigned, percentage: Math.round((assigned/totalAssign)*100), color: '#3b82f6' }
  ]
  const workers = getWorkers().filter(w => w.department === dept)
  const workerData = workers.map(w => {
    const active = deptComplaints.filter(c => c.assignedWorkerId === w.id && !['Resolved','Closed'].includes(c.status)).length
    const resolved = deptComplaints.filter(c => c.assignedWorkerId === w.id && ['Resolved','Closed'].includes(c.status)).length
    const total = active + resolved || 1
    return {
      name: w.name,
      Active: active,
      Resolved: resolved,
      activePct: Math.round((active/total)*100),
      resolvedPct: Math.round((resolved/total)*100)
    }
  })
  const totalTickets = deptComplaints.length
  const openTasks = pending.length
  const totalWorkers = workers.length
  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="font-display text-4xl font-black text-slate-900 mb-2 drop-shadow-sm tracking-tight">Department Analytics</h1>
          <p className="text-base text-slate-500 font-medium">Live modern overview of {dept} operations and SLA compliance.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Complaints" value={totalTickets} icon={<Inbox size={32} className="text-blue-600" />} bg="bg-blue-50" />
        <MetricCard title="Active Tasks" value={openTasks} icon={<Activity size={32} className="text-amber-600" />} bg="bg-amber-50" />
        <MetricCard title="Overdue SLA" value={overdueCount} icon={<AlertTriangle size={32} className="text-red-600" />} bg="bg-red-50" />
        <MetricCard title="Total Workers" value={totalWorkers} icon={<Users size={32} className="text-emerald-600" />} bg="bg-emerald-50" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {}
        <div className="relative bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.1)] transition-all duration-300">
          <div className="absolute inset-0 border-t-2 border-white pointer-events-none rounded-2xl" />
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg">
            <Activity className="text-red-500 bg-red-50 p-1 rounded border border-red-100" size={26} />
            SLA Compliance Tracker
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slaData}
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {slaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {}
        <div className="relative bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.1)] transition-all duration-300">
          <div className="absolute inset-0 border-t-2 border-white pointer-events-none rounded-2xl" />
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg">
            <PieIcon className="text-amber-500 bg-amber-50 p-1 rounded border border-amber-100" size={26} />
            Current Work Assignment
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assignData}
                  cx="50%" cy="50%"
                  innerRadius={0}
                  outerRadius={85}
                  dataKey="value"
                  stroke="none"
                >
                  {assignData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {}
      <div className="relative bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.1)] transition-all duration-300">
        <div className="absolute inset-0 border-t-2 border-white pointer-events-none rounded-2xl" />
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg relative z-10">
          <BarChart3 className="text-blue-500 bg-blue-50 p-1 rounded border border-blue-100" size={26} />
          Worker Performance & Workload
        </h3>
        {workerData.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
            No workers found in this department. Go to "My Workers" to add some.
          </div>
        ) : (
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={workerData}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                barSize={35}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                />
                <Tooltip cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} content={<CustomBarTooltip />} />
                <Legend 
                  iconType="circle" 
                  wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 500 }} 
                />
                <Bar dataKey="Active" stackId="a" fill="url(#colorActive)" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Resolved" stackId="a" fill="url(#colorResolved)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={1}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={1}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
