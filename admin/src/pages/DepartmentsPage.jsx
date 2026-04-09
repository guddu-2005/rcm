import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import TopNavbar from '../components/TopNavbar';
import toast from 'react-hot-toast';
const DEPARTMENTS = [
  { id: 'road', name: 'Roads & Infrastructure', icon: '🛣️', head: 'Dept. of Public Works' },
  { id: 'water', name: 'Water Supply', icon: '💧', head: 'Jal Board' },
  { id: 'electricity', name: 'Electricity', icon: '⚡', head: 'Power Distribution Corp' },
  { id: 'health', name: 'Health & Sanitation', icon: '🏥', head: 'Municipal Health Dept' },
  { id: 'fire', name: 'Fire & Emergency', icon: '🔥', head: 'Fire Brigade' },
  { id: 'crime', name: 'Police & Security', icon: '🚔', head: 'City Police' },
];
export default function DepartmentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dept, setDept] = useState('road');
  const [role, setRole] = useState('department');
  const [loading, setLoading] = useState(false);
  const createAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'adminUsers', cred.user.uid), {
        name, email, role, department: dept,
        createdAt: serverTimestamp(),
      });
      toast.success(`${name} created successfully!`);
      setName(''); setEmail(''); setPassword('');
      setShowForm(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <TopNavbar
        title="Departments"
        subtitle="Manage department accounts and permissions"
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
            + Add Department Admin
          </button>
        }
      />
      <div className="page-content animate-fadeIn">
        <div className="grid-auto mb-6">
          {DEPARTMENTS.map(d => (
            <div key={d.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 28, width: 48, height: 48, background: 'var(--bg-elevated)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {d.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.head}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="chip">ID: {d.id}</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => { setDept(d.id); setShowForm(true); }}>
                + Add Admin
              </button>
            </div>
          ))}
        </div>
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal animate-slideUp" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <span className="modal-title">Create Department Account</span>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
              </div>
              <div className="modal-body">
                <form onSubmit={createAdmin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="input-group">
                    <label className="input-label">Full Name</label>
                    <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Officer name" required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Email</label>
                    <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="dept@city.gov.in" required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Password</label>
                    <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required minLength={6} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Department</label>
                    <select className="select" value={dept} onChange={e => setDept(e.target.value)}>
                      {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.icon} {d.name}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Role</label>
                    <select className="select" value={role} onChange={e => setRole(e.target.value)}>
                      <option value="department">Department Admin</option>
                      <option value="superAdmin">Super Admin</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
                      {loading ? 'Creating...' : '✓ Create Account'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
