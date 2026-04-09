import { useState, useEffect } from 'react'
import { useStore } from '../../store'
import { updateComplaint, getWorkers, getComplaints, saveComplaints } from '../../storage'
import { DEPARTMENTS, type Department, type ComplaintStatus, type Priority } from '../../types'
import { StatusBadge, EmptyState } from '../../components/ui'
import { Search, ChevronDown, Trash2, ShieldCheck, X, AlertTriangle, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { timeAgo } from '../../storage'
import { scanAllDuplicates, type DuplicateGroup } from '../../dedup'
import { computePriorityScore, scoreColor, scoreBg, scoreLabel } from '../../priorityEngine'
const STATUSES: ComplaintStatus[] = ['Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Closed']
export default function AllComplaints() {
  const { complaints, refreshComplaints, adminCommandData, setAdminCommandData } = useStore()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<ComplaintStatus | 'All'>('All')
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All')
  const [filterDept, setFilterDept] = useState<Department | 'All'>('All')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [dupGroups, setDupGroups] = useState<DuplicateGroup[] | null>(null)
  const [scanning, setScanning] = useState(false)
  const runDedupScan = async () => {
    setScanning(true)
    await new Promise(r => setTimeout(r, 700))
    const all = getComplaints()
    const groups = scanAllDuplicates(all)
    setDupGroups(groups)
    setScanning(false)
    if (groups.length === 0) toast.success('✅ No duplicates found! All complaints are unique.')
  }
  const deleteDuplicates = (groups: DuplicateGroup[]) => {
    const all = getComplaints()
    const idsToDelete = new Set(groups.flatMap(g => g.duplicates.map(d => d.id)))
    const cleaned = all.filter(c => !idsToDelete.has(c.id))
    saveComplaints(cleaned)
    refreshComplaints()
    const count = idsToDelete.size
    setDupGroups(null)
    toast.success(`🗑️ Deleted ${count} duplicate complaint${count > 1 ? 's' : ''}. Platform cleaned up!`)
  }
  useEffect(() => {
    if (adminCommandData) {
      if (adminCommandData.searchQuery !== undefined) setSearch(adminCommandData.searchQuery)
      if (adminCommandData.filterStatus) setFilterStatus(adminCommandData.filterStatus)
      if (adminCommandData.filterPriority) setFilterPriority(adminCommandData.filterPriority)
      if (adminCommandData.filterDept) setFilterDept(adminCommandData.filterDept)
      if (adminCommandData.runDedup) {
        runDedupScan()
      }
      setAdminCommandData(null)
    }
  }, [adminCommandData])
  const filtered = complaints
    .filter(c => filterStatus === 'All' || c.status === filterStatus)
    .filter(c => filterPriority === 'All' || c.priority === filterPriority)
    .filter(c => filterDept === 'All' || c.department === filterDept)
    .filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()) || c.citizenName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const handleStatusChange = async (id: string, status: ComplaintStatus, by = 'Admin') => {
    setUpdatingId(id)
    updateComplaint(id, { status }, { note: `Status changed to ${status} by Admin.`, by })
    refreshComplaints()
    toast.success(`Status updated to "${status}"`)
    setUpdatingId(null)
  }
  const handleAssignWorker = async (complaintId: string, workerId: string) => {
    const workers = getWorkers()
    const w = workers.find(w => w.id === workerId)
    if (!w) return
    updateComplaint(complaintId, {
      status: 'Assigned',
      assignedWorkerId: w.id,
      assignedWorkerName: w.name,
      assignedDept: w.department,
    }, { note: `Assigned to worker ${w.name} (${w.department})`, by: 'Admin' })
    refreshComplaints()
    toast.success(`Assigned to ${w.name}`)
  }
  const workers = getWorkers()
  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">All Complaints</h1>
          <p className="text-sm text-gray-500">{filtered.length} of {complaints.length}</p>
        </div>
        <button onClick={runDedupScan} disabled={scanning}
          className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 font-semibold rounded-xl text-sm transition-all disabled:opacity-60">
          {scanning
            ? <><span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" /> Scanning...</>
            : <><ShieldCheck size={15} /> Run Dedup Scan</>}
        </button>
      </div>
      {}
      {dupGroups && dupGroups.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            {}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-amber-50">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-600" />
                <h3 className="font-display font-bold text-gray-900">Duplicate Scan Results</h3>
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {dupGroups.reduce((a, g) => a + g.duplicates.length, 0)} duplicates found
                </span>
              </div>
              <button onClick={() => setDupGroups(null)}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            {}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              {dupGroups.map((g, i) => (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                  {}
                  <div className="bg-green-50 px-4 py-3 border-b border-green-100">
                    <div className="flex items-center gap-1.5 mb-1">
                      <ShieldCheck size={12} className="text-green-600" />
                      <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Keep (Primary)</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{g.primary.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span className="font-mono">{g.primary.id}</span>
                      <span>·</span>
                      <span>{g.primary.category}</span>
                      <span>·</span>
                      <StatusBadge status={g.primary.status} />
                      <span>·</span>
                      <span>{g.primary.citizenName}</span>
                    </p>
                  </div>
                  {}
                  {g.duplicates.map(d => (
                    <div key={d.id} className="px-4 py-3 bg-red-50 border-t border-red-100 flex items-center gap-3">
                      <Trash2 size={13} className="text-red-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{d.title}</p>
                        <p className="text-xs text-gray-400">
                          {d.id} · {d.citizenName} · 📍 {d.location} · {timeAgo(d.createdAt)}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                        Will Delete
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button onClick={() => deleteDuplicates(dupGroups)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all">
                <Trash2 size={15} />
                Delete {dupGroups.reduce((a, g) => a + g.duplicates.length, 0)} Duplicate{dupGroups.reduce((a, g) => a + g.duplicates.length, 0) > 1 ? 's' : ''}
              </button>
              <button onClick={() => setDupGroups(null)}
                className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded-xl border border-gray-200 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {}
      <div className="cs-card mb-5 !p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="cs-input pl-9 !py-2" placeholder="Search complaints..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {[
          { label: 'Status',     val: filterStatus,   set: setFilterStatus   as any, opts: ['All', ...STATUSES] },
          { label: 'Priority',   val: filterPriority, set: setFilterPriority as any, opts: ['All', 'Low', 'Medium', 'High'] },
          { label: 'Department', val: filterDept,     set: setFilterDept     as any, opts: ['All', ...DEPARTMENTS] },
        ].map(({ label, val, set, opts }) => (
          <div key={label} className="relative">
            <select className="cs-input !py-2 pr-8 appearance-none cursor-pointer" value={val} onChange={e => set(e.target.value)}>
              {opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="cs-card"><EmptyState icon={<Search size={28} />} title="No complaints match" sub="Try adjusting filters" /></div>
      ) : (
        <div className="cs-card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['ID', 'Complaint', 'Dept', 'AI Priority Score', 'Status', 'Filed', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const aiScore = c.priorityScore ?? computePriorityScore(c.title, c.description, c.category).score
                  const color   = scoreColor(aiScore)
                  const bg      = scoreBg(aiScore)
                  const label   = scoreLabel(aiScore)
                  return (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{c.id}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="font-medium text-gray-900 truncate">{c.title}</div>
                      <div className="text-xs text-gray-400">{c.citizenName} · 📍 {c.location}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{c.department.split(' ')[0]}</td>
                    {}
                    <td className="px-4 py-3">
                      <div style={{ background: bg, border: `1px solid ${color}22`, borderRadius: 10, padding: '6px 10px', minWidth: 130 }}>
                        {}
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 5 }}>
                          <div style={{ display:'flex', alignItems:'center', gap: 4 }}>
                            <Zap size={10} style={{ color }} />
                            <span style={{ fontSize: 10, fontWeight: 800, color, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</span>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 800, color }}>{aiScore}%</span>
                        </div>
                        {}
                        <div style={{ height: 5, background: 'rgba(0,0,0,0.07)', borderRadius: 99, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${aiScore}%`, background: color, borderRadius: 99, transition:'width 0.6s ease' }} />
                        </div>
                        {}
                        <div style={{ fontSize: 9, color:'#94a3b8', marginTop: 3, fontWeight: 600 }}>
                          User: <span style={{ color: c.priority==='High'?'#ef4444':c.priority==='Medium'?'#f59e0b':'#22c55e', fontWeight:700 }}>{c.priority}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{timeAgo(c.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 appearance-none cursor-pointer"
                          value={c.status}
                          onChange={e => handleStatusChange(c.id, e.target.value as ComplaintStatus)}
                          disabled={updatingId === c.id}>
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 appearance-none cursor-pointer"
                          value={c.assignedWorkerId || ''}
                          onChange={e => handleAssignWorker(c.id, e.target.value)}>
                          <option value="">Assign Worker…</option>
                          {workers.filter(w => w.department === c.department).map(w => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
