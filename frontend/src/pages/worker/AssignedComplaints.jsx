import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssignedComplaints, getAvailableComplaints, selfAssign } from '../../services/complaintService';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiMapPin, FiNavigation, FiCamera, FiX, FiCheck, FiZap } from 'react-icons/fi';

const priorityColor = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };
const statusColor = { pending: '#f59e0b', in_progress: '#3b82f6', resolved: '#22c55e', rejected: '#ef4444' };

const PriorityBar = ({ p }) => (
  <div style={{ width: 3, height: 40, background: priorityColor[p] || '#374151', borderRadius: 2, flexShrink: 0 }} />
);

export default function AssignedComplaints() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('available'); // 'available' | 'assigned'
  const [available, setAvailable] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);

  // Resolve modal state
  const [modal, setModal] = useState(null);
  const [resolveStatus, setResolveStatus] = useState('resolved');
  const [note, setNote] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  const load = async () => {
    setLoading(true);
    try {
      const [av, as] = await Promise.all([getAvailableComplaints(), getAssignedComplaints()]);
      setAvailable(av.data);
      setAssigned(as.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleClaim = async (id) => {
    setClaiming(id);
    try {
      await selfAssign(id);
      toast.success('Task claimed! It moved to your assigned list.');
      await load();
      setTab('assigned');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not claim task');
    } finally { setClaiming(null); }
  };

  const openModal = (c) => {
    setModal(c);
    setResolveStatus('resolved');
    setNote('');
    setProofFile(null);
    setProofPreview(null);
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) { toast.error('Images only'); return; }
    if (f.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    setProofFile(f);
    setProofPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (resolveStatus === 'resolved' && !proofFile) {
      toast.error('Proof photo is required to mark as resolved');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('status', resolveStatus);
      if (note) fd.append('note', note);
      if (proofFile) fd.append('proof', proofFile);

      await api.patch(`/complaints/${modal.id}/status`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(resolveStatus === 'resolved'
        ? '✅ Resolved! Admin has been notified.'
        : '🔄 Status updated!');
      setModal(null);
      await load();
      // Redirect to worker dashboard after resolve
      if (resolveStatus === 'resolved') {
        setTimeout(() => navigate('/worker'), 1200);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setSubmitting(false); }
  };

  const TabBtn = ({ id, label, count }) => (
    <button onClick={() => setTab(id)} style={{
      padding: '9px 20px', borderRadius: 7, border: 'none', cursor: 'pointer', fontWeight: 700,
      fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
      background: tab === id ? '#22c55e' : '#111',
      color: tab === id ? '#000' : '#4b5563',
      transition: 'all 0.15s',
    }}>
      {label}
      {count > 0 && (
        <span style={{ padding: '1px 7px', borderRadius: 9999, fontSize: 10, fontWeight: 800,
          background: tab === id ? '#000' : '#1a1a1a', color: tab === id ? '#22c55e' : '#6b7280' }}>
          {count}
        </span>
      )}
    </button>
  );

  const list = tab === 'available' ? available : assigned;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ padding: '28px 30px', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, borderBottom: '1px solid #1a1a1a', paddingBottom: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 24, fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.03em' }}>
            {tab === 'available' ? 'Available Tasks' : 'My Assigned Tasks'}
          </h1>
          <p style={{ fontSize: 13, color: '#4b5563', marginTop: 3 }}>
            {tab === 'available'
              ? `${available.length} complaint${available.length !== 1 ? 's' : ''} waiting to be claimed`
              : `${assigned.length} task${assigned.length !== 1 ? 's' : ''} assigned to you`}
          </p>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8 }}>
          <TabBtn id="available" label="Available" count={available.length} />
          <TabBtn id="assigned" label="My Tasks" count={assigned.length} />
        </div>
      </div>

      {/* Empty state */}
      {list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#374151' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{tab === 'available' ? '🎉' : '✅'}</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#6b7280' }}>
            {tab === 'available' ? 'No available tasks right now' : 'All caught up!'}
          </div>
          <div style={{ fontSize: 13, marginTop: 4 }}>
            {tab === 'available' ? 'Check back later for new complaints.' : 'No tasks assigned to you yet.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#1a1a1a', border: '1px solid #1a1a1a', borderRadius: 10, overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: tab === 'available' ? '1fr 170px 80px 80px 130px' : '1fr 170px 80px 80px 170px', padding: '9px 16px', background: '#111', fontSize: 10, fontWeight: 700, color: '#374151', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <div>Complaint</div>
            <div>Location</div>
            <div>Priority</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {list.map((c, i) => (
            <div key={c.id} style={{
              display: 'grid',
              gridTemplateColumns: tab === 'available' ? '1fr 170px 80px 80px 130px' : '1fr 170px 80px 80px 170px',
              padding: '13px 16px', background: i % 2 === 0 ? '#0d0d0d' : '#0a0a0a',
              alignItems: 'center', gap: 8,
            }}>
              {/* Info */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <PriorityBar p={c.priority} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#e5e7eb', marginBottom: 2 }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: '#4b5563' }}>#{c.id} · {c.citizen_name}</div>
                  {c.citizen_phone && <div style={{ fontSize: 11, color: '#374151' }}>📞 {c.citizen_phone}</div>}
                </div>
              </div>

              {/* Location */}
              <div style={{ fontSize: 11, color: '#4b5563', display: 'flex', gap: 4, alignItems: 'flex-start' }}>
                <FiMapPin size={11} style={{ flexShrink: 0, marginTop: 1, color: '#374151' }} />
                <span style={{ lineHeight: 1.4 }}>{(c.address || `${c.lat?.toFixed(3)}, ${c.lng?.toFixed(3)}`).substring(0, 40)}</span>
              </div>

              {/* Priority */}
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 3, textTransform: 'uppercase', letterSpacing: '0.06em', background: `${priorityColor[c.priority]}18`, color: priorityColor[c.priority], border: `1px solid ${priorityColor[c.priority]}30` }}>
                  {c.priority}
                </span>
              </div>

              {/* Status */}
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 3, textTransform: 'capitalize', background: `${statusColor[c.status]}18`, color: statusColor[c.status], border: `1px solid ${statusColor[c.status]}30` }}>
                  {c.status.replace('_', ' ')}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {c.lat && c.lng && (
                  <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`, '_blank')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 9px', background: 'transparent', border: '1px solid #1e1e1e', borderRadius: 5, color: '#6b7280', fontSize: 11, cursor: 'pointer' }}>
                    <FiNavigation size={10} /> Nav
                  </button>
                )}

                {tab === 'available' ? (
                  <button onClick={() => handleClaim(c.id)} disabled={claiming === c.id}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#22c55e', border: 'none', borderRadius: 5, color: '#000', fontSize: 11, fontWeight: 700, cursor: 'pointer', opacity: claiming === c.id ? 0.6 : 1 }}>
                    <FiZap size={10} /> {claiming === c.id ? 'Claiming...' : 'Claim Task'}
                  </button>
                ) : (
                  <button onClick={() => openModal(c)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#22c55e', border: 'none', borderRadius: 5, color: '#000', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    <FiCheck size={10} /> Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Resolve Modal ── */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setModal(null)}>
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 28, width: '100%', maxWidth: 480 }}
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: 'Poppins,sans-serif', fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>Update Complaint</div>
                <div style={{ fontSize: 12, color: '#4b5563', marginTop: 2 }}>#{modal.id} — {modal.title}</div>
              </div>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer' }}><FiX size={18} /></button>
            </div>

            {/* Status choice */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>New Status</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[{ v: 'in_progress', l: 'In Progress', c: '#3b82f6' }, { v: 'resolved', l: 'Resolved', c: '#22c55e' }].map(s => (
                  <button key={s.v} onClick={() => setResolveStatus(s.v)}
                    style={{ padding: '10px', border: `2px solid ${resolveStatus === s.v ? s.c : '#1e1e1e'}`, borderRadius: 7, background: resolveStatus === s.v ? `${s.c}12` : 'transparent', color: resolveStatus === s.v ? s.c : '#4b5563', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    {resolveStatus === s.v ? '✓ ' : ''}{s.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>Resolution Note (optional)</div>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder="e.g. Garbage collected and area cleaned..."
                style={{ width: '100%', padding: '10px 12px', background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: 7, color: '#e5e7eb', fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 72 }} />
            </div>

            {/* Proof photo */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7, color: resolveStatus === 'resolved' ? '#22c55e' : '#4b5563' }}>
                Proof Photo {resolveStatus === 'resolved' && <span style={{ color: '#ef4444' }}>* Required</span>}
              </div>
              {proofPreview ? (
                <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid #1e1e1e' }}>
                  <img src={proofPreview} alt="proof" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }} />
                  <button onClick={() => { setProofFile(null); setProofPreview(null); }}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiX size={12} />
                  </button>
                  <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.75)', padding: '3px 8px', borderRadius: 4, fontSize: 11, color: '#22c55e', fontWeight: 700 }}>✓ Proof ready</div>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()}
                  style={{ width: '100%', padding: 24, background: '#0a0a0a', border: `2px dashed ${resolveStatus === 'resolved' ? '#22c55e40' : '#1e1e1e'}`, borderRadius: 8, cursor: 'pointer', color: '#4b5563', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <FiCamera size={24} style={{ color: resolveStatus === 'resolved' ? '#22c55e' : '#374151' }} />
                  <span style={{ fontSize: 13 }}>Tap to upload or take photo</span>
                  <span style={{ fontSize: 11, color: '#374151' }}>JPG, PNG · Max 5MB</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFile} />
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={submitting}
              style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1, background: resolveStatus === 'resolved' ? '#22c55e' : '#3b82f6', color: resolveStatus === 'resolved' ? '#000' : '#fff' }}>
              {submitting ? 'Submitting...' : resolveStatus === 'resolved' ? '✅ Mark as Resolved & Notify Admin' : '🔄 Mark In Progress'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
