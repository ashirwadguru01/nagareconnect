import { useState, useEffect } from 'react';
import { getAllAppraisalRequests, reviewAppraisalRequest } from '../../services/appraisalService';
import toast from 'react-hot-toast';

const IconCheck  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconX      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconClock  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconTrophy = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2"/><rect x="6" y="18" width="12" height="4"/><line x1="12" y1="13" x2="12" y2="18"/></svg>;

const P = { fontFamily: 'Poppins, sans-serif' };
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const REQUEST_LABELS = { bonus: 'Performance Bonus', appraisal: 'Salary Appraisal', recognition: 'Recognition Award' };

const statusStyles = {
  pending:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)',  icon: <IconClock /> },
  approved: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.2)',   icon: <IconCheck /> },
  rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)',   icon: <IconX /> },
};

const AdminAppraisals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('pending');
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState({ status: 'approved', admin_note: '', bonus_amount: '' });
  const [saving, setSaving]     = useState(false);

  const load = () =>
    getAllAppraisalRequests(filter || undefined)
      .then(r => setRequests(r.data))
      .finally(() => setLoading(false));

  useEffect(() => { setLoading(true); load(); }, [filter]);

  const handleReview = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await reviewAppraisalRequest(selected.id, {
        status: form.status,
        admin_note: form.admin_note,
        bonus_amount: form.bonus_amount || null,
      });
      toast.success(`Request ${form.status} successfully`);
      setSelected(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const openReview = (req) => {
    setSelected(req);
    setForm({ status: 'approved', admin_note: '', bonus_amount: '' });
  };

  const pending  = requests.filter(r => r.status === 'pending').length;
  const approved = requests.filter(r => r.status === 'approved').length;

  /* shared card style using CSS variables */
  const card = {
    background: 'var(--bg-800)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    transition: 'background 0.3s ease',
  };

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 32px) clamp(24px, 4vw, 36px)', width: '100%', boxSizing: 'border-box', ...P }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ color: '#f59e0b' }}><IconTrophy /></div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', ...P }}>Appraisal Requests</h1>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', ...P }}>Review and approve worker performance rewards</p>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {[['Pending Review', pending, '#f59e0b'], ['Approved', approved, '#22c55e']].map(([l, v, c]) => (
            <div key={l} style={{ ...card, padding: '12px 20px', textAlign: 'center', border: `1px solid ${c}30` }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', ...P }}>{v}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', ...P }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[['', 'All'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            style={{
              padding: '8px 18px', borderRadius: '8px', cursor: 'pointer',
              background: filter === val ? '#22c55e' : 'var(--bg-700)',
              color: filter === val ? '#000' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '13px', ...P,
              transition: 'all 0.2s',
              border: filter === val ? '1px solid #22c55e' : '1px solid var(--border)',
            }}>{label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ ...card, overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}><div className="spinner" /></div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '56px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)', ...P }}>
            No {filter || ''} appraisal requests found.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-700)' }}>
                {['Worker', 'Month', 'Request Type', 'Tasks Done', 'Message', 'Status', 'Bonus', 'Action'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', ...P }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => {
                const ss = statusStyles[r.status];
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#000', flexShrink: 0 }}>
                          {r.worker_name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', ...P }}>{r.worker_name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', ...P }}>{r.worker_email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-secondary)', ...P }}>{MONTHS[r.month - 1]} {r.year}</td>
                    <td style={{ padding: '13px 16px', fontWeight: 600, color: 'var(--text-primary)', ...P }}>{REQUEST_LABELS[r.request_type] || r.request_type}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', ...P }}>{r.tasks_completed}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px', ...P }}>tasks</span>
                    </td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-secondary)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...P }}>{r.message || '—'}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, color: ss.color, background: ss.bg, border: `1px solid ${ss.border}`, ...P }}>
                        {ss.icon} {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-primary)', fontWeight: 700, ...P }}>
                      {r.bonus_amount ? `₹${Number(r.bonus_amount).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      {r.status === 'pending' ? (
                        <button onClick={() => openReview(r)}
                          style={{ padding: '6px 14px', background: '#22c55e', border: 'none', borderRadius: '7px', color: '#000', fontSize: '12px', fontWeight: 700, cursor: 'pointer', ...P }}>
                          Review
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', ...P }}>
                          {r.admin_note ? `"${r.admin_note.substring(0, 20)}..."` : 'Done'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Review Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ ...card, padding: '32px', width: '100%', maxWidth: '500px', animation: 'slideUp 0.25s ease' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', ...P }}>Review Request</h2>

            {/* Worker info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '20px', marginTop: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#000' }}>
                {selected.worker_name?.[0]}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', ...P }}>{selected.worker_name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', ...P }}>
                  {REQUEST_LABELS[selected.request_type]} · {MONTHS[selected.month - 1]} {selected.year} · <strong style={{ color: '#22c55e' }}>{selected.tasks_completed} tasks</strong>
                </div>
              </div>
            </div>

            {selected.message && (
              <div style={{ padding: '12px 14px', background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: '10px', marginBottom: '20px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px', ...P }}>Worker's Message</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, ...P }}>{selected.message}</p>
              </div>
            )}

            <form onSubmit={handleReview}>
              {/* Decision */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px', ...P }}>Decision</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[['approved', 'Approve', '#22c55e'], ['rejected', 'Reject', '#ef4444']].map(([val, label, color]) => (
                    <button key={val} type="button" onClick={() => setForm(f => ({ ...f, status: val }))}
                      style={{ padding: '10px', borderRadius: '10px', border: `1px solid ${form.status === val ? color : 'var(--border)'}`, background: form.status === val ? `rgba(${color === '#22c55e' ? '34,197,94' : '239,68,68'},0.1)` : 'var(--bg-700)', color: form.status === val ? color : 'var(--text-secondary)', fontWeight: 600, fontSize: '13px', cursor: 'pointer', ...P, transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      {val === 'approved' ? <IconCheck /> : <IconX />} {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bonus amount */}
              {form.status === 'approved' && (
                <div style={{ marginBottom: '16px', animation: 'fadeIn 0.2s ease' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px', ...P }}>Bonus Amount (₹) — Optional</label>
                  <input type="number" min="0" placeholder="e.g. 2000"
                    value={form.bonus_amount} onChange={e => setForm(f => ({ ...f, bonus_amount: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', ...P, boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#22c55e'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              )}

              {/* Admin note */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px', ...P }}>Note to Worker</label>
                <textarea rows={3} placeholder={form.status === 'approved' ? 'e.g. Great performance this month!' : 'e.g. Minimum 10 tasks required.'}
                  value={form.admin_note} onChange={e => setForm(f => ({ ...f, admin_note: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'Poppins, sans-serif', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#22c55e'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setSelected(null)} style={{ flex: 1, padding: '11px', background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px', fontWeight: 600, ...P }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ flex: 2, padding: '11px', background: form.status === 'approved' ? '#22c55e' : '#ef4444', border: 'none', borderRadius: '10px', color: form.status === 'approved' ? '#000' : '#fff', fontWeight: 700, fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer', ...P, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {saving
                    ? <><div style={{ width: '14px', height: '14px', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Saving...</>
                    : form.status === 'approved' ? <><IconCheck /> Approve Request</> : <><IconX /> Reject Request</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppraisals;
