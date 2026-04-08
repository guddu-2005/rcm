import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── Role Data ────────────────────────────────────────────────
const ROLES = [
  {
    id: 'citizen',
    emoji: '👤',
    title: 'Citizen',
    desc: 'File complaints and track real-time resolution status from anywhere.',
    href: '/citizen/register',
    glow: 'rgba(56, 189, 248, 0.5)',
    border: 'rgba(56, 189, 248, 0.35)',
    tag: '#38bdf8',
    tagBg: 'rgba(56,189,248,0.12)',
  },
  {
    id: 'admin',
    emoji: '🛡️',
    title: 'Admin',
    desc: 'Command center — manage complaints, departments, workers & analytics.',
    href: '/admin/login',
    glow: 'rgba(168, 85, 247, 0.5)',
    border: 'rgba(168,85,247,0.35)',
    tag: '#a855f7',
    tagBg: 'rgba(168,85,247,0.12)',
  },
  {
    id: 'department',
    emoji: '🏢',
    title: 'Department',
    desc: 'Review incoming grievances and assign them to your field workers.',
    href: '/department/login',
    glow: 'rgba(34, 197, 94, 0.5)',
    border: 'rgba(34,197,94,0.35)',
    tag: '#22c55e',
    tagBg: 'rgba(34,197,94,0.12)',
  },
  {
    id: 'worker',
    emoji: '⚙️',
    title: 'Field Worker',
    desc: 'Accept dispatched tasks, update progress, and close resolved issues.',
    href: '/worker/login',
    glow: 'rgba(251, 191, 36, 0.5)',
    border: 'rgba(251,191,36,0.35)',
    tag: '#fbbf24',
    tagBg: 'rgba(251,191,36,0.12)',
  },
]

// ─── Lifecycle Steps ──────────────────────────────────────────
const STAGES = [
  { label: 'Submission',  icon: '📄', sub: 'Grievance ingested via portal endpoints',    glow: '#3b82f6', glowRgb: '59,130,246' },
  { label: 'AI Analysis', icon: '🧠', sub: 'Neural network categorization & tagging',    glow: '#a855f7', glowRgb: '168,85,247' },
  { label: 'Priority',    icon: '⚠️', sub: 'Triage and urgency mapping algorithm',        glow: '#ef4444', glowRgb: '239,68,68'  },
  { label: 'Allocation',  icon: '🏛️', sub: 'Targeted department routing engine',          glow: '#f59e0b', glowRgb: '245,158,11' },
  { label: 'Tracking',    icon: '📡', sub: 'Real-time status telemetry dashboard',        glow: '#06b6d4', glowRgb: '6,182,212'  },
  { label: 'Resolution',  icon: '✅', sub: 'Verified closure and citizen feedback',       glow: '#22d3ee', glowRgb: '34,211,238' },
]

// ─── Feature Nexus ────────────────────────────────────────────
const FEATURES = [
  { icon: '⚡', title: 'Neural Auto-Routing',    desc: 'AI classifies and routes each complaint to the right department instantly.' },
  { icon: '📡', title: 'Real-Time Telemetry',    desc: 'Citizens see every status change — Submitted to Closed — live.' },
  { icon: '🏛️', title: 'Multi-Department Mesh',  desc: '6 government departments orchestrated on a single unified platform.' },
  { icon: '📊', title: 'Analytics Command',       desc: 'Admin monitors SLA compliance, resolution rates, and live trends.' },
  { icon: '🔔', title: 'Instant Alerts',          desc: 'Toast notifications and timeline logs keep every stakeholder informed.' },
  { icon: '📱', title: 'Mobile-First Design',     desc: 'Fully responsive — works flawlessly on phones, tablets, and desktops.' },
]

// ─── Inline CSS (injected once) ───────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;500;600;700;800&display=swap');

  .cs-land { font-family: 'Plus Jakarta Sans', sans-serif; }
  .cs-land .sg { font-family: 'Space Grotesk', sans-serif; }

  /* Mesh BG */
  .cs-mesh-bg {
    background:
      radial-gradient(circle at 0% 0%, rgba(30,58,138,0.35) 0%, transparent 50%),
      radial-gradient(circle at 100% 100%, rgba(79,70,229,0.25) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%);
  }

  /* Glassmorphism */
  .cs-glass {
    background: rgba(15,23,42,0.65);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,0.09);
    box-shadow: 0 8px 32px rgba(0,0,0,0.7);
  }

  /* Cyber button shimmer */
  .cs-cyber-btn {
    position: relative;
    background: linear-gradient(90deg,#0ea5e9,#6366f1);
    overflow: hidden;
    transition: all .3s;
    cursor: pointer;
  }
  .cs-cyber-btn::before {
    content:'';
    position:absolute;
    top:0;left:-100%;
    width:100%;height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent);
    transition:.5s;
  }
  .cs-cyber-btn:hover::before { left:100%; }
  .cs-cyber-btn:active { transform:scale(0.97); }

  /* Outline cyber btn */
  .cs-ghost-btn {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.12);
    color:#f1f5f9;
    transition:all .3s;
    cursor:pointer;
  }
  .cs-ghost-btn:hover { background:rgba(255,255,255,0.1); }

  /* Flow line */
  .cs-flow-track {
    position:absolute;
    top:48px;left:0;
    width:100%;height:4px;
    background:rgba(255,255,255,0.04);
  }
  .cs-flow-pulse {
    position:absolute;
    top:0;left:0;
    height:100%;width:220px;
    background:linear-gradient(90deg,transparent,#00f2ff,transparent);
    box-shadow:0 0 18px #00f2ff;
    animation:csFlow 2.8s infinite linear;
  }
  @keyframes csFlow { from{left:-220px} to{left:100%} }

  /* 3-D Glass node */
  .cs-node {
    width:96px;height:96px;
    border-radius:50%;
    background: radial-gradient(circle at 35% 35%,rgba(255,255,255,0.38) 0%,rgba(255,255,255,0.08) 50%,rgba(0,0,0,0.22) 100%);
    border:2px solid rgba(255,255,255,0.28);
    box-shadow:
      inset 5px 5px 12px rgba(255,255,255,0.18),
      inset -5px -5px 14px rgba(0,0,0,0.38),
      0 14px 28px rgba(0,0,0,0.55);
    display:flex;align-items:center;justify-content:center;
    position:relative;z-index:10;
    transition:all .45s cubic-bezier(.19,1,.22,1);
    backdrop-filter:blur(4px);
    font-size:2.2rem;
  }
  .cs-node:hover {
    transform:scale(1.15) translateY(-8px);
    border-color:#00f2ff;
    box-shadow:
      inset 5px 5px 12px rgba(255,255,255,0.28),
      inset -5px -5px 14px rgba(0,0,0,0.38),
      0 0 28px var(--nd-glow),
      0 14px 28px rgba(0,0,0,0.55);
  }
  .cs-node-glow {
    position:absolute;
    width:76%;height:76%;
    border-radius:50%;
    background:var(--nd-glow);
    filter:blur(16px);
    opacity:0.3;
    z-index:-1;
    transition:opacity .4s;
  }
  .cs-node:hover .cs-node-glow { opacity:0.85; }

  .cs-step-tag {
    background:rgba(0,0,0,0.55);
    border:1px solid rgba(255,255,255,0.14);
    padding:4px 18px;
    border-radius:9999px;
    font-size:10px;
    font-weight:900;
    text-transform:uppercase;
    letter-spacing:0.15em;
    transition:all .3s;
    white-space:nowrap;
  }

  /* Role card */
  .cs-role-card {
    background:rgba(15,23,42,0.55);
    border: 1.5px solid rgba(255,255,255,0.08);
    backdrop-filter:blur(12px);
    border-radius:1.5rem;
    padding:1.75rem;
    cursor:pointer;
    transition:all .3s cubic-bezier(.19,1,.22,1);
    text-align:left;
  }
  .cs-role-card:hover {
    transform:translateY(-6px);
    border-color:var(--rc-border);
    box-shadow:0 0 28px var(--rc-glow), 0 20px 40px rgba(0,0,0,0.5);
  }

  /* Feature card */
  .cs-feat-card {
    background:rgba(15,23,42,0.55);
    border:1px solid rgba(255,255,255,0.07);
    backdrop-filter:blur(12px);
    border-radius:1.25rem;
    padding:1.5rem;
    transition:all .3s;
  }
  .cs-feat-card:hover {
    border-color:rgba(0,242,255,0.3);
    box-shadow:0 0 20px rgba(0,242,255,0.08);
    transform:translateY(-3px);
  }

  /* Circuit overlay */
  .cs-circuit {
    position:absolute;inset:0;
    background-image:url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10 L90 10 L90 90 L10 90 Z' fill='none' stroke='rgba(255,255,255,0.025)' stroke-width='0.5'/%3E%3Ccircle cx='10' cy='10' r='1' fill='rgba(255,255,255,0.04)'/%3E%3C/svg%3E");
    opacity:0.6;pointer-events:none;
  }

  /* Fade-in on scroll */
  .cs-fi { opacity:0; transform:translateY(28px); transition:all .75s cubic-bezier(.4,0,.2,1); }
  .cs-fi.cs-vis { opacity:1; transform:translateY(0); }

  /* Stat float cards */
  .cs-stat-card {
    background:#fff;
    border-radius:1rem;
    padding:.75rem 1.25rem;
    text-align:center;
    box-shadow:0 8px 30px rgba(0,0,0,0.35);
    min-width:80px;
  }

  /* Pulse dot */
  @keyframes csPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.4)} }
  .cs-pulse-dot { animation:csPulse 1.8s infinite; }
`

// ─── Component ────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate()
  const obsRef = useRef<IntersectionObserver | null>(null)

  // Inject styles once
  useEffect(() => {
    if (document.getElementById('cs-land-style')) return
    const tag = document.createElement('style')
    tag.id = 'cs-land-style'
    tag.textContent = GLOBAL_CSS
    document.head.appendChild(tag)
    return () => { document.getElementById('cs-land-style')?.remove() }
  }, [])

  // Intersection observer for fade-ins
  useEffect(() => {
    obsRef.current = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('cs-vis') })
    }, { threshold: 0.1 })
    document.querySelectorAll('.cs-fi').forEach(el => obsRef.current!.observe(el))
    return () => obsRef.current?.disconnect()
  }, [])

  return (
    <div className="cs-land cs-mesh-bg min-h-screen overflow-x-hidden text-slate-100">

      {/* ─── NAV ─── */}
      <nav className="cs-glass sticky top-0 z-50" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center text-white font-black text-xl rounded-xl"
              style={{ background:'linear-gradient(135deg,#22d3ee,#2563eb)', boxShadow:'0 0 18px rgba(34,211,238,0.4)' }}>
              C
            </div>
            <span className="sg text-2xl font-extrabold tracking-tighter">
              CIVIC<span style={{ color:'#22d3ee' }}>SYNC</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Stakeholders','Protocol','Nexus'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`}
                className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-cyan-400 transition-colors">
                {l}
              </a>
            ))}
            <button onClick={() => navigate('/citizen/register')}
              className="cs-cyber-btn px-6 py-2.5 rounded-lg text-white font-bold text-sm shadow-lg">
              Initialize Portal
            </button>
          </div>
          {/* Mobile btn */}
          <button onClick={() => navigate('/citizen/register')}
            className="md:hidden cs-cyber-btn px-4 py-2 rounded-lg text-white font-bold text-xs">
            Start
          </button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <header className="relative pt-20 pb-40 overflow-hidden">
        {/* Subtle dot grid */}
        <div className="pointer-events-none absolute inset-0"
          style={{ backgroundImage:'radial-gradient(circle at 1px 1px,rgba(255,255,255,0.04) 1px,transparent 0)', backgroundSize:'36px 36px' }} />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Left */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 cs-glass px-4 py-2 rounded-full"
              style={{ border:'1px solid rgba(34,211,238,0.3)' }}>
              <span className="cs-pulse-dot w-2 h-2 rounded-full bg-cyan-400 inline-block" />
              <span className="text-xs font-black uppercase tracking-widest text-cyan-400">Quantum Governance v2.0</span>
            </div>

            <h1 className="sg font-bold leading-[0.92] tracking-tighter">
              <span className="block text-5xl md:text-7xl text-white">THE FUTURE OF</span>
              <span className="block text-5xl md:text-7xl mt-1"
                style={{ background:'linear-gradient(90deg,#22d3ee,#3b82f6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                CIVIC RESOLUTION
              </span>
            </h1>

            <p className="text-lg text-slate-400 max-w-xl font-light leading-relaxed">
              Decentralizing public grievance through advanced AI orchestration. We connect citizens to
              municipal infrastructure in a high-fidelity real-time nexus.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => navigate('/citizen/register')}
                className="cs-cyber-btn px-10 py-4 rounded-2xl text-white font-bold text-lg"
                style={{ boxShadow:'0 0 32px rgba(14,165,233,0.32)' }}>
                Launch Dashboard
              </button>
              <button onClick={() => navigate('/admin/login')}
                className="cs-ghost-btn px-10 py-4 rounded-2xl font-bold text-lg">
                Admin Portal →
              </button>
            </div>


          </div>

          {/* Right — glass feature cards */}
          <div className="relative hidden lg:block">
            <div className="absolute -inset-6 rounded-[3rem] blur-3xl"
              style={{ background:'linear-gradient(135deg,rgba(34,211,238,0.15),rgba(59,130,246,0.1))' }} />
            <div className="grid grid-cols-2 gap-4 relative">
              {[
                { icon:'🤖', title:'Neural Routing',   sub:'Auto-classify & route',  delay:'0ms'  },
                { icon:'🛰️', title:'Spatial Logs',     sub:'GPS-tagged reports',      delay:'80ms' },
                { icon:'📊', title:'Live Analytics',   sub:'Real-time dashboards',    delay:'160ms'},
                { icon:'🔒', title:'Role Enforcement', sub:'RBAC security layer',     delay:'240ms'},
              ].map((c, i) => (
                <div key={c.title}
                  className={`cs-glass rounded-[2rem] p-7 space-y-3 cs-fi ${i % 2 === 1 ? 'translate-y-8' : ''}`}
                  style={{ animationDelay: c.delay }}>
                  <div className="text-3xl">{c.icon}</div>
                  <div className="font-bold text-white text-sm">{c.title}</div>
                  <div className="text-xs text-slate-500">{c.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ─── STAKEHOLDERS / ROLE SELECTOR ─── */}
      <section id="stakeholders" className="py-28 px-6 relative" style={{ background:'rgba(255,255,255,0.025)' }}>
        <div className="cs-circuit" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-14 cs-fi">
            <span className="text-xs font-black uppercase tracking-[0.4em] text-cyan-400">Access Matrix</span>
            <h2 className="sg text-4xl md:text-6xl font-bold mt-3 text-white">Choose Your Role</h2>
            <p className="text-slate-400 mt-4 text-lg max-w-xl mx-auto">
              Select your role to access your personalized command interface.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ROLES.map((r, i) => (
              <button key={r.id}
                onClick={() => navigate(r.href)}
                className="cs-role-card cs-fi text-left"
                style={{
                  '--rc-glow': r.glow,
                  '--rc-border': r.border,
                  animationDelay: `${i * 90}ms`,
                } as React.CSSProperties}>
                <div className="text-4xl mb-5">{r.emoji}</div>
                <span className="text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{ background: r.tagBg, color: r.tag }}>
                  {r.id}
                </span>
                <h3 className="sg font-bold text-white text-xl mt-3 mb-2">{r.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{r.desc}</p>
                <div className="mt-5 text-xs font-bold flex items-center gap-1 transition-all"
                  style={{ color: r.tag }}>
                  Initialize → 
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRANSPARENCY PROTOCOL / LIFECYCLE ─── */}
      <section id="protocol" className="py-36 relative overflow-hidden">
        <div className="cs-circuit" />
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="cs-fi space-y-3 mb-20">
            <span className="text-xs font-black uppercase tracking-[0.5em] text-cyan-400">System Workflow</span>
            <h2 className="sg text-5xl md:text-7xl font-bold text-white leading-tight">Transparency Protocol</h2>
          </div>

          <div className="relative py-16 overflow-x-auto" style={{ scrollbarWidth:'none' }}>
            {/* Flow line */}
            <div className="cs-flow-track hidden md:block">
              <div className="cs-flow-pulse" />
            </div>

            <div className="flex flex-row md:justify-between items-start gap-10 relative px-8"
              style={{ minWidth: '1100px' }}>
              {STAGES.map((s, i) => (
                <div key={s.label}
                  className="cs-fi flex flex-col items-center gap-8 w-40 shrink-0"
                  style={{ transitionDelay: `${i * 100}ms` }}>
                  {/* 3-D Glass Node */}
                  <div className="cs-node"
                    style={{ '--nd-glow': s.glow } as React.CSSProperties}>
                    <div className="cs-node-glow" style={{ background: s.glow }} />
                    <span style={{ position:'relative', zIndex:20, filter:`drop-shadow(0 0 10px rgba(${s.glowRgb},0.7))` }}>
                      {s.icon}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="cs-step-tag text-white"
                      style={{ borderColor: `rgba(${s.glowRgb},0.4)` }}>
                      {s.label}
                    </span>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed max-w-[130px] mx-auto">
                      {s.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURE NEXUS ─── */}
      <section id="nexus" className="py-28 px-6" style={{ background:'rgba(255,255,255,0.02)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 cs-fi">
            <span className="text-xs font-black uppercase tracking-[0.4em] text-cyan-400">Core Capabilities</span>
            <h2 className="sg text-4xl md:text-6xl font-bold text-white mt-3">The Intelligence Nexus</h2>
            <p className="text-slate-400 mt-4 text-lg max-w-2xl mx-auto">
              Built to handle the full complaint lifecycle with transparency, speed, and precision at every stage.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={f.title}
                className="cs-feat-card cs-fi"
                style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="sg font-bold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:'radial-gradient(ellipse at center,rgba(34,211,238,0.08) 0%,transparent 70%)' }} />
        <div className="max-w-3xl mx-auto text-center relative z-10 cs-fi">
          <h2 className="sg text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Ready to build a <span style={{ color:'#22d3ee' }}>smarter city?</span>
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            Join CivicSync today. File your first complaint in under 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/citizen/register')}
              className="cs-cyber-btn px-12 py-4 rounded-2xl text-white font-bold text-lg"
              style={{ boxShadow:'0 0 35px rgba(14,165,233,0.35)' }}>
              Register as Citizen
            </button>
            <button onClick={() => navigate('/department/login')}
              className="cs-ghost-btn px-12 py-4 rounded-2xl font-bold text-lg">
              Department Portal
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="cs-glass py-16 px-6" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
          <div className="col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ background:'#22d3ee' }}>
                C
              </div>
              <span className="sg text-2xl font-extrabold tracking-tighter text-white">CIVICSYNC</span>
            </div>
            <p className="text-slate-500 text-sm max-w-sm">
              Automating the social contract through technology. Civil infrastructure, digitized for the next generation.
            </p>
            <div className="flex gap-4 flex-wrap">
              {['Citizen Portal','Admin Login','Department Login','Worker Portal'].map(l => (
                <button key={l}
                  onClick={() => navigate(l.includes('Citizen') ? '/citizen/register' : l.includes('Admin') ? '/admin/login' : l.includes('Dept') ? '/department/login' : '/worker/login')}
                  className="text-xs font-bold text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-widest">
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-slate-600">System Status</p>
            {[['Grievance API','Operational'],['AI Classifier','Active'],['SLA Monitor','Running']].map(([s,v]) => (
              <div key={s} className="flex justify-between items-center">
                <span className="text-xs text-slate-500">{s}</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 cs-pulse-dot inline-block" />{v}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-14 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            © 2024 CivicSync Protocol. Operating under Smart Cities Mission.
          </p>
          <p className="text-xs text-slate-600">Your Voice. Your City. Resolved.</p>
        </div>
      </footer>

    </div>
  )
}
