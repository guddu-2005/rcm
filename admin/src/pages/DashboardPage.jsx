import { useEffect } from 'react';
import useComplaintStore from '../stores/complaintStore';
import useAuthStore from '../stores/authStore';
import TopNavbar from '../components/TopNavbar';
import {
  KpiCard, PriorityBadge, StatusBadge, CategoryChip, ScoreBar, DuplicateBadge, timeAgo
} from '../components/ComplaintComponents';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { rankComplaints } from '../intelligence/priorityEngine';
import { useNavigate } from 'react-router-dom';
const COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#f97316', '#ec4899'];
function generateTrendData(complaints) {
  const map = {};
  complaints.forEach(c => {
    const d = c.createdAt?.seconds
      ? new Date(c.createdAt.seconds * 1000)
      : c.createdAt ? new Date(c.createdAt) : new Date();
    const key = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    map[key] = (map[key] || 0) + 1;
  });
  const entries = Object.entries(map).slice(-14);
  return entries.map(([date, count]) => ({ date, count, resolved: Math.floor(count * 0.6) }));
}
function generateCategoryData(complaints) {
  const map = {};
  complaints.forEach(c => {
    const cat = c.category || 'other';
    map[cat] = (map[cat] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}
export default function DashboardPage() {
  const { complaints, rankedComplaints, stats, subscribeAll } = useComplaintStore();
  const { role } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => {
    const unsub = subscribeAll();
    return unsub;
  }, []);
  const trendData = generateTrendData(complaints);
  const catData = generateCategoryData(complaints);
  const topPriority = rankedComplaints.slice(0, 5);
  const departmentPerf = [
    { dept: 'Roads', assigned: 24, resolved: 18, rate: 75 },
    { dept: 'Water', assigned: 31, resolved: 28, rate: 90 },
    { dept: 'Power', assigned: 19, resolved: 14, rate: 74 },
    { dept: 'Health', assigned: 12, resolved: 11, rate: 92 },
    { dept: 'Sanitation', assigned: 27, resolved: 20, rate: 74 },
  ];
  return (
    <>
      <TopNavbar
        title="City Dashboard"
        subtitle={`Live overview · ${complaints.length} total complaints`}
        actions={
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/complaints')}>
            View All →
          </button>
        }
      />
      <div className="page-content animate-fadeIn">
        {}
        <div className="kpi-grid">
          <KpiCard label="Total Complaints" value={stats.total} icon="📋" color="var(--accent)" iconBg="var(--accent-glow)" change={12} changeType="up" />
          <KpiCard label="Pending" value={stats.pending} icon="⏳" color="var(--yellow)" iconBg="rgba(245,158,11,0.1)" change={3} changeType="up" />
          <KpiCard label="In Progress" value={stats.inProgress} icon="🔄" color="var(--blue)" iconBg="rgba(59,130,246,0.1)" />
          <KpiCard label="Resolved" value={stats.resolved} icon="✅" color="var(--green)" iconBg="rgba(16,185,129,0.1)" change={8} changeType="up" />
          <KpiCard label="Critical" value={stats.critical} icon="🔴" color="var(--red)" iconBg="rgba(239,68,68,0.1)" />
        </div>
        {}
        <div className="grid-2 mb-6">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Complaint Trend</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last 14 days</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#5a5a70" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#5a5a70" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#16161e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="url(#grad1)" strokeWidth={2} name="Submitted" />
                  <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="url(#grad2)" strokeWidth={2} name="Resolved" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Category Distribution</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={catData.length ? catData : [{ name: 'No data', value: 1 }]} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {(catData.length ? catData : [{ name: 'No data', value: 1 }]).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#16161e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        {}
        <div className="grid-2 mb-6">
          {}
          <div className="card">
            <div className="section-header">
              <div>
                <div className="section-title">🔥 Priority Queue</div>
                <div className="section-subtitle">Highest priority issues requiring attention</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/priority')}>View All</button>
            </div>
            {topPriority.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <div className="empty-title">No complaints yet</div>
                <div className="empty-desc">Complaints will appear here as citizens submit them</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {topPriority.map((c, i) => (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/complaints/${c.id}`)}
                    style={{
                      background: 'var(--bg-elevated)',
                      borderRadius: 10,
                      padding: '12px 14px',
                      cursor: 'pointer',
                      border: '1px solid var(--border)',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-muted)', minWidth: 20 }}>#{i+1}</span>
                        <CategoryChip category={c.category} />
                        <DuplicateBadge count={c.reportCount} />
                      </div>
                      <PriorityBadge complaint={c} />
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>{c.title || 'Untitled'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      📍 {c.location?.area || c.location?.address || 'Location pending'} · {timeAgo(c.createdAt)}
                    </div>
                    <ScoreBar score={c.priorityScore || 0} />
                  </div>
                ))}
              </div>
            )}
          </div>
          {}
          <div className="card">
            <div className="section-header">
              <div>
                <div className="section-title">🏢 Department Performance</div>
                <div className="section-subtitle">Resolution efficiency by team</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {departmentPerf.map(dept => (
                <div key={dept.dept}>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{dept.dept}</span>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{dept.resolved}/{dept.assigned}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: dept.rate >= 85 ? 'var(--green)' : dept.rate >= 70 ? 'var(--yellow)' : 'var(--red)' }}>
                        {dept.rate}%
                      </span>
                    </div>
                  </div>
                  <div className="score-bar">
                    <div
                      className="score-fill"
                      style={{
                        width: `${dept.rate}%`,
                        background: dept.rate >= 85 ? 'var(--green)' : dept.rate >= 70 ? 'var(--yellow)' : 'var(--red)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="divider" />
            <div className="section-header mb-0">
              <div className="section-title">📊 Volume by Category</div>
            </div>
            <div className="chart-container" style={{ height: 180, marginTop: 12 }}>
              <ResponsiveContainer>
                <BarChart data={catData.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#5a5a70" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#5a5a70" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#16161e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        {}
        <div className="card">
          <div className="section-header">
            <div className="section-title">⚡ Live Activity Feed</div>
          </div>
          {rankedComplaints.slice(0, 8).length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <div className="empty-icon">📡</div>
              <div className="empty-title">Waiting for complaints</div>
            </div>
          ) : (
            <div>
              {rankedComplaints.slice(0, 8).map(c => (
                <div
                  key={c.id}
                  className="feed-item"
                  onClick={() => navigate(`/complaints/${c.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="feed-dot" style={{
                    background: c.priorityScore >= 75 ? 'var(--red)' : c.priorityScore >= 55 ? 'var(--orange)' : 'var(--accent)'
                  }} />
                  <div className="feed-content">
                    <div className="feed-text">
                      New <strong>{c.category}</strong> complaint: "{c.title || 'Report submitted'}"
                      {' '}<StatusBadge status={c.status} />
                    </div>
                    <div className="feed-time">
                      {c.location?.area || 'Location unknown'} · {timeAgo(c.createdAt)}
                    </div>
                  </div>
                  <PriorityBadge complaint={c} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
