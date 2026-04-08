import { useState } from 'react';
import useStore from '../store';
import toast from 'react-hot-toast';

const DEMO_USERS = [
  { name: 'Rahul Sharma', phone: '9876543210', email: 'rahul@citizen.in', password: 'Pass@123' },
  { name: 'Priya Patel', phone: '9123456789', email: 'priya@citizen.in', password: 'Pass@123' },
];

export default function AuthScreen() {
  const [mode, setMode] = useState('login'); // login | register
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginEmail, registerEmail } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginEmail(email, password);
        toast.success('Welcome back! 👋');
      } else {
        if (!name || !phone) { toast.error('All fields required'); return; }
        await registerEmail(name, phone, email, password);
        toast.success('Account created! 🎉');
      }
    } catch (err) {
      toast.error(err.code === 'auth/user-not-found' ? 'User not found. Register first.' :
        err.code === 'auth/wrong-password' ? 'Wrong password' :
        err.code === 'auth/email-already-in-use' ? 'Email already registered' :
        'Login failed. Try demo accounts.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', padding: 24 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '40px 0 32px' }}>
        <div style={{
          width: 72, height: 72,
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          borderRadius: 22,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, margin: '0 auto 16px',
          boxShadow: '0 8px 30px rgba(124,58,237,0.3)',
        }}>🏛️</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>GrievanceIQ</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Smart City Citizen Portal</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--bg3)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
        {['login', 'register'].map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
              background: mode === m ? 'var(--card)' : 'none',
              color: mode === m ? 'var(--text)' : 'var(--text2)',
              fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {m === 'login' ? 'Sign In' : 'Register'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {mode === 'register' && (
          <>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Mobile Number</label>
              <input className="form-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" required />
            </div>
          </>
        )}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Password</label>
          <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? <span className="spinner" style={{ width: 22, height: 22, borderWidth: 2 }} /> :
            mode === 'login' ? '🔐 Sign In' : '✨ Create Account'}
        </button>
      </form>

      <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="divider" style={{ flex: 1, margin: 0 }} />
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>DEMO ACCOUNTS</span>
        <div className="divider" style={{ flex: 1, margin: 0 }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {DEMO_USERS.map(u => (
          <button
            key={u.email}
            onClick={() => { setEmail(u.email); setPassword(u.password); setName(u.name); setPhone(u.phone); setMode('login'); }}
            style={{
              background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10,
              padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'pointer', color: 'var(--text)', fontSize: 13, transition: 'all 0.15s',
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
              {u.name[0]}
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontWeight: 600 }}>{u.name}</div>
              <div style={{ color: 'var(--text2)', fontSize: 12 }}>{u.phone}</div>
            </div>
            <span style={{ fontSize: 11, color: 'var(--accent2)' }}>Tap to fill →</span>
          </button>
        ))}
      </div>
    </div>
  );
}
