import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, AlertTriangle, Users, BarChart3,
  Settings, LogOut, Bell, Map, ClipboardList, Flame, Building2,
  Activity, ChevronRight, Shield
} from 'lucide-react';
import useAuthStore from '../stores/authStore';
import useComplaintStore from '../stores/complaintStore';
const superAdminNav = [
  { label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Priority Queue', icon: Flame, path: '/priority', badge: 'hot' },
  { label: 'All Complaints', icon: FileText, path: '/complaints' },
  { label: 'Heatmap', icon: Map, path: '/heatmap' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { label: 'Departments', icon: Building2, path: '/departments' },
  { label: 'Users', icon: Users, path: '/users' },
  { label: 'Audit Log', icon: Activity, path: '/audit' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];
const departmentNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'My Complaints', icon: ClipboardList, path: '/complaints' },
  { label: 'Priority Queue', icon: Flame, path: '/priority' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];
export default function Sidebar() {
  const { profile, role, logout } = useAuthStore();
  const { stats } = useComplaintStore();
  const navigate = useNavigate();
  const navItems = role === 'superAdmin' ? superAdminNav : departmentNav;
  const initials = (profile?.name || profile?.email || 'A').slice(0, 2).toUpperCase();
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🏛️</div>
        <div className="logo-text">
          <span className="logo-title">GrievanceIQ</span>
          <span className="logo-subtitle">Smart City Platform</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Navigation</span>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <item.icon size={16} />
            {item.label}
            {item.badge === 'hot' && stats.critical > 0 && (
              <span className="nav-badge">{stats.critical}</span>
            )}
          </NavLink>
        ))}
        {role === 'superAdmin' && (
          <>
            <span className="sidebar-section-label" style={{ marginTop: 12 }}>Quick Stats</span>
            <div style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', margin: '0 0 4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total</span>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{stats.total}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pending</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--yellow)' }}>{stats.pending}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Critical</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)' }}>{stats.critical}</span>
              </div>
            </div>
          </>
        )}
      </nav>
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name truncate">{profile?.name || profile?.email || 'Admin'}</div>
            <div className="user-role">{role === 'superAdmin' ? '⭐ Super Admin' : role === 'department' ? '🏢 Department' : '🛡️ Admin'}</div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
