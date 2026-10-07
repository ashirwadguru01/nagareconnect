import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComplaintById } from '../../services/complaintService';
import { FiMapPin, FiCalendar, FiUser, FiArrowLeft } from 'react-icons/fi';

const statusSteps = ['pending', 'in_progress', 'resolved'];

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComplaintById(id).then(r => setComplaint(r.data)).catch(() => navigate('/citizen/complaints')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;
  if (!complaint) return null;

  const stepIdx = statusSteps.indexOf(complaint.status);

  return (
    <div className="page-wrapper animate-fadeIn">
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
        <FiArrowLeft /> Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
        <div>
          {/* Main info */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>{complaint.title}</h1>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span className={`badge badge-${complaint.status}`}>{complaint.status.replace('_', ' ')}</span>
                  <span className={`badge badge-${complaint.priority}`}>{complaint.priority} priority</span>
                </div>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>#{complaint.id}</span>
            </div>

            {complaint.image_url && (
              <img src={complaint.image_url} alt="Complaint" style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px' }} />
            )}

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '15px' }}>{complaint.description}</p>

            <div className="divider" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)', alignItems: 'center' }}>
                <FiMapPin style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>{complaint.address || `${complaint.lat}, ${complaint.lng}`}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)', alignItems: 'center' }}>
                <FiCalendar style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>Reported on {new Date(complaint.created_at).toLocaleString('en-IN')}</span>
              </div>
              {complaint.worker_name && (
                <div style={{ display: 'flex', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)', alignItems: 'center' }}>
                  <FiUser style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <span>Assigned to: <strong style={{ color: 'var(--text-primary)' }}>{complaint.worker_name}</strong></span>
                </div>
              )}
              {complaint.resolved_at && (
                <div style={{ display: 'flex', gap: '10px', fontSize: '14px', color: 'var(--primary)', alignItems: 'center' }}>
                  <span>✅ Resolved on {new Date(complaint.resolved_at).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '20px' }}>Status Timeline</h3>
            {complaint.logs?.map((log, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: '4px' }} />
                  {i < complaint.logs.length - 1 && <div style={{ width: '2px', flex: 1, background: 'var(--border-light)', margin: '4px 0' }} />}
                </div>
                <div style={{ flex: 1, paddingBottom: '8px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Status changed to <span className={`badge badge-${log.new_status}`}>{log.new_status.replace('_', ' ')}</span>
                  </div>
                  {log.note && <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{log.note}</div>}
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>by {log.changed_by_name} · {new Date(log.changed_at).toLocaleString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status tracker */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '20px' }}>Progress</h3>
          {statusSteps.map((step, i) => (
            <div key={step} style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                background: i <= stepIdx ? 'var(--primary)' : 'var(--bg-tertiary)',
                border: `2px solid ${i <= stepIdx ? 'var(--primary)' : 'var(--border)'}`,
                color: i <= stepIdx ? '#fff' : 'var(--text-muted)',
              }}>
                {i < stepIdx ? '✓' : i + 1}
              </div>
              <div style={{ paddingTop: '4px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: i <= stepIdx ? 'var(--text-primary)' : 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {step.replace('_', ' ')}
                </div>
                {i === 0 && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Issue reported</div>}
                {i === 1 && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Worker assigned</div>}
                {i === 2 && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Complaint closed · +20 pts</div>}
              </div>
            </div>
          ))}

          {complaint.status === 'rejected' && (
            <div className="alert alert-error" style={{ marginTop: '12px' }}>
              ❌ This complaint was rejected.
            </div>
          )}

          {complaint.status === 'resolved' && (
            <div className="alert alert-success" style={{ marginTop: '12px' }}>
              🎉 Resolved! You earned +20 reward points.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
