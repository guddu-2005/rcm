import { useState } from 'react'
import { useStore } from '../../store'
import { updateComplaint } from '../../storage'
import { StatusBadge, PriorityBadge, EmptyState } from '../../components/ui'
import { type ComplaintStatus } from '../../types'
import { RefreshCw, CheckCircle, X, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UpdateTask() {
  const { session, complaints, refreshComplaints } = useStore()
  const [selected, setSelected] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('In Progress')
  const [note, setNote] = useState('')
  const [photo, setPhoto] = useState('')
  const [loading, setLoading] = useState(false)

  const myTasks = complaints
    .filter(c => c.assignedWorkerId === session?.userId && !['Resolved','Closed'].includes(c.status))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const selectedComplaint = complaints.find(c => c.id === selected)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPhoto(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleUpdate = async () => {
    if (!selected || !note.trim()) { toast.error('Please add a note before updating'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    const updates: any = {
      status: newStatus,
      ...(newStatus === 'Resolved' ? { resolutionNote: note, resolvedAt: new Date().toISOString(), ...(photo ? { resolutionPhoto: photo } : {}) } : {}),
    }
    updateComplaint(selected, updates, { note, by: session?.name || 'Worker' })
    refreshComplaints()
    toast.success(newStatus === 'Resolved' ? '✅ Task marked as Resolved!' : '📝 Task updated!')
    setSelected(null); setNote(''); setPhoto(''); setNewStatus('In Progress')
    setLoading(false)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Update Task</h1>
        <p className="text-sm text-gray-500">Select a task to update its status or mark as resolved.</p>
      </div>

      {myTasks.length === 0 ? (
        <div className="cs-card"><EmptyState icon={<RefreshCw size={28} />} title="No active tasks" sub="All your tasks are completed!" /></div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Task List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 text-sm mb-2">Select a Task</h3>
            {myTasks.map(c => (
              <button key={c.id} onClick={() => { setSelected(c.id); setNewStatus(c.status === 'Assigned' ? 'In Progress' : 'Resolved') }}
                className={`w-full text-left cs-card transition-all ${selected === c.id ? 'ring-2 ring-amber-500 bg-amber-50/20' : 'hover:shadow-md'}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-sm text-gray-900 truncate">{c.title}</h4>
                  <PriorityBadge priority={c.priority} />
                </div>
                <p className="text-xs text-gray-500 truncate">{c.location}</p>
                <div className="mt-2"><StatusBadge status={c.status} /></div>
              </button>
            ))}
          </div>

          {/* Update Form */}
          {selectedComplaint ? (
            <div className="cs-card">
              <h3 className="font-display font-bold text-gray-900 mb-4">Update: {selectedComplaint.title}</h3>

              <div className="mb-4">
                <label className="cs-label">New Status</label>
                <div className="flex gap-2">
                  {(['In Progress', 'Resolved'] as ComplaintStatus[]).map(s => (
                    <button key={s} type="button" onClick={() => setNewStatus(s)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                        newStatus === s
                          ? s === 'Resolved' ? 'border-green-500 bg-green-50 text-green-700' : 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}>
                      {s === 'Resolved' ? '✅' : '⚙️'} {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="cs-label">Note / Update *</label>
                <textarea className="cs-input min-h-[100px] resize-none"
                  placeholder={newStatus === 'Resolved' ? 'Describe what was done to resolve this issue…' : 'Current progress update…'}
                  value={note} onChange={e => setNote(e.target.value)} />
              </div>

              <div className="mb-5">
                <label className="cs-label flex items-center gap-1"><ImageIcon size={11} /> Resolution Photo (Optional)</label>
                {photo ? (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200">
                    <img src={photo} alt="resolution" className="w-full h-full object-cover" />
                    <button onClick={() => setPhoto('')} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"><X size={13} /></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all">
                    <ImageIcon size={18} className="text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Upload photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                  </label>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={handleUpdate} disabled={loading}
                  className={`flex-1 justify-center py-3 font-bold rounded-xl text-white flex items-center gap-2 transition-all ${newStatus === 'Resolved' ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
                  {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : newStatus === 'Resolved' ? <><CheckCircle size={15} /> Mark Resolved</> : <><RefreshCw size={15} /> Update</>}
                </button>
                <button onClick={() => setSelected(null)} className="cs-btn-secondary py-3">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="cs-card flex items-center justify-center">
              <p className="text-sm text-gray-400">← Select a task to update</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
