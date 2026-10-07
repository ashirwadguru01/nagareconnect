import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAssignedComplaints, getComplaintById, updateStatus } from '../../services/complaintService';
import toast from 'react-hot-toast';
import { FiMapPin, FiNavigation, FiCheck, FiArrowLeft } from 'react-icons/fi';

const AssignedComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState('');

  const load = () => getAssignedComplaints().then(r => setComplaints(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    setUpdating(true);
    try {
      await updateStatus(id, { status, note });
      toast.success(`Status updated to ${status}!`);
      setSelected(null);
      setNote('');
      setLoading(true);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const openNav = (c) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`, '_blank');
  };

  if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper animate-fadeIn">
      <div className="page-header">
        <h1>Assigned Tasks</h1>
        <p>{complaints.length} active complaints assigned to you</p>
      </div>

      {complaints.length === 0 ? (
        <div className="card"><div className="empty-state"><span>✅</span><h3>No assigned complaints</h3><p>You're all caught up!</p></div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {complaints.map(c => (
            <div key={c.id} className="card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              {c.image_url
                ? <img src={c.image_url} alt="" style={{ width: '90px', height: '90px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{ width: '90px', height: '90px', borderRadius: '12px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', flexShrink: 0 }}>🗑️</div>
              }
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{c.title}</span>
                  <span className={`badge badge-${c.status}`}>{c.status.replace('_', ' ')}</span>
                  <span className={`badge badge-${c.priority}`}>{c.priority}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.6 }}>{c.description?.substring(0, 120)}...</p>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span><FiMapPin style={{ verticalAlign: 'middle' }} /> {c.address || `${c.lat}, ${c.lng}`}</span>
                  <span>👤 {c.citizen_name}</span>
                  {c.citizen_phone && <span>📞 {c.citizen_phone}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => openNav(c)}>
                  <FiNavigation /> Navigate
                </button>
                {c.status !== 'resolved' && (
                  <button className="btn btn-primary btn-sm" onClick={() => setSelected(c)}>
                    <FiCheck /> Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolve Modal */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Update Status</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
              Updating: <strong style={{ color: 'var(--text-primary)' }}>{selected.title}</strong>
            </p>
            <div className="form-group">
              <label className="form-label">Resolution Note (optional)</label>
              <textarea className="form-textarea" value={note} onChange={e => setNote(e.target.value)} placeholder="Describe what was done to resolve this issue..." rows={3} />
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {selected.status === 'pending' && (
                <button className="btn btn-ghost" onClick={() => handleStatus(selected.id, 'in_progress')} disabled={updating}>
                  🔄 Mark In Progress
                </button>
              )}
              <button className="btn btn-primary" onClick={() => handleStatus(selected.id, 'resolved')} disabled={updating}>
                {updating ? 'Updating...' : '✅ Mark Resolved'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedComplaints;
