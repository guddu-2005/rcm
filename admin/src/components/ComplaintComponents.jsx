import { getPriorityLabel, calculatePriorityScore } from '../intelligence/priorityEngine';
const CATEGORY_ICONS = {
  water: '💧', electricity: '⚡', road: '🛣️', health: '🏥',
  sanitation: '🗑️', fire: '🔥', flood: '🌊', crime: '🚨',
  gas: '💨', other: '📋',
};
const STATUS_LABELS = {
  submitted: 'Submitted', pending: 'Pending', underReview: 'Under Review',
  assigned: 'Assigned', inProgress: 'In Progress', escalated: 'Escalated', resolved: 'Resolved',
};
export function PriorityBadge({ complaint }) {
  const score = calculatePriorityScore(complaint);
  const label = getPriorityLabel(score);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span className={`priority-badge priority-${label}`}>
        {label === 'critical' ? '🔴' : label === 'high' ? '🟠' : label === 'medium' ? '🟡' : '🟢'} {label}
      </span>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>{score}</span>
    </div>
  );
}
export function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${status || 'pending'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
export function CategoryChip({ category }) {
  return (
    <span className={`chip chip-${category || 'other'}`}>
      {CATEGORY_ICONS[category] || '📋'} {category || 'other'}
    </span>
  );
}
export function ScoreBar({ score }) {
  const color = score >= 75 ? '#ef4444' : score >= 55 ? '#f97316' : score >= 35 ? '#f59e0b' : '#10b981';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="score-bar" style={{ flex: 1 }}>
        <div className="score-fill" style={{ width: `${score}%`, background: color }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 28 }}>{score}</span>
    </div>
  );
}
export function DuplicateBadge({ count }) {
  if (!count || count <= 1) return null;
  return <span className="dup-badge">🔁 {count} reports</span>;
}
export function ComplaintTimeline({ timeline, status }) {
  const stages = ['submitted', 'underReview', 'assigned', 'inProgress', 'resolved'];
  const currentIndex = stages.indexOf(status);
  return (
    <div className="timeline">
      {stages.map((stage, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isLast = i === stages.length - 1;
        return (
          <div key={stage} className="timeline-item">
            <div className="timeline-line">
              <div className={`timeline-dot ${isDone ? 'done' : isCurrent ? 'current' : 'inactive'}`} />
              {!isLast && <div className="timeline-connector" />}
            </div>
            <div className="timeline-content">
              <div className="timeline-label" style={{ color: isCurrent ? 'var(--yellow)' : isDone ? 'var(--green)' : 'var(--text-muted)' }}>
                {STATUS_LABELS[stage]}
              </div>
              {isCurrent && <div className="timeline-desc">Currently at this stage</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
export function MediaGallery({ media = [] }) {
  if (!media.length) return <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No media attached</div>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
      {media.map((url, i) => (
        <a key={i} href={url} target="_blank" rel="noreferrer">
          <img
            src={url}
            alt={`Evidence ${i+1}`}
            style={{ width: '100%', aspectRatio: 1, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer' }}
          />
        </a>
      ))}
    </div>
  );
}
export function KpiCard({ label, value, icon, color, iconBg, change, changeType }) {
  return (
    <div className="kpi-card" style={{ '--color': color, '--icon-bg': iconBg }}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-value">{value?.toLocaleString() || 0}</div>
      <div className="kpi-label">{label}</div>
      {change !== undefined && (
        <div className={`kpi-change ${changeType}`}>
          {changeType === 'up' ? '↑' : '↓'} {Math.abs(change)}% this week
        </div>
      )}
    </div>
  );
}
export function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
export function timeAgo(ts) {
  if (!ts) return '';
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
