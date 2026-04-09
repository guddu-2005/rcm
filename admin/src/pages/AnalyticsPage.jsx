import { useEffect } from 'react';
import useComplaintStore from '../stores/complaintStore';
import TopNavbar from '../components/TopNavbar';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#f97316', '#06b6d4', '#ec4899'];
function buildResolutionTrend(complaints) {
  const days = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    days[key] = { date: key, submitted: 0, resolved: 0, pending: 0 };
  }
  complaints.forEach(c => {
    const d = c.createdAt?.seconds ? new Date(c.createdAt.seconds * 1000) : c.createdAt ? new Date(c.createdAt) : null;
    if (!d) return;
    const key = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    if (days[key]) {
      days[key].submitted++;
      if (c.status === 'resolved') days[key].resolved++;
      else days[key].pending++;
    }
  });
  return Object.values(days);
}
function buildCategoryBreakdown(complaints) {
  const map = {};
  complaints.forEach(c => {
    const cat = c.category || 'other';
    if (!map[cat]) map[cat] = { name: cat, submitted: 0, resolved: 0, pending: 0 };
    map[cat].submitted++;
    if (c.status === 'resolved') map[cat].resolved++;
    else map[cat].pending++;
  });
  return Object.values(map).sort((a, b) => b.submitted - a.submitted);
}
function buildSeverityData(complaints) {
  const map = { critical: 0, high: 0, medium: 0, low: 0 };
  complaints.forEach(c => {
    const s = c.severity || 'low';
    map[s] = (map[s] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}
function buildHourlyDistribution(complaints) {
  const hours = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, count: 0 }));
  complaints.forEach(c => {
    const d = c.createdAt?.seconds ? new Date(c.createdAt.seconds * 1000) : c.createdAt ? new Date(c.createdAt) : null;
    if (d) hours[d.getHours()].count++;
  });
  return hours;
}
export default function AnalyticsPage() {
  const { complaints, subscribeAll } = useComplaintStore();
  useEffect(() => {
    const unsub = subscribeAll();
    return unsub;
  }, []);
  const trendData = buildResolutionTrend(complaints);
  const catData = buildCategoryBreakdown(complaints);
  const severityData = buildSeverityData(complaints);
  const hourlyData = buildHourlyDistribution(complaints);
  const radarData = catData.slice(0, 6).map(c => ({ subject: c.name, A: c.submitted, B: c.resolved }));
  const resolutionRate = complaints.length > 0
    ? Math.round((complaints.filter(c => c.status === 'resolved').length / complaints.length) * 100)
    : 0;
  const avgScore = complaints.length > 0
    ? Math.round(complaints.reduce((acc, c) => acc + (c.priorityScore || 0), 0) / complaints.length)
    : 0;
  const tooltip = { contentStyle: { background: '#16161e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12 } };
  return (
    <>
      <TopNavbar title="Analytics & Insights" subtitle={`Trend analysis over ${complaints.length} complaints`} />
      <div className="page-content animate-fadeIn">
        {}
        <div className="kpi-grid mb-6">
          {[
            { label: 'Resolution Rate', value: `${resolutionRate}%`, icon: '✅', color: 'var(--green)' },
            { label: 'Avg Priority Score', value: avgScore, icon: '🎯', color: 'var(--accent)' },
            { label: 'Peak Hour', value: hourlyData.reduce((a, b) => a.count > b.count ? a : b, { count: 0 }).hour, icon: '⏰', color: 'var(--blue)' },
            { label: 'Top Category', value: catData[0]?.name || '—', icon: '📊', color: 'var(--yellow)' },
          ].map(kpi => (
            <div key={kpi.label} className="kpi-card" style={{ '--color': kpi.color }}>
              <div className="kpi-icon" style={{ background: 'var(--bg-elevated)', color: kpi.color }}>{kpi.icon}</div>
              <div className="kpi-value" style={{ fontSize: 22 }}>{kpi.value}</div>
              <div className="kpi-label">{kpi.label}</div>
            </div>
          ))}
        </div>
        {}
        <div className="card mb-6">
          <div className="card-header">
            <span className="card-title">30-Day Complaint Trend</span>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#5a5a70" tick={{ fontSize: 10 }} interval={4} />
                <YAxis stroke="#5a5a70" tick={{ fontSize: 11 }} />
                <Tooltip {...tooltip} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="submitted" stroke="#8b5cf6" fill="url(#g1)" strokeWidth={2} name="Submitted" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="url(#g2)" strokeWidth={2} name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid-2 mb-6">
          {}
          <div className="card">
            <div className="card-header"><span className="card-title">Category Breakdown</span></div>
            <div style={{ height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={catData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="#5a5a70" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" stroke="#5a5a70" tick={{ fontSize: 11 }} width={70} />
                  <Tooltip {...tooltip} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="submitted" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Total" />
                  <Bar dataKey="resolved" fill="#10b981" radius={[0, 4, 4, 0]} name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {}
          <div className="card">
            <div className="card-header"><span className="card-title">Severity Distribution</span></div>
            <div style={{ height: 250 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={severityData.filter(s => s.value > 0)} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value">
                    {severityData.map((_, i) => (
                      <Cell key={i} fill={['#ef4444', '#f97316', '#f59e0b', '#10b981'][i]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltip} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="grid-2 mb-6">
          {}
          <div className="card">
            <div className="card-header"><span className="card-title">Submission by Hour</span></div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="hour" stroke="#5a5a70" tick={{ fontSize: 9 }} interval={3} />
                  <YAxis stroke="#5a5a70" tick={{ fontSize: 11 }} />
                  <Tooltip {...tooltip} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {}
          <div className="card">
            <div className="card-header"><span className="card-title">Category Radar</span></div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer>
                <RadarChart data={radarData.length ? radarData : [{ subject: 'No data', A: 0, B: 0 }]}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#8b8ba0' }} />
                  <Radar name="Submitted" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                  <Radar name="Resolved" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip {...tooltip} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        {}
        <div className="card">
          <div className="card-header"><span className="card-title">Category Performance Table</span></div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total</th>
                <th>Resolved</th>
                <th>Pending</th>
                <th>Resolution Rate</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {catData.map(cat => {
                const rate = cat.submitted > 0 ? Math.round((cat.resolved / cat.submitted) * 100) : 0;
                return (
                  <tr key={cat.name}>
                    <td><span className={`chip chip-${cat.name}`}>{cat.name}</span></td>
                    <td style={{ fontWeight: 700 }}>{cat.submitted}</td>
                    <td style={{ color: 'var(--green)', fontWeight: 600 }}>{cat.resolved}</td>
                    <td style={{ color: 'var(--yellow)' }}>{cat.pending}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="score-bar" style={{ flex: 1, maxWidth: 80 }}>
                          <div className="score-fill" style={{ width: `${rate}%`, background: rate >= 80 ? 'var(--green)' : rate >= 60 ? 'var(--yellow)' : 'var(--red)' }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{rate}%</span>
                      </div>
                    </td>
                    <td style={{ color: rate >= 80 ? 'var(--green)' : rate >= 60 ? 'var(--yellow)' : 'var(--red)', fontSize: 13 }}>
                      {rate >= 80 ? '↑ Good' : rate >= 60 ? '→ Average' : '↓ Poor'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
