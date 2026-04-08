import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = [
  { email: 'superadmin@grievanceiq.ai', password: 'Admin@123', role: 'superAdmin', name: 'Super Admin' },
  { email: 'roads@grievanceiq.ai', password: 'Dept@123', role: 'department', name: 'Roads Dept', dept: 'road' },
  { email: 'water@grievanceiq.ai', password: 'Dept@123', role: 'department', name: 'Water Dept', dept: 'water' },
  { email: 'power@grievanceiq.ai', password: 'Dept@123', role: 'department', name: 'Electricity Dept', dept: 'electricity' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // Ensure user doc exists
      const ref = doc(db, 'adminUsers', cred.user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        const demo = DEMO_ACCOUNTS.find(a => a.email === email);
        if (demo) {
          await setDoc(ref, {
            email,
            name: demo.name,
            role: demo.role,
            department: demo.dept || null,
            createdAt: serverTimestamp(),
          });
        }
      }
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Invalid credentials. Try demo accounts below.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card animate-slideUp">
        <div className="login-header">
          <div className="login-icon">🏛️</div>
          <h1 className="login-title">GrievanceIQ</h1>
          <p className="login-desc">Smart City Grievance Intelligence Platform</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@grievanceiq.ai"
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              id="login-password"
              type="password"
              className="input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            id="btn-login"
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            style={{ justifyContent: 'center', marginTop: 4 }}
          >
            {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : '🔐 Sign In to Dashboard'}
          </button>
        </form>

        <div className="divider" />

        <div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            Demo Accounts
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                onClick={() => fillDemo(acc)}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  fontSize: 12.5,
                  transition: 'all 0.15s',
                  textAlign: 'left',
                }}
                className="hover-card"
              >
                <span style={{ fontSize: 16 }}>{acc.role === 'superAdmin' ? '⭐' : '🏢'}</span>
                <div>
                  <div style={{ fontWeight: 600 }}>{acc.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{acc.email}</div>
                </div>
                <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: 11 }}>Click to fill →</span>
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 16 }}>
          First-time login creates the admin account automatically
        </p>
      </div>
    </div>
  );
}
