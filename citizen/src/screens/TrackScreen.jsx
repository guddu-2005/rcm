import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import useStore from '../store';
const STAGES = ['submitted', 'underReview', 'assigned', 'inProgress', 'resolved'];
const STAGE_LABELS = { submitted: 'Submitted', underReview: 'Under Review', assigned: 'Assigned', inProgress: 'In Progress', resolved: 'Resolved' };
const STAGE_ICONS = { submitted: '📝', underReview: '🔍', assigned: '👤', inProgress: '🔧', resolved: '✅' };
const CAT_ICONS = { water: '💧', electricity: '⚡', road: '🛣️', health: '🏥', sanitation: '🗑️', fire: '🔥', flood: '🌊', crime: '🚨', other: '📋', gas: '💨' };
function timeAgo(ts) {
  if (!ts) return '';
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
export default function TrackScreen() {
  const { user } = useStore();
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'complaints'),
      where('userId', '==', user.uid)
    );
    return onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setComplaints(data);
      setLoading(false);
    }, () => setLoading(false));
  }, [user]);
  if (selected) {
    const c = selected;
    const stageIdx = STAGES.indexOf(c.status);
    return (
      <div className="screen">
        <div className="topbar">
          <button className="topbar-back" onClick={() => setSelected(null)}>←</button>
          <div className="topbar-title">Track Complaint</div>
        </div>
        <div className="page">
          {}
          <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(59,130,246,0.06))', border: '1px solid var(--border)', borderRadius: 16, padding: 18, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>Ticket ID</div>
                <code style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent2)' }}>{c.ticketId || c.id.slice(0, 8)}</code>
              </div>
              <span className={`pill pill-${c.status}`}>{c.status}</span>
            </div>
            <div style={{ marginTop: 12, fontWeight: 700, fontSize: 15 }}>{c.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>
              {CAT_ICONS[c.category] || '📋'} {c.category} · 📍 {c.location?.area} · {timeAgo(c.createdAt)}
            </div>
          </div>
          {}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 18, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Status Timeline</div>
            <div className="timeline">
              {STAGES.map((stage, i) => {
                const isDone = i < stageIdx;
                const isCurrent = i === stageIdx;
                const isLast = i === STAGES.length - 1;
                return (
                  <div key={stage} className="tl-item">
                    <div className="tl-left">
                      <div className={`tl-dot ${isDone ? 'done' : isCurrent ? 'current' : 'inactive'}`} />
                      {!isLast && <div className="tl-line" />}
                    </div>
                    <div className="tl-content">
                      <div className="tl-stage" style={{ color: isCurrent ? 'var(--yellow)' : isDone ? 'var(--green)' : 'var(--text3)' }}>
                        {STAGE_ICONS[stage]} {STAGE_LABELS[stage]}
                        {isCurrent && <span style={{ marginLeft: 6, fontSize: 11, background: 'rgba(234,179,8,0.1)', color: 'var(--yellow)', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>Current</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {}
          {c.description && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 18, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Description</div>
              <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>{c.description}</p>
            </div>
          )}
          {}
          {c.reportCount > 1 && (
            <div className="alert alert-warn">
              <span>🔁</span>
              <span>This complaint has been reported by <strong>{c.reportCount} citizens</strong>. High collective priority!</span>
            </div>
          )}
          {}
          {c.assignedTo && (
            <div className="alert alert-info mt-3">
              <span>👤</span>
              <div>
                <div style={{ fontWeight: 600 }}>Assigned to: {c.assignedTo}</div>
                {c.deadline && <div style={{ fontSize: 12, marginTop: 2 }}>Deadline: {c.deadline}</div>}
              </div>
            </div>
          )}
          {}
          {(c.media || []).length > 0 && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 18, marginTop: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>Attached Photos</div>
              <div className="media-grid">
                {(c.media || []).map((url, i) => (
                  <div key={i} className="media-item">
                    <img src={url} alt="" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="screen">
      <div className="topbar">
        <div className="topbar-title">Track Complaints</div>
      </div>
      <div className="page">
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : complaints.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60, color: 'var(--text2)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>No Complaints Yet</div>
            <div style={{ fontSize: 14 }}>Your submitted complaints will appear here</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {complaints.map(c => (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: 16,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 18 }}>{CAT_ICONS[c.category] || '📋'}</span>
                      <code style={{ fontSize: 12, color: 'var(--accent2)' }}>{c.ticketId || c.id.slice(0, 8)}</code>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>
                      📍 {c.location?.area} · {timeAgo(c.createdAt)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <span className={`pill pill-${c.status}`}>{c.status}</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>Tap to track →</span>
                  </div>
                </div>
                {}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 12 }}>
                  {STAGES.map((s, i) => {
                    const stIdx = STAGES.indexOf(c.status);
                    return (
                      <div key={s} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= stIdx ? 'var(--accent2)' : 'var(--bg3)', transition: 'background 0.3s' }} />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
