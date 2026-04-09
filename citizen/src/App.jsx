import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import useStore from './store';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import SubmitScreen from './screens/SubmitScreen';
import TrackScreen from './screens/TrackScreen';
import ProfileScreen from './screens/ProfileScreen';
import TicketScreen from './screens/TicketScreen';
const TABS = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'track', icon: '📍', label: 'Track' },
  { id: 'profile', icon: '👤', label: 'Profile' },
];
export default function App() {
  const { user, loading, init, activeTab, setTab } = useStore();
  const [screen, setScreen] = useState('main');
  const [ticketData, setTicketData] = useState(null);
  const [viewingComplaint, setViewingComplaint] = useState(null);
  useEffect(() => {
    const unsub = init();
    return unsub;
  }, []);
  if (loading) {
    return (
      <div className="loading-screen">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏛️</div>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <div style={{ marginTop: 12, color: 'var(--text2)', fontSize: 14 }}>Loading GrievanceIQ...</div>
        </div>
      </div>
    );
  }
  if (!user) return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e1e2e', color: '#f1f1f5', border: '1px solid rgba(255,255,255,0.07)', fontSize: 14 } }} />
      <AuthScreen />
    </>
  );
  if (screen === 'submit') {
    return (
      <>
        <Toaster position="top-center" toastOptions={{ style: { background: '#1e1e2e', color: '#f1f1f5', border: '1px solid rgba(255,255,255,0.07)', fontSize: 14 } }} />
        <div className="app">
          <SubmitScreen
            onSuccess={(data) => { setTicketData(data); setScreen('ticket'); }}
            onBack={() => setScreen('main')}
          />
        </div>
      </>
    );
  }
  if (screen === 'ticket') {
    return (
      <>
        <Toaster position="top-center" toastOptions={{ style: { background: '#1e1e2e', color: '#f1f1f5', border: '1px solid rgba(255,255,255,0.07)', fontSize: 14 } }} />
        <div className="app">
          <TicketScreen
            ticketId={ticketData?.ticketId}
            supported={ticketData?.supported}
            onDone={() => { setScreen('main'); setTab('home'); setTicketData(null); }}
          />
        </div>
      </>
    );
  }
  return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e1e2e', color: '#f1f1f5', border: '1px solid rgba(255,255,255,0.07)', fontSize: 14 } }} />
      <div className="app">
        {}
        {activeTab === 'home' && (
          <HomeScreen
            onNewComplaint={() => setScreen('submit')}
            onViewComplaint={(c) => { setViewingComplaint(c); setTab('track'); }}
          />
        )}
        {activeTab === 'track' && <TrackScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
        {}
        {activeTab === 'home' && (
          <button className="fab" onClick={() => setScreen('submit')} title="Submit New Complaint">
            +
          </button>
        )}
        {}
        <nav className="bottom-nav">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setTab(tab.id)}
            >
              <span style={{ fontSize: 22 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
