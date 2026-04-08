import { useState } from 'react';
import useStore from '../store';
import toast from 'react-hot-toast';

export default function ProfileScreen() {
  const { user, profile, logout, updateProfile: saveProfile } = useStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);

  const initial = (profile?.name || user?.email || 'C').charAt(0).toUpperCase();

  const save = async () => {
    setSaving(true);
    await saveProfile({ name, phone });
    setEditing(false);
    setSaving(false);
    toast.success('Profile updated!');
  };

  const handleLogout = async () => {
    if (confirm('Sign out?')) {
      await logout();
    }
  };

  return (
    <div className="screen">
      <div className="topbar">
        <div className="topbar-title">Profile</div>
      </div>
      <div className="page">
        {/* Avatar */}
        <div style={{ textAlign: 'center', padding: '20px 0 24px' }}>
          <div className="profile-avatar">{initial}</div>
          <div style={{ fontWeight: 800, fontSize: 20 }}>{profile?.name || user?.displayName || 'Citizen'}</div>
          <div style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>{user?.email}</div>
          {profile?.phone && <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 2 }}>📱 {profile.phone}</div>}
        </div>

        {/* Edit Profile */}
        {!editing ? (
          <button className="btn btn-outline" onClick={() => setEditing(true)} style={{ marginBottom: 20 }}>
            ✏️ Edit Profile
          </button>
        ) : (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setEditing(false)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving} style={{ flex: 1 }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {[
            { icon: '📧', label: 'Email', value: user?.email },
            { icon: '📱', label: 'Mobile', value: profile?.phone || 'Not set' },
            { icon: '📅', label: 'Member Since', value: profile?.createdAt?.seconds ? new Date(profile.createdAt.seconds * 1000).toLocaleDateString('en-IN') : 'Today' },
          ].map(item => (
            <div key={item.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 14 }}>❓ FAQ</div>
          {[
            { q: 'How long does resolution take?', a: 'Critical: 24hrs · High: 3 days · Others: 7 days' },
            { q: 'What happens if duplicate found?', a: 'Your complaint merges with the existing one, increasing its priority score.' },
            { q: 'Can I edit my complaint?', a: 'You cannot edit after submission, but you can add a comment via team.' },
          ].map((faq, i) => (
            <div key={i} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', paddingTop: i > 0 ? 12 : 0, marginTop: i > 0 ? 12 : 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Q: {faq.q}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>A: {faq.a}</div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{ width: '100%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: 14, color: '#f87171', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
}
