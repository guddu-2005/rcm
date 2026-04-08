import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useComplaintStore from '../stores/complaintStore';
import TopNavbar from '../components/TopNavbar';
import {
  PriorityBadge, StatusBadge, CategoryChip, DuplicateBadge, ScoreBar, timeAgo
} from '../components/ComplaintComponents';
import { Search, Filter, Download, Plus, SlidersHorizontal } from 'lucide-react';
import { getPriorityLabel, calculatePriorityScore } from '../intelligence/priorityEngine';

const STATUSES = ['all', 'submitted', 'pending', 'underReview', 'assigned', 'inProgress', 'escalated', 'resolved'];
const CATEGORIES = ['all', 'water', 'electricity', 'road', 'health', 'sanitation', 'fire', 'flood', 'crime', 'other'];
const SEVERITIES = ['all', 'critical', 'high', 'medium', 'low'];

export default function ComplaintsPage() {
  const { rankedComplaints, loading, subscribeAll } = useComplaintStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  useEffect(() => {
    const unsub = subscribeAll();
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    let list = [...rankedComplaints];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        (c.title || '').toLowerCase().includes(q) ||
        (c.ticketId || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.location?.area || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') list = list.filter(c => c.status === statusFilter);
    if (categoryFilter !== 'all') list = list.filter(c => c.category === categoryFilter);
    if (severityFilter !== 'all') list = list.filter(c => {
      const score = calculatePriorityScore(c);
      const label = getPriorityLabel(score);
      return label === severityFilter;
    });
    if (sortBy === 'priority') list.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
    else if (sortBy === 'date') list.sort((a, b) => {
      const da = a.createdAt?.seconds ? a.createdAt.seconds : 0;
      const db2 = b.createdAt?.seconds ? b.createdAt.seconds : 0;
      return db2 - da;
    });
    else if (sortBy === 'reports') list.sort((a, b) => (b.reportCount || 1) - (a.reportCount || 1));
    return list;
  }, [rankedComplaints, search, statusFilter, categoryFilter, severityFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCSV = () => {
    const headers = ['Ticket ID', 'Title', 'Category', 'Status', 'Priority Score', 'Location', 'Date'];
    const rows = filtered.map(c => [
      c.ticketId || c.id,
      c.title || '',
      c.category || '',
      c.status || '',
      calculatePriorityScore(c),
      c.location?.area || '',
      c.createdAt?.seconds ? new Date(c.createdAt.seconds * 1000).toLocaleDateString() : '',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'complaints.csv'; a.click();
  };

  return (
    <>
      <TopNavbar
        title="Complaint Management"
        subtitle={`${filtered.length} complaints · Smart ranked view`}
        actions={
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary btn-sm" onClick={exportCSV}>
              <Download size={14} /> Export
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/complaints/new')}>
              <Plus size={14} /> Add
            </button>
          </div>
        }
      />
      <div className="page-content animate-fadeIn">
        {/* Filters */}
        <div className="card mb-4">
          <div className="filter-row">
            <div className="search-bar" style={{ minWidth: 300 }}>
              <Search size={15} color="var(--text-muted)" />
              <input
                id="complaint-search"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by title, ticket ID, location..."
              />
            </div>
            <select className="select" style={{ width: 140 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>)}
            </select>
            <select className="select" style={{ width: 140 }} value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
              {CATEGORIES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Categories' : s}</option>)}
            </select>
            <select className="select" style={{ width: 140 }} value={severityFilter} onChange={e => { setSeverityFilter(e.target.value); setPage(1); }}>
              {SEVERITIES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Priority' : s}</option>)}
            </select>
            <select className="select" style={{ width: 150 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="priority">Sort: Priority</option>
              <option value="date">Sort: Newest</option>
              <option value="reports">Sort: Most Reports</option>
            </select>
            <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
              {filtered.length} results
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : paginated.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-title">No complaints found</div>
              <div className="empty-desc">Try adjusting your filters or search term</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Ticket ID</th>
                  <th>Issue</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Score</th>
                  <th>Reports</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Age</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((c, i) => {
                  const score = c.priorityScore || calculatePriorityScore(c);
                  const label = getPriorityLabel(score);
                  return (
                    <tr
                      key={c.id}
                      onClick={() => navigate(`/complaints/${c.id}`)}
                      className={`row-${label}`}
                      style={{ borderLeft: `3px solid var(--priority-${label})` }}
                    >
                      <td style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: 13 }}>
                        {(page - 1) * PAGE_SIZE + i + 1}
                      </td>
                      <td>
                        <code style={{ fontSize: 12, color: 'var(--accent-light)', background: 'var(--accent-glow)', padding: '2px 6px', borderRadius: 4 }}>
                          {c.ticketId || c.id?.slice(0, 8)}
                        </code>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, maxWidth: 200 }} className="truncate">{c.title || 'Untitled'}</div>
                        {c.reportCount > 1 && <DuplicateBadge count={c.reportCount} />}
                      </td>
                      <td><CategoryChip category={c.category} /></td>
                      <td><PriorityBadge complaint={c} /></td>
                      <td style={{ minWidth: 120 }}><ScoreBar score={score} /></td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{c.reportCount || 1}</td>
                      <td><StatusBadge status={c.status} /></td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 150 }} className="truncate">
                        📍 {c.location?.area || '—'}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{timeAgo(c.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Page {page} of {totalPages} · {filtered.length} total
            </span>
            <div className="flex gap-2">
              <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setPage(p)}
                >{p}</button>
              ))}
              <button className="btn btn-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
