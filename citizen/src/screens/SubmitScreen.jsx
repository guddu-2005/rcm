import { useState, useRef, useEffect } from 'react';
import { addDoc, collection, serverTimestamp, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import useStore from '../store';
import { autoClassify, autoSeverity, CATEGORIES, findDuplicates, generateTicketId } from '../lib/intelligence';
import { Camera, Mic, MapPin, ChevronRight, X, Check, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = ['category', 'details', 'media', 'location', 'review'];
const AREAS = ['Sector 1', 'Sector 2', 'Old Town', 'Market Area', 'Station Road', 'Ashok Nagar', 'Gandhi Nagar', 'Lake Area', 'Hospital Zone', 'Bus Stand', 'Civil Lines', 'New Extension'];

export default function SubmitScreen({ onSuccess, onBack }) {
  const { user, profile } = useStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '', description: '', category: '', severity: '',
    location: null, media: [], audioUrl: null,
  });
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showDupWarning, setShowDupWarning] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const fileInput = useRef();

  // Auto-classify as user types
  const handleTextChange = (key, val) => {
    const updated = { ...form, [key]: val };
    const text = updated.title + ' ' + updated.description;
    if (text.trim().length > 8) {
      updated.category = updated.category || autoClassify(text);
      updated.severity = updated.severity || autoSeverity(text);
    }
    setForm(updated);
  };

  // GPS location
  const getLocation = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        // Reverse geocode (use area list as fallback)
        const area = AREAS[Math.floor(Math.random() * AREAS.length)]; // Simulated
        setForm(f => ({ ...f, location: { lat, lng, area, address: `${area}, City` } }));
        setGpsLoading(false);
        toast.success('Location captured! 📍');
      },
      () => {
        // Fallback: manual
        setGpsLoading(false);
        toast.error('GPS unavailable. Select area manually.');
      }
    );
  };

  // Image upload
  const handleImages = async (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    const urls = [];
    for (const file of files) {
      const r = ref(storage, `complaints/temp/${Date.now()}_${file.name}`);
      const snap = await uploadBytes(r, file);
      const url = await getDownloadURL(snap.ref);
      urls.push(url);
    }
    setForm(f => ({ ...f, media: [...f.media, ...urls].slice(0, 5) }));
    toast.success(`${files.length} photo(s) added`);
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];
      mediaRecorder.current.ondataavailable = e => chunks.current.push(e.data);
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };
      mediaRecorder.current.start();
      setRecording(true);
    } catch { toast.error('Microphone not available'); }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
    toast.success('Voice recorded!');
  };

  // Check duplicates
  const checkDuplicates = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'complaints'), orderBy('createdAt', 'desc'), limit(50)));
      const existing = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const dups = findDuplicates(form, existing);
      if (dups.length > 0) {
        setDuplicates(dups);
        setShowDupWarning(true);
        return true;
      }
    } catch {}
    return false;
  };

  const handleNext = async () => {
    if (step === STEPS.indexOf('details')) {
      if (!form.title) { toast.error('Please enter a title'); return; }
    }
    if (step === STEPS.indexOf('location')) {
      if (!form.location) { toast.error('Location required'); return; }
      // Check duplicates before review
      const hasDup = await checkDuplicates();
      if (hasDup) return;
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const submitComplaint = async (supportExisting = false) => {
    if (supportExisting && duplicates[0]) {
      // Increment report count on existing
      try {
        const { doc, updateDoc, increment } = await import('firebase/firestore');
        await updateDoc(doc(db, 'complaints', duplicates[0].id), {
          reportCount: increment(1),
          updatedAt: serverTimestamp(),
        });
        onSuccess({ ticketId: duplicates[0].ticketId, supported: true });
        return;
      } catch { toast.error('Failed to support complaint'); return; }
    }

    setSubmitting(true);
    setShowDupWarning(false);
    try {
      let audioUrl = null;
      if (audioBlob) {
        const r = ref(storage, `complaints/audio/${Date.now()}.webm`);
        const snap = await uploadBytes(r, audioBlob);
        audioUrl = await getDownloadURL(snap.ref);
      }

      const ticketId = generateTicketId();
      const category = form.category || autoClassify(form.title + ' ' + form.description);
      const severity = form.severity || autoSeverity(form.title + ' ' + form.description, form.media.length);

      const data = {
        ticketId,
        title: form.title,
        description: form.description,
        category,
        severity,
        location: form.location,
        media: form.media,
        audioUrl,
        status: 'submitted',
        reportCount: 1,
        upvotes: 0,
        source: 'mobile',
        userId: user.uid,
        userName: profile?.name || user?.displayName || 'Citizen',
        userPhone: profile?.phone || '',
        populationImpact: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'complaints'), data);
      onSuccess({ ticketId, data });
    } catch (err) {
      toast.error('Submission failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="topbar">
        <button className="topbar-back" onClick={onBack}>←</button>
        <div style={{ flex: 1 }}>
          <div className="topbar-title">Submit Complaint</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Step {step + 1} of {STEPS.length}: {STEPS[step]}</div>
        </div>
      </div>
      <div style={{ padding: '8px 16px 0' }}>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="page" style={{ paddingTop: 20 }}>
        {/* STEP 0: Category */}
        {step === 0 && (
          <div className="fade-up">
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Select Category</h2>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 20 }}>What type of issue are you reporting?</p>
            <div className="cat-grid">
              {CATEGORIES.map(c => (
                <div
                  key={c.id}
                  className={`cat-item ${form.category === c.id ? 'selected' : ''}`}
                  onClick={() => setForm(f => ({ ...f, category: c.id }))}
                >
                  <span className="cat-icon">{c.icon}</span>
                  {c.label}
                </div>
              ))}
            </div>
            <button
              className="btn btn-primary"
              style={{ marginTop: 24 }}
              disabled={!form.category}
              onClick={() => setStep(1)}
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 1: Details */}
        {step === 1 && (
          <div className="fade-up">
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Describe the Issue</h2>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 20 }}>Provide details so we can act quickly</p>

            <div className="form-group">
              <label className="form-label">Issue Title *</label>
              <input
                className="form-input"
                value={form.title}
                onChange={e => handleTextChange('title', e.target.value)}
                placeholder="e.g. Water pipe burst near school"
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input form-textarea"
                value={form.description}
                onChange={e => handleTextChange('description', e.target.value)}
                placeholder="More details about location, duration, impact..."
              />
            </div>

            {/* AI Suggestion */}
            {(form.category || form.severity) && (
              <div className="suggest-box mb-3">
                🤖 AI detected: <strong>{form.category}</strong> · Severity: <strong>{form.severity}</strong>
              </div>
            )}

            {/* Voice input */}
            <div className="form-group">
              <label className="form-label">Or Record Voice</label>
              <div className="voice-recorder">
                <button
                  className={`record-btn ${recording ? 'recording' : 'idle'}`}
                  onClick={recording ? stopRecording : startRecording}
                >
                  {recording ? '⏹' : '🎙️'}
                </button>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                  {recording ? '⏺ Recording... tap to stop' : audioBlob ? '✅ Voice recorded' : 'Tap to record complaint'}
                </div>
                {audioBlob && (
                  <audio controls style={{ width: '100%' }}>
                    <source src={URL.createObjectURL(audioBlob)} />
                  </audio>
                )}
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleNext} disabled={!form.title}>Continue →</button>
          </div>
        )}

        {/* STEP 2: Media */}
        {step === 2 && (
          <div className="fade-up">
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Add Photos</h2>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 20 }}>Photos strengthen your complaint (up to 5)</p>

            <div className="media-grid">
              {form.media.map((url, i) => (
                <div key={i} className="media-item">
                  <img src={url} alt="" />
                  <button
                    className="media-remove"
                    onClick={() => setForm(f => ({ ...f, media: f.media.filter((_, j) => j !== i) }))}
                  >×</button>
                </div>
              ))}
              {form.media.length < 5 && (
                <div className="media-add" onClick={() => fileInput.current?.click()}>
                  <span style={{ fontSize: 28 }}>📷</span>
                  <span>Add Photo</span>
                </div>
              )}
            </div>

            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleImages}
            />

            {form.media.length === 0 && (
              <div className="alert alert-info mt-4">
                <span>💡</span>
                <span>Photos are optional but help get your complaint resolved 3x faster!</span>
              </div>
            )}

            <button className="btn btn-primary mt-4" onClick={handleNext}>
              {form.media.length > 0 ? `Continue with ${form.media.length} photo(s) →` : 'Skip & Continue →'}
            </button>
          </div>
        )}

        {/* STEP 3: Location */}
        {step === 3 && (
          <div className="fade-up">
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Location</h2>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 20 }}>Where is the issue located?</p>

            <button
              className="btn btn-outline"
              onClick={getLocation}
              disabled={gpsLoading}
              style={{ marginBottom: 16 }}
            >
              {gpsLoading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : '📍'}
              {gpsLoading ? ' Detecting...' : ' Use My GPS Location'}
            </button>

            {form.location && (
              <div className="location-card mb-4">
                <div>
                  <div className="location-label">Detected Location</div>
                  <div className="location-value">📍 {form.location.area}</div>
                </div>
                {form.location.lat && (
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'monospace' }}>
                    {form.location.lat.toFixed(4)}, {form.location.lng.toFixed(4)}
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Or Select Area Manually</label>
              <select
                className="form-input form-select"
                value={form.location?.area || ''}
                onChange={e => setForm(f => ({ ...f, location: { area: e.target.value, address: e.target.value, lat: 20.5937, lng: 78.9629 } }))}
              >
                <option value="">Select area...</option>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleNext}
              disabled={!form.location}
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 4: Review */}
        {step === 4 && (
          <div className="fade-up">
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Review & Submit</h2>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 20 }}>Confirm your complaint details</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Category', value: `${CATEGORIES.find(c => c.id === form.category)?.icon} ${form.category}` },
                { label: 'Issue', value: form.title },
                { label: 'Location', value: `📍 ${form.location?.area}` },
                { label: 'Photos', value: `${form.media.length} attached` },
                { label: 'Severity', value: form.severity || 'Auto-detect' },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--bg3)', padding: '12px 14px', borderRadius: 10, display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{item.value}</span>
                </div>
              ))}
            </div>

            <button
              className="btn btn-primary"
              onClick={() => submitComplaint(false)}
              disabled={submitting}
              style={{ marginTop: 24 }}
            >
              {submitting ? <><span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Submitting...</> : '✅ Submit Complaint'}
            </button>
          </div>
        )}

        {/* Duplicate Warning Modal */}
        {showDupWarning && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200,
            display: 'flex', alignItems: 'flex-end', padding: 0,
          }}>
            <div style={{
              width: '100%', maxWidth: 480, margin: '0 auto',
              background: 'var(--card)', borderRadius: '24px 24px 0 0',
              padding: '24px 20px', animation: 'fadeUp 0.3s ease',
            }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🔁</div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>Similar Issue Found!</div>
                <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 6, lineHeight: 1.6 }}>
                  This issue is already reported by <strong>{duplicates[0]?.reportCount || 1} citizen(s)</strong> in your area.
                  Supporting the existing complaint increases its priority!
                </div>
              </div>

              <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{duplicates[0]?.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>
                  📍 {duplicates[0]?.location?.area} · {duplicates[0]?.reportCount || 1} reports
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button className="btn btn-primary" onClick={() => submitComplaint(true)}>
                  👍 Support Existing Report (Recommended)
                </button>
                <button className="btn btn-secondary" onClick={() => { setShowDupWarning(false); setStep(4); }}>
                  Submit as New Complaint
                </button>
                <button onClick={() => setShowDupWarning(false)} style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: 13, cursor: 'pointer', padding: 8 }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
