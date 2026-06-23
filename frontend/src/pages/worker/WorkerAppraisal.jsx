import { useState, useEffect } from 'react';
import { getMyAppraisalStats, submitAppraisalRequest } from '../../services/appraisalService';
import toast from 'react-hot-toast';

// ── SVG Icons ──
const IconTrophy    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2"/><rect x="6" y="18" width="12" height="4"/><line x1="12" y1="13" x2="12" y2="18"/></svg>;
const IconCheck     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconClock     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconX         = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconStar      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconTrendUp   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IconSend      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const IconTask      = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const IconZap       = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;

const P = { fontFamily: 'Poppins, sans-serif' };

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const REQUEST_TYPES = [
  { value: 'bonus',       label: 'Performance Bonus',   desc: 'Request extra pay for outstanding work this month' },
  { value: 'appraisal',  label: 'Salary Appraisal',    desc: 'Request a permanent salary raise based on your performance' },
  { value: 'recognition', label: 'Recognition Award',   desc: 'Request formal recognition for exceptional contribution' },
];

const statusStyles = {
  pending:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)',  icon: <IconClock /> },
  approved: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.2)',   icon: <IconCheck /> },
  rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)',   icon: <IconX /> },
};

const MILESTONES = [
  { tasks: 5,   label: 'Getting Started',  color: '#94a3b8' },
  { tasks: 20,  label: 'Active Worker',    color: '#3b82f6' },
  { tasks: 50,  label: 'Top Performer',    color: '#8b5cf6' },
  { tasks: 100, label: 'Star Worker',      color: '#f59e0b' },
  { tasks: 200, label: 'Elite Worker',     color: '#22c55e' },
];

const WorkerAppraisal = () => {
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]             = useState({ request_type: 'bonus', message: '' });
  const [showForm, setShowForm]     = useState(false);

  const load = () =>
    getMyAppraisalStats()
      .then(r => setStats(r.data))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitAppraisalRequest(form);
      toast.success('Appraisal request submitted! Admin will review it shortly.');
      setShowForm(false);
      setForm({ request_type: 'bonus', message: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;

  const { month, year, resolved_this_month, total_resolved, in_progress, current_requests, history } = stats;
  const currentMilestone = MILESTONES.filter(m => resolved_this_month >= m.tasks).pop();
  const nextMilestone    = MILESTONES.find(m => resolved_this_month < m.tasks);
  const progressPct      = nextMilestone
    ? Math.min((resolved_this_month / nextMilestone.tasks) * 100, 100)
    : 100;

  const alreadySubmitted = (type) => current_requests.some(r => r.request_type === type);

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100, ...P }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{ color: '#f59e0b' }}><IconTrophy /></div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#f1f5f9', ...P }}>
            Performance & Appraisal
          </h1>
        </div>
        <p style={{ fontSize: '14px', color: '#64748b', ...P }}>
          {MONTHS[month - 1]} {year} — Track your work and request rewards
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Tasks This Month',  value: resolved_this_month, color: '#22c55e',  icon: <IconTask /> },
          { label: 'Total Resolved',    value: total_resolved,      color: '#3b82f6',  icon: <IconCheck /> },
          { label: 'In Progress',       value: in_progress,         color: '#f59e0b',  icon: <IconClock /> },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '22px 24px', background: '#0f1318',
            border: '1px solid #1e2530', borderRadius: '14px',
            borderBottom: `3px solid ${s.color}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: s.color, marginBottom: '10px' }}>
              {s.icon}
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', ...P }}>
                {s.label}
              </span>
            </div>
            <div style={{ fontSize: '38px', fontWeight: 700, color: s.color, lineHeight: 1, ...P }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', marginBottom: '24px' }}>

        {/* Milestone progress */}
        <div style={{ background: '#0f1318', border: '1px solid #1e2530', borderRadius: '14px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{ color: '#f59e0b' }}><IconZap /></div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f1f5f9', ...P }}>Monthly Milestones</h2>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#64748b', ...P }}>
                Current: <strong style={{ color: currentMilestone?.color || '#94a3b8' }}>{currentMilestone?.label || 'Starting Out'}</strong>
              </span>
              {nextMilestone && (
                <span style={{ fontSize: '13px', color: '#64748b', ...P }}>
                  Next: <strong style={{ color: nextMilestone.color }}>{nextMilestone.label}</strong> at {nextMilestone.tasks} tasks
                </span>
              )}
            </div>
            <div style={{ height: '8px', background: '#161b23', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '99px',
                width: `${progressPct}%`,
                background: `linear-gradient(90deg, #22c55e, ${currentMilestone?.color || '#22c55e'})`,
                transition: 'width 0.6s ease',
              }} />
            </div>
            <div style={{ marginTop: '6px', fontSize: '12px', color: '#475569', textAlign: 'right', ...P }}>
              {resolved_this_month}{nextMilestone ? ` / ${nextMilestone.tasks}` : '+'} tasks
            </div>
          </div>

          {/* Milestone steps */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {MILESTONES.map((m) => {
              const reached = resolved_this_month >= m.tasks;
              return (
                <div key={m.tasks} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: reached ? `rgba(${m.color === '#22c55e' ? '34,197,94' : m.color === '#f59e0b' ? '245,158,11' : m.color === '#3b82f6' ? '59,130,246' : m.color === '#8b5cf6' ? '139,92,246' : '148,163,184'},0.15)` : '#161b23',
                    border: `2px solid ${reached ? m.color : '#1e2530'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: reached ? m.color : '#475569',
                    transition: 'all 0.3s',
                    fontSize: '11px', fontWeight: 700,
                  }}>
                    {reached ? <IconCheck /> : m.tasks}
                  </div>
                  <span style={{ fontSize: '9px', color: reached ? m.color : '#475569', fontWeight: 600, textAlign: 'center', ...P, maxWidth: '60px', lineHeight: 1.2 }}>
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Request panel */}
        <div style={{ background: '#0f1318', border: '1px solid #1e2530', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ color: '#22c55e' }}><IconTrendUp /></div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f1f5f9', ...P }}>Request Appraisal</h2>
          </div>

          {resolved_this_month === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, ...P }}>
                Complete at least <strong style={{ color: '#f1f5f9' }}>1 task</strong> this month to unlock appraisal requests.
              </div>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, ...P }}>
                You've resolved <strong style={{ color: '#22c55e' }}>{resolved_this_month}</strong> tasks this month. You can request the following:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {REQUEST_TYPES.map(rt => {
                  const done = alreadySubmitted(rt.value);
                  return (
                    <button key={rt.value} disabled={done} onClick={() => { setForm(f => ({ ...f, request_type: rt.value })); setShowForm(true); }}
                      style={{
                        padding: '12px 14px', borderRadius: '10px', border: `1px solid ${done ? '#1e2530' : '#22c55e'}`,
                        background: done ? '#0f1318' : 'rgba(34,197,94,0.06)',
                        cursor: done ? 'not-allowed' : 'pointer', textAlign: 'left',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { if (!done) e.currentTarget.style.background = 'rgba(34,197,94,0.12)'; }}
                      onMouseLeave={e => { if (!done) e.currentTarget.style.background = 'rgba(34,197,94,0.06)'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: done ? '#475569' : '#f1f5f9', ...P }}>{rt.label}</span>
                        {done
                          ? <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: 700, background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: '99px', ...P }}>Submitted</span>
                          : <div style={{ color: '#22c55e' }}><IconSend /></div>
                        }
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569', ...P }}>{rt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Request form modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }}>
          <div style={{ background: '#0f1318', border: '1px solid #1e2530', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '480px', animation: 'slideUp 0.25s ease' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9', marginBottom: '6px', ...P }}>
              {REQUEST_TYPES.find(r => r.value === form.request_type)?.label}
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px', ...P }}>
              Tasks completed this month: <strong style={{ color: '#22c55e' }}>{resolved_this_month}</strong>
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px', ...P }}>
                  Request Type
                </label>
                <select value={form.request_type} onChange={e => setForm(f => ({ ...f, request_type: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', background: '#161b23', border: '1px solid #1e2530', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', ...P, cursor: 'pointer' }}>
                  {REQUEST_TYPES.filter(rt => !alreadySubmitted(rt.value)).map(rt => (
                    <option key={rt.value} value={rt.value}>{rt.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px', ...P }}>
                  Your Message (optional)
                </label>
                <textarea
                  rows={4} placeholder="Describe your contributions this month, specific tasks handled, any challenges overcome..."
                  value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', background: '#161b23', border: '1px solid #1e2530', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'Poppins, sans-serif', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#22c55e'}
                  onBlur={e => e.target.style.borderColor = '#1e2530'}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '11px', background: 'transparent', border: '1px solid #1e2530', borderRadius: '10px', color: '#64748b', cursor: 'pointer', fontSize: '14px', fontWeight: 600, ...P }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={{ flex: 2, padding: '11px', background: '#22c55e', border: 'none', borderRadius: '10px', color: '#000', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 700, ...P, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {submitting
                    ? <><div style={{ width: '14px', height: '14px', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Submitting...</>
                    : <><IconSend /> Submit Request</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request history */}
      <div style={{ background: '#0f1318', border: '1px solid #1e2530', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #1e2530' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f1f5f9', ...P }}>Request History</h2>
        </div>
        {history.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', fontSize: '14px', color: '#475569', ...P }}>
            No requests submitted yet. Complete tasks and apply for your first appraisal!
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#080b0f' }}>
                {['Month', 'Type', 'Tasks Done', 'Message', 'Status', 'Admin Note', 'Bonus'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #1e2530', ...P }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((r, i) => {
                const ss = statusStyles[r.status];
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid #1e2530' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#161b23'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', color: '#94a3b8', ...P }}>{MONTHS[r.month - 1]} {r.year}</td>
                    <td style={{ padding: '12px 16px', color: '#f1f5f9', fontWeight: 600, ...P }}>
                      {REQUEST_TYPES.find(rt => rt.value === r.request_type)?.label || r.request_type}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#22c55e', fontWeight: 700, ...P }}>{r.tasks_completed}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...P }}>{r.message || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, color: ss.color, background: ss.bg, border: `1px solid ${ss.border}`, ...P }}>
                        {ss.icon} {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b', ...P }}>{r.admin_note || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#f59e0b', fontWeight: 700, ...P }}>
                      {r.bonus_amount ? `₹${Number(r.bonus_amount).toLocaleString('en-IN')}` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default WorkerAppraisal;
