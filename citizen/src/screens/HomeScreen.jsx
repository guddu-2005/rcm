import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import useStore from '../store';
import { Bell, Plus, TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
const STATUS_COLORS = {
  submitted: '#60a5fa', pending: '#fbbf24', underReview: '#a78bfa',
  assigned: '#22d3ee', inProgress: '#fb923c', escalated: '#f87171', resolved: '#4ade80',
};
function ComplaintCard({ c, onClick }) {
  const cat = c.category || 'other';
  const icons = { water: '💧', electricity: '⚡', road: '🛣️', health: '🏥', sanitation: '🗑️', fire: '🔥', flood: '🌊', crime: '🚨', other: '📋', gas: '💨', noise: '📢', animal: '🐕' };
  const priorityColors = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e' };
  const timeAgo = (ts) => {
    if (!ts) return '';
    const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    const diff = Date.now() - d.getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };
  return (
    <div
      className="complaint-card fade-up"
      onClick={() => onClick(c)}
      style={{ '--priority-color': priorityColors[c.severity] || '#8b5cf6' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ fontSize: 22, flexShrink: 0 }}>{icons[cat] || '📋'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {c.title || 'Untitled Complaint'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span className={`pill pill-${c.status || 'pending'}`}>{c.status || 'pending'}</span>
            {c.reportCount > 1 && (
              <span style={{ fontSize: 11, background: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '2px 7px', borderRadius: 99, fontWeight: 700 }}>
                🔁 {c.reportCount} reports
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--text2)' }}>{timeAgo(c.createdAt)}</div>
          {c.ticketId && (
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3, fontFamily: 'monospace' }}>
              {c.ticketId}
            </div>
          )}
        </div>
      </div>
      {c.location?.area && (
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text2)' }}>
          📍 {c.location.area}
        </div>
      )}
    </div>
  );
}
export default function HomeScreen({ onViewComplaint, onNewComplaint }) {
  const { user, profile } = useStore();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'complaints'),
      where('userId', '==', user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => {
        const ta = a.createdAt?.seconds || 0;
        const tb = b.createdAt?.seconds || 0;
        return tb - ta;
      });
      setComplaints(data);
      setLoading(false);
    }, (err) => {
      console.error('Firestore error:', err);
      setLoading(false);
    });
    return unsub;
  }, [user]);
  const filters = ['all', 'pending', 'inProgress', 'resolved'];
  const filtered = activeFilter === 'all' ? complaints :
    complaints.filter(c => c.status === activeFilter || (activeFilter === 'pending' && (c.status === 'submitted' || c.status === 'pending' || c.status === 'underReview')));
  const stats = {
    total: complaints.length,
    active: complaints.filter(c => !['resolved'].includes(c.status)).length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };
  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };
  return (
    <div className="screen">
      {}
      <div className="hero">
        <div className="hero-greeting">{greet()},</div>
        <div className="hero-title">{profile?.name || user?.displayName || 'Citizen'} 👋</div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-num" style={{ color: 'var(--accent2)' }}>{stats.total}</div>
            <div className="hero-stat-label">Total</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num" style={{ color: 'var(--yellow)' }}>{stats.active}</div>
            <div className="hero-stat-label">Active</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num" style={{ color: 'var(--green)' }}>{stats.resolved}</div>
            <div className="hero-stat-label">Resolved</div>
          </div>
        </div>
      </div>
      {}
      <div style={{ padding: '16px 16px 8px' }}>
        <button
          onClick={onNewComplaint}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.1))',
            border: '1px dashed rgba(124,58,237,0.4)',
            borderRadius: 14,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            cursor: 'pointer',
            color: 'var(--text)',
            transition: 'all 0.2s',
          }}
        >
          <div style={{
            width: 46, height: 46, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0,
            boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
          }}>📝</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Submit New Complaint</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Under 30 seconds · AI-assisted</div>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 20 }}>→</span>
        </button>
      </div>
      {}
      <div style={{ padding: '12px 16px 0', display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              background: activeFilter === f ? 'var(--accent)' : 'var(--bg3)',
              border: activeFilter === f ? '1px solid transparent' : '1px solid var(--border)',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 700,
              color: activeFilter === f ? 'white' : 'var(--text2)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            {f === 'all' ? `All (${stats.total})` :
             f === 'pending' ? `Pending (${complaints.filter(c => ['submitted','pending','underReview'].includes(c.status)).length})` :
             f === 'inProgress' ? `In Progress (${complaints.filter(c => c.status === 'inProgress' || c.status === 'assigned').length})` :
             `Resolved (${stats.resolved})`}
          </button>
        ))}
      </div>
      {}
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text2)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>No complaints yet</div>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>Submit your first complaint and we'll ensure it gets resolved!</div>
            <button onClick={onNewComplaint} className="btn btn-primary" style={{ marginTop: 20, width: 'auto', padding: '12px 24px' }}>
              + Submit Complaint
            </button>
          </div>
        ) : (
          filtered.map(c => (
            <ComplaintCard key={c.id} c={c} onClick={onViewComplaint} />
          ))
        )}
      </div>
    </div>
  );
}
