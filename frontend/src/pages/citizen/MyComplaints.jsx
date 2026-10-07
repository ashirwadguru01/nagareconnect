import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyComplaints } from '../../services/complaintService';
import { FiSearch, FiFilter } from 'react-icons/fi';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyComplaints().then(r => { setComplaints(r.data); setFiltered(r.data); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let data = complaints;
    if (statusFilter !== 'all') data = data.filter(c => c.status === statusFilter);
    if (search) data = data.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || (c.address || '').toLowerCase().includes(search.toLowerCase()));
    setFiltered(data);
  }, [search, statusFilter, complaints]);

  if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800 }}>My Complaints</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{complaints.length} total complaints</p>
        </div>
        <Link to="/citizen/new-complaint" className="btn btn-primary">+ New Report</Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" placeholder="Search complaints..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '36px' }} />
          </div>
          <select className="form-select" style={{ width: 'auto', minWidth: '150px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <span>🔍</span>
            <h3>No complaints found</h3>
            <p>Try adjusting your filters or report a new issue</p>
            <Link to="/citizen/new-complaint" className="btn btn-primary" style={{ marginTop: '12px' }}>Report Issue</Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map(c => (
            <div key={c.id} className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px 20px' }}>
              {c.image_url && <img src={c.image_url} alt="" style={{ width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />}
              {!c.image_url && <div style={{ width: '70px', height: '70px', borderRadius: '10px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>🗑️</div>}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.title}</span>
                  <span className={`badge badge-${c.status}`}>{c.status.replace('_', ' ')}</span>
                  <span className={`badge badge-${c.priority}`}>{c.priority}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>{c.address || `${c.lat}, ${c.lng}`}</p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>📅 {new Date(c.created_at).toLocaleDateString('en-IN')}</span>
                  {c.worker_name && <span>👷 {c.worker_name}</span>}
                  {c.resolved_at && <span>✅ Resolved {new Date(c.resolved_at).toLocaleDateString('en-IN')}</span>}
                </div>
              </div>
              <Link to={`/citizen/complaints/${c.id}`} className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }}>Details →</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyComplaints;
