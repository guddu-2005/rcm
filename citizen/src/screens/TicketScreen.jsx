// Ticket success screen shown after successful submission
export default function TicketScreen({ ticketId, supported, onDone }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, borderRadius: 24,
        background: supported ? 'rgba(34,197,94,0.15)' : 'rgba(124,58,237,0.15)',
        border: supported ? '2px solid rgba(34,197,94,0.3)' : '2px solid rgba(124,58,237,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 40, margin: '0 auto 20px',
        animation: 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        {supported ? '👍' : '✅'}
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
        {supported ? 'Complaint Supported!' : 'Complaint Submitted!'}
      </h1>

      <p style={{ color: 'var(--text2)', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
        {supported
          ? 'You\'ve supported an existing complaint. This increases its priority score and speeds up resolution!'
          : 'Your complaint has been received and will be processed by our AI priority engine.'}
      </p>

      {ticketId && (
        <div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>Your Ticket ID</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--accent2)', background: 'rgba(124,58,237,0.1)', padding: '10px 24px', borderRadius: 12, border: '1px solid rgba(124,58,237,0.25)', display: 'inline-block', marginBottom: 24, letterSpacing: 2 }}>
            {ticketId}
          </div>
        </div>
      )}

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, width: '100%', marginBottom: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>What happens next?</div>
        {[
          { icon: '🤖', text: 'AI classifies & scores your complaint' },
          { icon: '🔢', text: 'Added to priority queue by score' },
          { icon: '👥', text: 'Assigned to department team' },
          { icon: '🔧', text: 'Field worker dispatched' },
          { icon: '📱', text: "You'll get notified at each step" },
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ fontSize: 18 }}>{step.icon}</span>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>{step.text}</span>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" onClick={onDone} style={{ width: '100%' }}>
        🏠 Back to Home
      </button>
    </div>
  );
}
