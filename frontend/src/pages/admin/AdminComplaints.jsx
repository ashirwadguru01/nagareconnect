import { useState, useEffect } from 'react';
import { getAllComplaints, assignComplaint, updateStatus } from '../../services/complaintService';
import { getWorkers } from '../../services/adminService';
import toast from 'react-hot-toast';
import { FiSearch, FiUserPlus } from 'react-icons/fi';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [assignModal, setAssignModal] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [assigning, setAssigning] = useState(false);

  const load = () => {
    const params = { page, limit: 15 };
    if (statusFilter !== 'all') params.status = statusFilter;
    Promise.all([getAllComplaints(params), getWorkers()])
      .then(([c, w]) => { setComplaints(c.data.complaints); setTotal(c.data.total); setWorkers(w.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  const handleAssign = async () => {
    if (!selectedWorker) { toast.error('Select a worker'); return; }
    setAssigning(true);
    try {
      await assignComplaint(assignModal.id, parseInt(selectedWorker));
      toast.success('Complaint assigned!');
      setAssignModal(null);
      setSelectedWorker('');
      setLoading(true);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const filtered = complaints.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.citizen_name || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper animate-fadeIn">
      <div className="page-header">
        <h1>All Complaints</h1>
        <p>{total} total complaints in the system</p>
      </div>

      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" placeholder="Search by title or citizen..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '36px' }} />
          </div>
          <select className="form-select" style={{ width: 'auto', minWidth: '150px' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead><tr><th>#</th><th>Title</th><th>Citizen</th><th>Location</th><th>Status</th><th>Priority</th><th>Worker</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ color: 'var(--text-muted)' }}>#{c.id}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</td>
                  <td>{c.citizen_name}</td>
                  <td style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px' }}>{c.address || `${c.lat}, ${c.lng}`}</td>
                  <td><span className={`badge badge-${c.status}`}>{c.status.replace('_', ' ')}</span></td>
                  <td><span className={`badge badge-${c.priority}`}>{c.priority}</span></td>
                  <td>{c.worker_name || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td style={{ fontSize: '12px' }}>{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {c.status === 'pending' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => { setAssignModal(c); setSelectedWorker(''); }}>
                          <FiUserPlus /> Assign
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '0 4px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Page {page} of {Math.ceil(total / 15)}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 15)}>Next →</button>
          </div>
        </div>
      </div>

      {assignModal && (
        <div className="modal-backdrop" onClick={() => setAssignModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Assign Complaint</h2>
              <button className="modal-close" onClick={() => setAssignModal(null)}>×</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
              Assigning: <strong style={{ color: 'var(--text-primary)' }}>{assignModal.title}</strong>
            </p>
            <div className="form-group">
              <label className="form-label">Select Worker</label>
              <select className="form-select" value={selectedWorker} onChange={e => setSelectedWorker(e.target.value)}>
                <option value="">-- Choose a worker --</option>
                {workers.filter(w => w.is_active).map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.total_resolved || 0} resolved)</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleAssign} disabled={assigning}>
              {assigning ? 'Assigning...' : 'Assign Worker'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
