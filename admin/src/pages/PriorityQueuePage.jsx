import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useComplaintStore from '../stores/complaintStore';
import TopNavbar from '../components/TopNavbar';
import { PriorityBadge, CategoryChip, StatusBadge, DuplicateBadge, ScoreBar, timeAgo } from '../components/ComplaintComponents';
import { calculatePriorityScore, getPriorityLabel } from '../intelligence/priorityEngine';
import { Flame, TrendingUp, AlertTriangle } from 'lucide-react';

export default function PriorityQueuePage() {
  const { rankedComplaints, stats, subscribeAll, loading } = useComplaintStore();
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = subscribeAll();
    return unsub;
  }, []);

  const activeComplaints = rankedComplaints.filter(c => c.status !== 'resolved');
  const critical = activeComplaints.filter(c => (c.priorityScore || calculatePriorityScore(c)) >= 75);
  const high = activeComplaints.filter(c => {
    const s = c.priorityScore || calculatePriorityScore(c);
    return s >= 55 && s < 75;
  });
  const medium = activeComplaints.filter(c => {
    const s = c.priorityScore || calculatePriorityScore(c);
    return s >= 35 && s < 55;
  });
  const low = activeComplaints.filter(c => (c.priorityScore || calculatePriorityScore(c)) < 35);

  const groups = [
    { label: '🔴 Critical', color: 'var(--red)', complaints: critical, bg: 'rgba(239,68,68,0.05)', border: 'rgba(239,68,68,0.25)' },
    { label: '🟠 High Priority', color: 'var(--orange)', complaints: high, bg: 'rgba(249,115,22,0.05)', border: 'rgba(249,115,22,0.25)' },
    { label: '🟡 Medium Priority', color: 'var(--yellow)', complaints: medium, bg: 'rgba(245,158,11,0.05)', border: 'rgba(245,158,11,0.25)' },
    { label: '🟢 Low Priority', color: 'var(--green)', complaints: low, bg: 'rgba(16,185,129,0.05)', border: 'rgba(16,185,129,0.25)' },
  ];

  return (
    <>
      <TopNavbar
        title="🔥 Priority Intelligence Queue"
        subtitle={`${activeComplaints.length} active · Auto-ranked by AI priority engine`}
      />
      <div className="page-content animate-fadeIn">
        {/* Priority Summary */}
        <div className="kpi-grid mb-6">
          <div className="kpi-card" style={{ '--color': 'var(--red)' }}>
            <div className="kpi-icon" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)' }}>🔴</div>
            <div className="kpi-value">{critical.length}</div>
            <div className="kpi-label">Critical – Act Now</div>
          </div>
          <div className="kpi-card" style={{ '--color': 'var(--orange)' }}>
            <div className="kpi-icon" style={{ background: 'rgba(249,115,22,0.1)', color: 'var(--orange)' }}>🟠</div>
            <div className="kpi-value">{high.length}</div>
            <div className="kpi-label">High Priority</div>
          </div>
          <div className="kpi-card" style={{ '--color': 'var(--yellow)' }}>
            <div className="kpi-icon" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--yellow)' }}>🟡</div>
            <div className="kpi-value">{medium.length}</div>
            <div className="kpi-label">Medium Priority</div>
          </div>
          <div className="kpi-card" style={{ '--color': 'var(--green)' }}>
            <div className="kpi-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--green)' }}>🟢</div>
            <div className="kpi-value">{low.length}</div>
            <div className="kpi-label">Low Priority</div>
          </div>
        </div>

        {/* How Priority Works */}
        <div className="card mb-6">
          <div className="card-header">
            <span className="card-title">🧠 Priority Scoring Formula</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
            {[
              { label: 'Severity', weight: '40pts', desc: 'Critical/High/Med/Low base score' },
              { label: 'Complaint Age', weight: '20pts', desc: 'Older issues escalate urgency' },
              { label: 'Report Count', weight: '20pts', desc: 'More citizens = more impact' },
              { label: 'Population Impact', weight: '10pts', desc: 'Families or area affected' },
              { label: 'Media Evidence', weight: '5pts', desc: 'Photos/audio boosts credibility' },
              { label: 'Upvotes', weight: '5pts', desc: 'Community support score' },
            ].map(f => (
              <div key={f.label} style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{f.label}</div>
                <div style={{ fontSize: 14, color: 'var(--accent-light)', fontWeight: 700, margin: '2px 0' }}>{f.weight}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
            ✨ Final score is multiplied by <strong style={{ color: 'var(--text-secondary)' }}>category urgency</strong> (Fire/Flood × 1.5) and <strong style={{ color: 'var(--text-secondary)' }}>location importance</strong> (Hospital area × 1.5)
          </div>
        </div>

        {/* Priority Groups */}
        {groups.map(group => group.complaints.length > 0 && (
          <div key={group.label} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: group.color }}>{group.label}</h3>
              <span style={{ fontSize: 12, background: group.bg, border: `1px solid ${group.border}`, color: group.color, padding: '2px 10px', borderRadius: 99, fontWeight: 700 }}>
                {group.complaints.length} complaints
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {group.complaints.map((c, i) => {
                const score = c.priorityScore || calculatePriorityScore(c);
                return (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/complaints/${c.id}`)}
                    style={{
                      background: group.bg,
                      border: `1px solid ${group.border}`,
                      borderLeft: `4px solid ${group.color}`,
                      borderRadius: 10,
                      padding: '14px 16px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      display: 'grid',
                      gridTemplateColumns: '28px 1fr auto',
                      gap: 12,
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ fontSize: 16, fontWeight: 800, color: group.color, textAlign: 'center' }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <code style={{ fontSize: 11, color: 'var(--accent-light)', background: 'var(--accent-glow)', padding: '2px 6px', borderRadius: 4 }}>
                          {c.ticketId || c.id?.slice(0, 8)}
                        </code>
                        <CategoryChip category={c.category} />
                        <DuplicateBadge count={c.reportCount} />
                        <StatusBadge status={c.status} />
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{c.title || 'Untitled Report'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        📍 {c.location?.area || 'Location unknown'} · 🕐 {timeAgo(c.createdAt)}
                        {c.assignedTo && ` · 👤 ${c.assignedTo}`}
                      </div>
                      <div style={{ marginTop: 6, width: '60%' }}>
                        <ScoreBar score={score} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: group.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                        {score}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Score</div>
                      <button className="btn btn-sm btn-secondary" onClick={e => { e.stopPropagation(); navigate(`/complaints/${c.id}`); }}>
                        Manage →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {activeComplaints.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <div className="empty-title">No active complaints!</div>
            <div className="empty-desc">All complaints have been resolved. Great work!</div>
          </div>
        )}
      </div>
    </>
  );
}
