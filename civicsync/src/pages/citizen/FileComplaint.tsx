import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { addComplaint, getComplaints } from '../../storage'
import { COMPLAINT_CATEGORIES, CATEGORY_TO_DEPT, type Priority } from '../../types'
import { FormError, StatusBadge } from '../../components/ui'
import { MapPin, Image as ImageIcon, Send, X, AlertTriangle, CheckCircle, ExternalLink, Zap, Navigation, Mic } from 'lucide-react'
import toast from 'react-hot-toast'
import { findDuplicate, type DuplicateMatch } from '../../dedup'
import { computePriorityScore, scoreColor, scoreBg, scoreLabel, fetchGroqPriority, type PriorityScore } from '../../priorityEngine'
export default function FileComplaint() {
  const { session, refreshComplaints, voiceCommandData, setVoiceCommandData } = useStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', category: '', location: '',
    priority: 'Medium' as Priority,
  })
  const [photo, setPhoto]   = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [dupModal, setDupModal] = useState<DuplicateMatch | null>(null)
  const [aiScore, setAiScore] = useState<PriorityScore | null>(null)
  const [isScoring, setIsScoring] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const recognitionRef = useRef<any>(null)
  const [activeMic, setActiveMic] = useState<'title' | 'description' | null>(null)
  const [speechLang, setSpeechLang] = useState('en-IN')
  const toggleMic = (field: 'title' | 'description') => {
    if (activeMic) {
      recognitionRef.current?.stop()
      if (activeMic === field) {
        setActiveMic(null)
        return
      }
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Voice input is not supported in this browser. Try Chrome or Edge.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = speechLang
    recognition.continuous = true
    recognition.interimResults = true
    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' '
        }
      }
      if (finalTranscript) {
        setForm(prev => ({ ...prev, [field]: prev[field] + finalTranscript }))
      }
    }
    recognition.onerror = (event: any) => {
      console.error('Speech error', event.error)
      if (event.error !== 'no-speech') toast.error('Mic error: ' + event.error)
      setActiveMic(null)
    }
    recognition.onend = () => {
      setActiveMic(null)
    }
    recognition.start()
    setActiveMic(field)
    recognitionRef.current = recognition
  }
  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSpeechLang(e.target.value)
    if (activeMic) {
      recognitionRef.current?.stop()
      setActiveMic(null)
    }
  }
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
          const data = await res.json()
          if (data && data.display_name) {
            setForm(prev => ({ ...prev, location: data.display_name }))
            toast.success('Location detected')
          } else {
            setForm(prev => ({ ...prev, location: `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}` }))
          }
        } catch (e) {
          setForm(prev => ({ ...prev, location: `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}` }))
          toast.error('Could not get address, using coordinates')
        }
        setGettingLocation(false)
      },
      () => {
        toast.error('Unable to retrieve your location')
        setGettingLocation(false)
      }
    )
  }
  useEffect(() => {
    if (voiceCommandData) {
      setForm(prev => ({
        ...prev,
        title: voiceCommandData.title || prev.title,
        description: voiceCommandData.description || prev.description,
        category: voiceCommandData.category || prev.category,
      }))
      if (voiceCommandData.triggerLocation) {
        handleGetLocation()
      }
      setVoiceCommandData(null)
    }
  }, [voiceCommandData])
  useEffect(() => {
    if (form.title.length <= 3 && form.description.length <= 10) {
      setAiScore(null)
      return
    }
    const local = computePriorityScore(form.title, form.description, form.category)
    setAiScore(local)
    setIsScoring(true)
    const timeout = setTimeout(async () => {
      const gRes = await fetchGroqPriority(form.title, form.description, form.category)
      if (gRes) setAiScore(gRes)
      setIsScoring(false)
    }, 800)
    return () => clearTimeout(timeout)
  }, [form.title, form.description, form.category])
  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim())             e.title = 'Title is required'
    if (form.title.length > 100)        e.title = 'Max 100 characters'
    if (!form.category)                 e.category = 'Select a category'
    if (!form.description.trim())       e.description = 'Description is required'
    if (form.description.length < 20)   e.description = 'Please describe in at least 20 characters'
    if (!form.location.trim())          e.location = 'Location is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return }
    const reader = new FileReader()
    reader.onload = ev => setPhoto(ev.target?.result as string)
    reader.readAsDataURL(file)
  }
  const doSubmit = () => {
    const dept = CATEGORY_TO_DEPT[form.category]
    addComplaint({
      title:       form.title.trim(),
      description: form.description.trim(),
      category:    form.category,
      department:  dept,
      location:    form.location.trim(),
      priority:    aiScore?.level ?? form.priority,
      photo:       photo || undefined,
      citizenId:   session!.userId,
      citizenName: session!.name,
      priorityScore: aiScore?.score,
    })
    refreshComplaints()
    toast.success('✅ Complaint submitted! You can track it in My Complaints.')
    navigate('/citizen/dashboard/complaints')
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    const existing = getComplaints()
    const dup = findDuplicate(
      { title: form.title.trim(), description: form.description.trim(), location: form.location.trim(), category: form.category, citizenId: session!.userId },
      existing
    )
    setLoading(false)
    if (dup) {
      setDupModal(dup)
      return
    }
    doSubmit()
  }
  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }))
  }
  const dept = form.category ? CATEGORY_TO_DEPT[form.category] : null
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">File a Complaint</h1>
        <p className="text-sm text-gray-500">Report a civic issue. It will be auto-routed to the right department.</p>
      </div>
      <form onSubmit={handleSubmit} className="cs-card space-y-5">
        {}
        <div>
          <label className="cs-label">Issue Category *</label>
          <select className="cs-input" value={form.category} onChange={e => set('category', e.target.value)}>
            <option value="">-- Select Category --</option>
            {COMPLAINT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <FormError msg={errors.category} />
          {dept && (
            <p className="text-xs text-green-600 font-medium mt-1.5 flex items-center gap-1">
              🏢 Auto-routed to: <strong>{dept}</strong>
            </p>
          )}
        </div>
        {}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="cs-label mb-0">Complaint Title *</label>
            <div className="flex items-center gap-2">
              <select 
                value={speechLang} 
                onChange={handleLangChange}
                className="text-[11px] bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 text-gray-600 outline-none focus:border-blue-400"
              >
                <option value="en-IN">Eng/Hinglish</option>
                <option value="hi-IN">Hindi 🇮🇳</option>
                <option value="or-IN">Odia</option>
              </select>
              <button 
                type="button" 
                onClick={() => toggleMic('title')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all shadow-sm border ${
                  activeMic === 'title' 
                    ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
                title="Use Voice Typing for Title"
              >
                <Mic size={14} className={activeMic === 'title' ? 'text-red-500' : 'text-gray-400'} />
                {activeMic === 'title' ? 'Listening...' : 'Voice Type'}
              </button>
            </div>
          </div>
          <input className="cs-input" placeholder="Brief, clear title of the issue" value={form.title} onChange={e => set('title', e.target.value)} maxLength={100} />
          <FormError msg={errors.title} />
        </div>
        {}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="cs-label mb-0">Detailed Description *</label>
            <div className="flex items-center gap-2">
              <select 
                value={speechLang} 
                onChange={handleLangChange}
                className="text-[11px] bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 text-gray-600 outline-none focus:border-blue-400"
              >
                <option value="en-IN">Eng/Hinglish</option>
                <option value="hi-IN">Hindi 🇮🇳</option>
                <option value="or-IN">Odia</option>
              </select>
              <button 
                type="button" 
                onClick={() => toggleMic('description')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all shadow-sm border ${
                  activeMic === 'description' 
                    ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
                title="Use Voice Typing for Description"
              >
                <Mic size={14} className={activeMic === 'description' ? 'text-red-500' : 'text-gray-400'} />
                {activeMic === 'description' ? 'Listening...' : 'Voice Type'}
              </button>
            </div>
          </div>
          <textarea className="cs-input min-h-[120px] resize-none" placeholder="Describe the issue in detail — what, where, when, impact..." value={form.description} onChange={e => set('description', e.target.value)} />
          <div className="flex items-center justify-between">
            <FormError msg={errors.description} />
            <span className="text-xs text-gray-400">{form.description.length} chars</span>
          </div>
        </div>
        {}
        {aiScore && (
          <div style={{ background: scoreBg(aiScore.score), border: `1px solid ${scoreColor(aiScore.score)}33`, borderRadius: 14, padding: '12px 14px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 8 }}>
              <div style={{ display:'flex', alignItems:'center', gap: 5 }}>
                <Zap size={13} style={{ color: scoreColor(aiScore.score) }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: scoreColor(aiScore.score), textTransform:'uppercase', letterSpacing:'0.08em' }}>
                  AI Priority — {scoreLabel(aiScore.score)}
                </span>
                {isScoring && (
                  <svg className="animate-spin ml-2 h-3 w-3 text-current opacity-60" fill="none" viewBox="0 0 24 24" style={{ color: scoreColor(aiScore.score) }}>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: scoreColor(aiScore.score) }}>
                {aiScore.score}%
              </span>
            </div>
            {}
            <div style={{ height: 7, background: 'rgba(0,0,0,0.08)', borderRadius: 99, overflow:'hidden', marginBottom: 8 }}>
              <div style={{ height:'100%', width:`${aiScore.score}%`, background: scoreColor(aiScore.score), borderRadius: 99, transition:'width 0.4s ease' }} />
            </div>
            {}
            {aiScore.factors.slice(0, 3).map((f, i) => (
              <div key={i} style={{ fontSize: 10, color:'#64748b', marginTop: 2 }}>• {f}</div>
            ))}
          </div>
        )}
        {}
        <div>
          <label className="cs-label flex items-center gap-1"><MapPin size={12} /> Location *</label>
          <div className="flex gap-2">
            <input className="cs-input flex-1" placeholder="Street / Ward / Area / Landmark" value={form.location} onChange={e => set('location', e.target.value)} />
            <button 
              type="button" 
              onClick={handleGetLocation} 
              disabled={gettingLocation}
              className="bg-blue-50 text-blue-600 px-4 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors flex items-center gap-1 font-semibold text-sm disabled:opacity-50"
            >
              {gettingLocation ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <Navigation size={15} />
              )}
              {gettingLocation ? 'Locating...' : 'Auto'}
            </button>
          </div>
          <FormError msg={errors.location} />
        </div>
        {}
        <div>
          <label className="cs-label">Priority</label>
          <div className="flex gap-3">
            {(['Low', 'Medium', 'High'] as Priority[]).map(p => (
              <button key={p} type="button" onClick={() => set('priority', p)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                  form.priority === p
                    ? p === 'High'   ? 'border-red-400 bg-red-50 text-red-700'
                    : p === 'Medium' ? 'border-amber-400 bg-amber-50 text-amber-700'
                    :                  'border-gray-400 bg-gray-100 text-gray-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}>
                {p === 'High' ? '🔴' : p === 'Medium' ? '🟡' : '🟢'} {p}
              </button>
            ))}
          </div>
        </div>
        {}
        <div>
          <label className="cs-label flex items-center gap-1"><ImageIcon size={12} /> Photo (Optional)</label>
          {photo ? (
            <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200">
              <img src={photo} alt="preview" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setPhoto('')}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80">
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all">
              <ImageIcon size={20} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Click to upload photo</span>
              <span className="text-xs text-gray-400">Max 2MB — JPG, PNG</span>
              <input type="file" accept="image}
      {dupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-up">
            {}
            <div className="bg-amber-50 border-b border-amber-100 px-6 py-5 flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-display font-bold text-gray-900 text-lg">Duplicate Complaint Detected</h3>
                <p className="text-sm text-amber-700 mt-0.5">{dupModal.reason}</p>
              </div>
            </div>
            {}
            <div className="px-6 py-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Existing Open Complaint</p>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 text-sm">{dupModal.existing.title}</span>
                  <StatusBadge status={dupModal.existing.status} />
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{dupModal.existing.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1">
                  <span>📍 {dupModal.existing.location}</span>
                  <span>🏷️ {dupModal.existing.category}</span>
                  <span>🗓️ {new Date(dupModal.existing.createdAt).toLocaleDateString()}</span>
                  <span className="text-primary-600 font-semibold">ID: {dupModal.existing.id}</span>
                </div>
                {dupModal.existing.assignedWorkerName && (
                  <div className="text-xs text-blue-600">👷 Assigned to: {dupModal.existing.assignedWorkerName}</div>
                )}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-700 leading-relaxed">
                  <strong>💡 Tip:</strong> Your complaint appears similar to an existing one that's already being tracked.
                  Submitting duplicates slows down resolution for everyone. You can track the existing complaint instead.
                </p>
              </div>
            </div>
            {}
            <div className="px-6 pb-5 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setDupModal(null)
                  navigate('/citizen/dashboard/complaints')
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all">
                <ExternalLink size={15} /> View Existing Complaint
              </button>
              <button
                onClick={() => {
                  setDupModal(null)
                  doSubmit()
                  toast('Complaint submitted. Duplicates will be reviewed by admin.', { icon: 'ℹ️' })
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all text-sm">
                <CheckCircle size={15} /> Submit Anyway
              </button>
            </div>
            <button onClick={() => setDupModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
