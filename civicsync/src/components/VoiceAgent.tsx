import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import VapiModule from '@vapi-ai/web'
const Vapi: any = (VapiModule as any).default ?? VapiModule
import { getComplaints, getWorkers, getCitizens } from '../storage'
import { type Complaint } from '../types'
const VAPI_PUBLIC_KEY = '3849e275-4792-47d0-9525-ccdbe9c0245e'
const ASSISTANT_ID    = '0c31e750-dacc-479b-a730-1e3089e28b1b'
function buildContext(): string {
  const complaints = getComplaints()
  const workers    = getWorkers()
  const citizens   = getCitizens()
  const total    = complaints.length
  const byStatus: Record<string, number> = {}
  const byDept:   Record<string, number> = {}
  const byPrio:   Record<string, number> = {}
  complaints.forEach((c: Complaint) => {
    byStatus[c.status]     = (byStatus[c.status]     || 0) + 1
    byDept[c.department]   = (byDept[c.department]   || 0) + 1
    byPrio[c.priority]     = (byPrio[c.priority]     || 0) + 1
  })
  const recent = [...complaints]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(c => `[${c.id}] "${c.title}" — ${c.department} — ${c.status} — ${c.priority} priority`)
    .join('\n')
  return `
=== CivicSync Live Data (${new Date().toLocaleString('en-IN')}) ===
PLATFORM OVERVIEW:
- Total Complaints: ${total}
- Total Citizens: ${citizens.length}
- Total Field Workers: ${workers.length}
COMPLAINTS BY STATUS:
${Object.entries(byStatus).map(([k,v]) => `- ${k}: ${v}`).join('\n') || '- None'}
COMPLAINTS BY DEPARTMENT:
${Object.entries(byDept).map(([k,v]) => `- ${k}: ${v}`).join('\n') || '- None'}
COMPLAINTS BY PRIORITY:
${Object.entries(byPrio).map(([k,v]) => `- ${k} Priority: ${v}`).join('\n') || '- None'}
MOST RECENT 5 COMPLAINTS:
${recent || '- None'}
DEPARTMENTS AVAILABLE:
Water Supply, Garbage & Sanitation, Electricity, Road & Infrastructure, Public Transport, Traffic Management
COMPLAINT LIFECYCLE STAGES:
Submitted → Verified → Assigned → In Progress → Resolved → Closed
PORTAL ROLES:
- Citizen: File & track complaints
- Admin: Full oversight, assign workers
- Department: Manage dept complaints, assign to workers
- Worker: Accept tasks, mark resolved
`.trim()
}
type CallState = 'idle' | 'connecting' | 'active' | 'ending'
interface Message {
  role: 'user' | 'assistant'
  text: string
}
const VA_CSS = `
@keyframes vaPulse {
  0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(34,211,238,0.7)}
  50%{transform:scale(1.07);box-shadow:0 0 0 14px rgba(34,211,238,0)}
}
@keyframes vaRipple {
  0%{transform:scale(0.8);opacity:1}
  100%{transform:scale(2.2);opacity:0}
}
@keyframes vaFadeUp {
  from{opacity:0;transform:translateY(12px)}
  to{opacity:1;transform:translateY(0)}
}
@keyframes vaDot {
  0%,80%,100%{transform:scale(0);opacity:.5}
  40%{transform:scale(1);opacity:1}
}
.va-active-ring { animation: vaPulse 1.6s infinite ease-in-out; }
.va-ripple {
  position:absolute;inset:0;border-radius:50%;
  background: rgba(34,211,238,0.35);
  animation: vaRipple 1.4s infinite ease-out;
}
.va-ripple2 {
  position:absolute;inset:0;border-radius:50%;
  background: rgba(34,211,238,0.2);
  animation: vaRipple 1.4s 0.6s infinite ease-out;
}
.va-panel { animation: vaFadeUp 0.28s ease-out both; }
.va-dot { animation: vaDot 1.2s infinite both; display:inline-block;width:6px;height:6px;border-radius:50%;background:#22d3ee; }
.va-dot:nth-child(2){animation-delay:.16s}
.va-dot:nth-child(3){animation-delay:.32s}
`
export default function VoiceAgent() {
  const navigate = useNavigate()
  const vapiRef     = useRef<any>(null)
  const [state, setState]       = useState<CallState>('idle')
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [isSpeaking, setIsSpeaking]   = useState(false)
  const msgEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (document.getElementById('va-css')) return
    const s = document.createElement('style')
    s.id = 'va-css'
    s.textContent = VA_CSS
    document.head.appendChild(s)
  }, [])
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  useEffect(() => {
    const vapi = new Vapi(VAPI_PUBLIC_KEY)
    vapiRef.current = vapi
    vapi.on('call-start', () => {
      setState('active')
      setMessages([{
        role: 'assistant',
        text: "Namaste! Main CivicSync ka voice assistant hoon. Aap mujhse English ya Hinglish mein baat kar sakte hain. Complaints, status, ya portal ke baare mein kuch puchna hai?"
      }])
    })
    vapi.on('call-end', () => {
      setState('idle')
      setIsSpeaking(false)
    })
    vapi.on('speech-start', () => setIsSpeaking(true))
    vapi.on('speech-end',   () => setIsSpeaking(false))
    vapi.on('volume-level', (vol: number) => setVolumeLevel(vol))
    vapi.on('message', (msg: any) => {
      if (msg.type === 'transcript') {
        if (msg.transcriptType === 'final' && msg.transcript?.trim()) {
          setMessages(prev => [...prev, {
            role: msg.role === 'user' ? 'user' : 'assistant',
            text: msg.transcript.trim(),
          }])
        }
      }
      if (msg.type === 'tool-calls' || msg.type === 'function-call') {
        const list = msg.toolWithToolCallList || msg.toolCalls || (msg.functionCall ? [msg] : [])
        list.forEach((item: any) => {
          const call = item.toolCall || item.functionCall || item;
          const funcName = call?.name || call?.function?.name;
          if (funcName === 'navigate_website') {
            const rawArgs = call.arguments || call.function?.arguments;
            const args = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;
            console.log('[Voice Control] Navigating to:', args.page)
            switch (args.page) {
              case 'file_complaint': navigate('/citizen/dashboard/file'); break;
              case 'my_complaints': navigate('/citizen/dashboard/complaints'); break;
              case 'dashboard': navigate('/citizen/dashboard'); break;
              case 'admin_dashboard': navigate('/admin/dashboard'); break;
              case 'admin_complaints': navigate('/admin/dashboard/complaints'); break;
              case 'admin_departments': navigate('/admin/dashboard/departments'); break;
              case 'admin_workers': navigate('/admin/dashboard/workers'); break;
              case 'admin_analytics': navigate('/admin/dashboard/analytics'); break;
              case 'home': navigate('/'); break;
              case 'logout': 
                useStore.getState().logout();
                navigate('/'); 
                break;
            }
          }
          if (funcName === 'fill_complaint_form') {
            const rawArgs = call.arguments || call.function?.arguments;
            const args = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;
            console.log('[Voice Control] Filling form with:', args)
            useStore.getState().setVoiceCommandData({
              title: args.title,
              description: args.description,
              category: args.category,
              triggerLocation: args.trigger_location
            });
            if (!window.location.pathname.includes('/citizen/dashboard/file')) {
              navigate('/citizen/dashboard/file');
            }
          }
          if (funcName === 'admin_control') {
            const rawArgs = call.arguments || call.function?.arguments;
            const args = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;
            console.log('[Voice Control] Admin command:', args)
            useStore.getState().setAdminCommandData({
              searchQuery: args.search_query,
              filterStatus: args.filter_status,
              filterPriority: args.filter_priority,
              filterDept: args.filter_department,
              runDedup: args.run_dedup
            });
            if (!window.location.pathname.includes('/admin/dashboard/complaints')) {
              navigate('/admin/dashboard/complaints');
            }
          }
        })
      }
      if (msg.type === 'conversation-update') {
        const last = msg.conversation?.[msg.conversation.length - 1]
        if (last?.role === 'assistant' && last?.content) {
          setMessages(prev => {
            const lastPrev = prev[prev.length - 1]
            if (lastPrev?.role === 'assistant' && lastPrev.text === last.content) return prev
            return [...prev, { role: 'assistant', text: last.content }]
          })
        }
      }
    })
    vapi.on('error', (err: any) => {
      console.error('[Vapi error]', err)
      setState('idle')
    })
    return () => { vapi.stop() }
  }, [navigate])
  const startCall = useCallback(async () => {
    if (state !== 'idle') return
    setState('connecting')
    setOpen(true)
    setMessages([])
    const context = buildContext()
    try {
      await vapiRef.current!.start(ASSISTANT_ID, {
        variableValues: {
          civic_data: context,
        },
        firstMessage: "Namaste! Main CivicSync ka AI voice assistant hoon. English ya Hinglish mein baat Karen. Complaints, status, ya koi bhi sawaal — main ready hoon!",
      } as any)
    } catch (err) {
      console.error('[Vapi start error]', err)
      setState('idle')
    }
  }, [state])
  const endCall = useCallback(() => {
    setState('ending')
    vapiRef.current?.stop()
  }, [])
  const togglePanel = () => {
    if (state === 'idle') { setOpen(o => !o); return }
    setOpen(o => !o)
  }
  const volPct = Math.min(100, Math.round(volumeLevel * 150))
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
      {}
      {open && (
        <div className="va-panel" style={{
          width: 340, maxHeight: 480,
          background: 'rgba(10,15,35,0.97)',
          border: '1px solid rgba(34,211,238,0.25)',
          borderRadius: 20,
          boxShadow: '0 0 40px rgba(34,211,238,0.12), 0 20px 60px rgba(0,0,0,0.7)',
          backdropFilter: 'blur(20px)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(34,211,238,0.05)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg,#22d3ee,#2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: '0 0 12px rgba(34,211,238,0.4)',
              flexShrink: 0,
            }}>🎙️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight: 700, fontSize: 13, color: '#f1f5f9' }}>
                CivicSync Voice AI
              </div>
              <div style={{ fontSize: 10, color: '#22d3ee', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {state === 'idle'     ? 'Offline'
                : state === 'connecting' ? 'Connecting…'
                : state === 'ending'  ? 'Ending call…'
                : isSpeaking ? '● Speaking'
                : '● Listening'}
              </div>
            </div>
            {}
            {state === 'active' && (
              <div style={{ width: 48, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${volPct}%`, background: '#22d3ee', borderRadius: 4, transition: 'width 0.1s ease' }} />
              </div>
            )}
            <button onClick={togglePanel} style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>✕</button>
          </div>
          {}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 6px', display: 'flex', flexDirection: 'column', gap: 10, scrollbarWidth: 'none' }}>
            {state === 'connecting' && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className="va-dot" />
                  <span className="va-dot" />
                  <span className="va-dot" />
                </div>
              </div>
            )}
            {state === 'idle' && messages.length === 0 && (
              <div style={{ padding: '18px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🎙️</div>
                <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
                  Mic button press karein to start karo.<br/>
                  <span style={{ color: '#22d3ee', fontWeight: 600 }}>English or Hinglish</span> mein baat karo!
                </div>
                <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(34,211,238,0.06)', borderRadius: 12, border: '1px solid rgba(34,211,238,0.15)' }}>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Try asking:</div>
                  {[
                    '"Kitne naye complaints hain?"',
                    '"How many complaints are resolved?"',
                    '"Water supply mein kitne issues hain?"',
                    '"How do I file a complaint?"',
                  ].map(q => (
                    <div key={q} style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, textAlign: 'left' }}>• {q}</div>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                {m.role === 'assistant' && (
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#22d3ee,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, marginRight: 8, marginTop: 2 }}>
                    🤖
                  </div>
                )}
                <div style={{
                  maxWidth: '80%',
                  padding: '9px 13px',
                  borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.role === 'user'
                    ? 'linear-gradient(135deg,#0ea5e9,#2563eb)'
                    : 'rgba(255,255,255,0.06)',
                  border: m.role === 'assistant' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  fontSize: 13,
                  color: '#f1f5f9',
                  lineHeight: 1.55,
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={msgEndRef} />
          </div>
          {}
          <div style={{ padding: '12px 14px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
            {state === 'idle' ? (
              <button onClick={startCall} style={{
                flex: 1, padding: '10px', borderRadius: 12,
                background: 'linear-gradient(90deg,#0ea5e9,#6366f1)',
                color: 'white', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              }}>
                🎙️ Start Voice Call
              </button>
            ) : state === 'active' ? (
              <button onClick={endCall} style={{
                flex: 1, padding: '10px', borderRadius: 12,
                background: 'linear-gradient(90deg,#ef4444,#b91c1c)',
                color: 'white', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              }}>
                📵 End Call
              </button>
            ) : (
              <div style={{ flex: 1, textAlign: 'center', color: '#64748b', fontSize: 12, padding: '10px' }}>
                {state === 'connecting' ? 'Connecting to AI…' : 'Ending call…'}
              </div>
            )}
          </div>
        </div>
      )}
      {}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {}
        {state === 'active' && (
          <>
            <div className="va-ripple" />
            <div className="va-ripple2" />
          </>
        )}
        <button
          onClick={state === 'idle' ? () => { startCall(); setOpen(true) } : togglePanel}
          title={state === 'idle' ? 'Talk to CivicSync AI' : 'Toggle panel'}
          className={state === 'active' ? 'va-active-ring' : ''}
          style={{
            width: 60, height: 60,
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
            background: state === 'active'
              ? 'linear-gradient(135deg,#06b6d4,#2563eb)'
              : state === 'connecting'
              ? 'linear-gradient(135deg,#6366f1,#4f46e5)'
              : 'linear-gradient(135deg,#0ea5e9,#6366f1)',
            boxShadow: state === 'active'
              ? '0 0 0 0 rgba(34,211,238,0.7)'
              : '0 4px 24px rgba(14,165,233,0.45), 0 8px 40px rgba(0,0,0,0.4)',
            transition: 'all 0.3s ease',
          }}
        >
          {state === 'connecting' ? (
            <div style={{ display: 'flex', gap: 3 }}>
              <span className="va-dot" style={{ width: 5, height: 5 }} />
              <span className="va-dot" style={{ width: 5, height: 5 }} />
              <span className="va-dot" style={{ width: 5, height: 5 }} />
            </div>
          ) : state === 'active' ? (
            <span style={{ fontSize: 22 }}>🎙️</span>
          ) : (
            <span style={{ fontSize: 22 }}>🎙️</span>
          )}
        </button>
        {}
        {state === 'idle' && !open && (
          <div style={{
            position: 'absolute', right: 68, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(10,15,35,0.95)',
            border: '1px solid rgba(34,211,238,0.25)',
            color: '#f1f5f9',
            fontSize: 12, fontWeight: 600,
            borderRadius: 10,
            padding: '7px 12px',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
            pointerEvents: 'none',
          }}>
            🎙️ Talk to CivicSync AI
          </div>
        )}
      </div>
    </div>
  )
}
