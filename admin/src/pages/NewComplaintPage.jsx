import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import useAuthStore from '../stores/authStore';
import TopNavbar from '../components/TopNavbar';
import { classifyComplaint, detectSeverity } from '../intelligence/priorityEngine';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['water', 'electricity', 'road', 'health', 'sanitation', 'fire', 'flood', 'crime', 'gas', 'other'];
const AREAS = ['Sector 1', 'Sector 2', 'Old Town', 'Market Area', 'Station Road', 'Ashok Nagar', 'Gandhi Nagar', 'Lake Area', 'Industrial Zone', 'Hospital Zone', 'Bus Stand', 'Central Park'];

export default function NewComplaintPage() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: '', severity: '', area: '',
    reporterName: '', reporterPhone: '', populationImpact: 5,
  });
  const [loading, setLoading] = useState(false);

  const update = (key, val) => {
    const updated = { ...form, [key]: val };
    // Auto-classify
    if (key === 'title' || key === 'description') {
      const text = (updated.title + ' ' + updated.description);
      if (text.trim().length > 5) {
        updated.category = updated.category || classifyComplaint(text);
        updated.severity = updated.severity || detectSeverity(text);
      }
    }
    setForm(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.area) { toast.error('Title and area are required'); return; }
    setLoading(true);
    try {
      const ticketId = 'ADM-' + Date.now().toString(36).toUpperCase();
      const text = form.title + ' ' + form.description;
      const category = form.category || classifyComplaint(text);
      const severity = form.severity || detectSeverity(text);
      await addDoc(collection(db, 'complaints'), {
        ...form,
        ticketId, category, severity,
        source: 'admin',
        status: 'pending',
        reportCount: 1,
        location: { area: form.area, address: form.area },
        createdBy: profile?.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success(`Complaint ${ticketId} created!`);
      navigate('/complaints');
    } catch (err) {
      toast.error('Failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopNavbar title="Add Complaint" subtitle="Manual entry from admin panel" />
      <div className="page-content animate-fadeIn">
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="card">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">Title *</label>
                  <input className="input" value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Water pipeline burst near school" required />
                </div>
                <div className="input-group">
                  <label className="input-label">Reporter Name</label>
                  <input className="input" value={form.reporterName} onChange={e => update('reporterName', e.target.value)} placeholder="Citizen name" />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea
                  className="input"
                  rows={4}
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  placeholder="Detailed description of the issue..."
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">
                    Category
                    {form.category && <span style={{ color: 'var(--accent-light)', marginLeft: 6 }}>🤖 Auto-detected</span>}
                  </label>
                  <select className="select" value={form.category} onChange={e => update('category', e.target.value)} required>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">
                    Severity
                    {form.severity && <span style={{ color: 'var(--accent-light)', marginLeft: 6 }}>🤖 Auto-detected</span>}
                  </label>
                  <select className="select" value={form.severity} onChange={e => update('severity', e.target.value)}>
                    <option value="">Auto-detect</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">Area / Location *</label>
                  <select className="select" value={form.area} onChange={e => update('area', e.target.value)} required>
                    <option value="">Select area</option>
                    {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Reporter Phone</label>
                  <input className="input" value={form.reporterPhone} onChange={e => update('reporterPhone', e.target.value)} placeholder="+91 XXXXXXXX" />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Population Impact (households): {form.populationImpact}</label>
                <input
                  type="range" min={1} max={100} value={form.populationImpact}
                  onChange={e => update('populationImpact', Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent)' }}
                />
              </div>

              {/* AI Preview */}
              {(form.category || form.severity) && (
                <div className="alert alert-info">
                  <span>🤖</span>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>AI Classification Preview</div>
                    <div style={{ fontSize: 13 }}>
                      Category: <strong>{form.category}</strong> · Severity: <strong>{form.severity}</strong>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-secondary flex-1" onClick={() => navigate('/complaints')}>Cancel</button>
                <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
                  {loading ? 'Submitting...' : '✓ Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
