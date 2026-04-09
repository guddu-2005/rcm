import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import useComplaintStore from '../stores/complaintStore';
import useAuthStore from '../stores/authStore';
import TopNavbar from '../components/TopNavbar';
import {
  PriorityBadge, StatusBadge, CategoryChip, DuplicateBadge,
  ScoreBar, ComplaintTimeline, MediaGallery, formatDate, timeAgo
} from '../components/ComplaintComponents';
import { calculatePriorityScore } from '../intelligence/priorityEngine';
import { ArrowLeft, User, Calendar, MapPin, Phone, CheckCircle, AlertTriangle, Clock, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
const STATUSES = ['submitted', 'underReview', 'assigned', 'inProgress', 'escalated', 'resolved'];
export default function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateStatus, assignComplaint, escalateComplaint } = useComplaintStore();
  const { profile } = useAuthStore();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [assignee, setAssignee] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);
  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const snap = await getDoc(doc(db, 'complaints', id));
        if (snap.exists()) setComplaint({ id: snap.id, ...snap.data() });
      } catch (err) {
        toast.error('Failed to load complaint');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);
  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await updateStatus(id, newStatus, statusNote, profile?.name || profile?.email);
      setComplaint(prev => ({ ...prev, status: newStatus }));
      setStatusNote('');
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdating(false);
    }
  };
  const handleAssign = async () => {
    if (!assignee) { toast.error('Enter assignee name'); return; }
    setUpdating(true);
    try {
      await assignComplaint(id, assignee, deadline, notes);
      setComplaint(prev => ({ ...prev, assignedTo: assignee, deadline, assignmentNotes: notes, status: 'assigned' }));
      toast.success('Complaint assigned!');
    } catch {
      toast.error('Assignment failed');
    } finally {
      setUpdating(false);
    }
  };
  const handleEscalate = async () => {
    if (!confirm('Escalate this complaint?')) return;
    try {
      await escalateComplaint(id, 'Manually escalated by admin');
      setComplaint(prev => ({ ...prev, status: 'escalated' }));
      toast.success('Complaint escalated');
    } catch { toast.error('Escalation failed'); }
  };
  if (loading) return (
    <div className="loading-screen"><div className="spinner" /></div>
  );
  if (!complaint) return (
    <div className="page-content" style={{ textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: 48 }}>❌</div>
      <h2 style={{ margin: '16px 0 8px' }}>Complaint Not Found</h2>
      <button className="btn btn-secondary" onClick={() => navigate('/complaints')}>← Back</button>
    </div>
  );
  const score = calculatePriorityScore(complaint);
  return (
    <>
      <TopNavbar
        title="Complaint Detail"
        subtitle={complaint.ticketId || complaint.id}
        actions={
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/complaints')}>
            <ArrowLeft size={14} /> Back
          </button>
        }
      />
      <div className="page-content animate-fadeIn">
        {}
        <div className="card mb-4">
          <div className="flex items-center justify-between flex-wrap" style={{ gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <code style={{ fontSize: 13, color: 'var(--accent-light)', background: 'var(--accent-glow)', padding: '3px 10px', borderRadius: 6 }}>
                  {complaint.ticketId || complaint.id}
                </code>
                <CategoryChip category={complaint.category} />
                <DuplicateBadge count={complaint.reportCount} />
                <StatusBadge status={complaint.status} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{complaint.title || 'Untitled'}</h2>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                📍 {complaint.location?.area || complaint.location?.address || 'Location unknown'} ·
                🕐 {formatDate(complaint.createdAt)}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <PriorityBadge complaint={complaint} />
              <div style={{ width: 120 }}><ScoreBar score={score} /></div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Priority Score</div>
            </div>
          </div>
        </div>
        <div className="grid-2" style={{ alignItems: 'start' }}>
          {}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {}
            <div className="tabs">
              {['details', 'media', 'timeline', 'location'].map(tab => (
                <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            {activeTab === 'details' && (
              <div className="card">
                <div className="card-header"><span className="card-title">Complaint Description</span></div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  {complaint.description || 'No description provided.'}
                </p>
                <div className="divider" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Submitted By', value: complaint.userName || complaint.userId?.slice(0, 8) || 'Anonymous', icon: <User size={13} /> },
                    { label: 'Phone', value: complaint.userPhone || '—', icon: <Phone size={13} /> },
                    { label: 'Source', value: complaint.source || 'mobile', icon: <FileText size={13} /> },
                    { label: 'Total Reports', value: complaint.reportCount || 1, icon: '👥' },
                    { label: 'Population Impact', value: `${complaint.populationImpact || 1} families`, icon: '🏘️' },
                    { label: 'Media Files', value: (complaint.media || []).length, icon: '📷' },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                        {item.icon} {item.label}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                {complaint.assignedTo && (
                  <>
                    <div className="divider" />
                    <div className="alert alert-info">
                      <User size={14} />
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>Assigned To: {complaint.assignedTo}</div>
                        {complaint.deadline && <div style={{ fontSize: 12 }}>Deadline: {complaint.deadline}</div>}
                        {complaint.assignmentNotes && <div style={{ fontSize: 12 }}>{complaint.assignmentNotes}</div>}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            {activeTab === 'media' && (
              <div className="card">
                <div className="card-header"><span className="card-title">Media Evidence</span></div>
                <MediaGallery media={complaint.media || complaint.images || []} />
                {complaint.audioUrl && (
                  <div style={{ marginTop: 16 }}>
                    <div className="card-title mb-2">🎙️ Voice Recording</div>
                    <audio controls style={{ width: '100%', filter: 'invert(1) hue-rotate(180deg)' }}>
                      <source src={complaint.audioUrl} />
                    </audio>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'timeline' && (
              <div className="card">
                <div className="card-header"><span className="card-title">Status Timeline</span></div>
                <ComplaintTimeline status={complaint.status || 'submitted'} timeline={complaint.timeline} />
              </div>
            )}
            {activeTab === 'location' && (
              <div className="card">
                <div className="card-header"><span className="card-title">Location Details</span></div>
                <div style={{ background: 'var(--bg-elevated)', padding: 14, borderRadius: 10, marginBottom: 12 }}>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Area: </span><strong>{complaint.location?.area || '—'}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Address: </span><strong>{complaint.location?.address || '—'}</strong></div>
                    {complaint.location?.lat && (
                      <div><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Coordinates: </span>
                        <code style={{ fontSize: 12 }}>{complaint.location.lat.toFixed(5)}, {complaint.location.lng.toFixed(5)}</code>
                      </div>
                    )}
                  </div>
                </div>
                {complaint.location?.lat ? (
                  <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <iframe
                      src={`https://maps.google.com/maps?q=${complaint.location.lat},${complaint.location.lng}&z=16&output=embed`}
                      width="100%"
                      height="220"
                      style={{ border: 'none', display: 'block' }}
                      title="Complaint Location"
                    />
                  </div>
                ) : (
                  <div className="map-placeholder">📍 Location coordinates not available</div>
                )}
              </div>
            )}
          </div>
          {}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {}
            <div className="card">
              <div className="card-header"><span className="card-title">Update Status</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                {STATUSES.map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatusUpdate(s)}
                    disabled={updating || s === complaint.status}
                    className={`btn btn-sm ${s === complaint.status ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'space-between' }}
                  >
                    <span>{s === complaint.status ? '✓ ' : ''}{s}</span>
                    {s === 'resolved' && <span>✅</span>}
                    {s === 'escalated' && <span>⚠️</span>}
                  </button>
                ))}
              </div>
              <div className="input-group">
                <label className="input-label">Status Note (Optional)</label>
                <textarea
                  className="input"
                  rows={2}
                  value={statusNote}
                  onChange={e => setStatusNote(e.target.value)}
                  placeholder="Add a note for this status change..."
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
            {}
            <div className="card">
              <div className="card-header"><span className="card-title">Task Assignment</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="input-group">
                  <label className="input-label">Assign To Field Worker</label>
                  <input className="input" value={assignee} onChange={e => setAssignee(e.target.value)} placeholder="Worker name or ID" />
                </div>
                <div className="input-group">
                  <label className="input-label">Deadline</label>
                  <input type="date" className="input" value={deadline} onChange={e => setDeadline(e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Assignment Notes</label>
                  <textarea className="input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Instructions, tools needed, etc." style={{ resize: 'vertical' }} />
                </div>
                <button className="btn btn-primary" onClick={handleAssign} disabled={updating} style={{ justifyContent: 'center' }}>
                  {updating ? '...' : '👤 Assign Task'}
                </button>
                <button className="btn btn-danger" onClick={handleEscalate} style={{ justifyContent: 'center' }}>
                  ⚠️ Escalate to Supervisor
                </button>
              </div>
            </div>
            {}
            {complaint.reportCount > 1 && (
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Duplicate Cluster</span>
                  <DuplicateBadge count={complaint.reportCount} />
                </div>
                <div className="alert alert-warning">
                  <span>⚠️</span>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Merged Complaint</div>
                    <div style={{ fontSize: 12 }}>{complaint.reportCount} citizens have reported the same issue at this location. Resolving this will notify all {complaint.reportCount} reporters.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
