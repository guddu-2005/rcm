import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './stores/authStore';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ComplaintsPage from './pages/ComplaintsPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import PriorityQueuePage from './pages/PriorityQueuePage';
import AnalyticsPage from './pages/AnalyticsPage';
import HeatmapPage from './pages/HeatmapPage';
import DepartmentsPage from './pages/DepartmentsPage';
import NewComplaintPage from './pages/NewComplaintPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuthStore();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  );
}

export default function App() {
  const init = useAuthStore(s => s.init);

  useEffect(() => {
    const unsub = init();
    return unsub;
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            fontSize: 13.5,
          },
          duration: 3000,
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout><DashboardPage /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/complaints" element={
          <ProtectedRoute>
            <AppLayout><ComplaintsPage /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/complaints/new" element={
          <ProtectedRoute>
            <AppLayout><NewComplaintPage /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/complaints/:id" element={
          <ProtectedRoute>
            <AppLayout><ComplaintDetailPage /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/priority" element={
          <ProtectedRoute>
            <AppLayout><PriorityQueuePage /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/analytics" element={
          <ProtectedRoute>
            <AppLayout><AnalyticsPage /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/heatmap" element={
          <ProtectedRoute allowedRoles={['superAdmin', 'admin']}>
            <AppLayout><HeatmapPage /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/departments" element={
          <ProtectedRoute allowedRoles={['superAdmin', 'admin']}>
            <AppLayout><DepartmentsPage /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/audit" element={
          <ProtectedRoute allowedRoles={['superAdmin']}>
            <AppLayout>
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 48 }}>📋</div>
                <h2 style={{ margin: '16px 0 8px', color: 'var(--text-primary)' }}>Audit Log</h2>
                <p>Coming soon – Full audit trail of all admin actions</p>
              </div>
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['superAdmin']}>
            <AppLayout>
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 48 }}>👥</div>
                <h2 style={{ margin: '16px 0 8px', color: 'var(--text-primary)' }}>User Management</h2>
                <p>Manage citizen accounts and complaint history</p>
              </div>
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <AppLayout>
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 48 }}>⚙️</div>
                <h2 style={{ margin: '16px 0 8px', color: 'var(--text-primary)' }}>Settings</h2>
                <p>System configuration and preferences</p>
              </div>
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
