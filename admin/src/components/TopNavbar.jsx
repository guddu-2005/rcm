import { Bell, Search, RefreshCw, Download } from 'lucide-react';
import useAuthStore from '../stores/authStore';

export default function TopNavbar({ title, subtitle, actions }) {
  const { profile, role } = useAuthStore();

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <div>
          <div className="page-title">{title}</div>
          {subtitle && <div className="page-subtitle">{subtitle}</div>}
        </div>
      </div>
      <div className="navbar-right">
        {actions}
        <button className="notif-btn">
          <Bell size={16} />
          <span className="notif-dot" />
        </button>
        <div style={{
          background: 'linear-gradient(135deg, var(--accent), var(--blue))',
          width: 34,
          height: 34,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
        }}>
          {(profile?.name || profile?.email || 'A').slice(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
