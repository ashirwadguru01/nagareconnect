import { useState, useEffect } from 'react';
import { getAssignedComplaints } from '../../services/complaintService';
import { getWorkerPerformance } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiMap } from 'react-icons/fi';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAssignedComplaints(), getWorkerPerformance()])
      .then(([c, p]) => {
        setComplaints(c.data);
        setPerformance(p.data.find(w => w.id === user?.id));
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;

  const pending = complaints.filter(c => c.status === 'pending').length;
  const inProgress = complaints.filter(c => c.status === 'in_progress').length;
  const monthlyResolved = performance?.resolved_count || 0;
  const bonusEligible = performance?.bonus_eligible;
  const progressPct = Math.min((monthlyResolved / 100) * 100, 100);

  const priorityColor = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', borderBottom: '1px solid #1a1a1a', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '24px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.03em' }}>
            Worker Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: '#4b5563', marginTop: '3px' }}>Welcome, {user?.name}</p>
        </div>
        <Link to="/worker/complaints" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#22c55e', color: '#000', borderRadius: '7px', fontSize: '13px', fontWeight: 700 }}>
          <FiMap size={13} /> My Tasks
        </Link>
      </div>

      {/* Bonus alert */}
      {bonusEligible && (
        <div style={{ padding: '12px 16px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', color: '#86efac', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🏆 You've resolved 100+ complaints this month and are eligible for an increment/bonus!
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: '#1a1a1a', border: '1px solid #1a1a1a', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
        {[
          { label: 'Assigned', value: complaints.length, color: '#f1f5f9' },
          { label: 'Pending', value: pending, color: '#f59e0b' },
          { label: 'In Progress', value: inProgress, color: '#3b82f6' },
          { label: 'This Month', value: monthlyResolved, color: '#22c55e' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '20px 22px', background: '#0d0d0d' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#374151', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '34px', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Monthly progress */}
      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#d1d5db' }}>Monthly Bonus Progress</div>
          <div style={{ fontSize: '13px', color: bonusEligible ? '#22c55e' : '#4b5563', fontWeight: 700 }}>
            {monthlyResolved} / 100 resolved
          </div>
        </div>
        <div style={{ height: '8px', background: '#1a1a1a', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: bonusEligible ? '#22c55e' : '#3b82f6', borderRadius: '4px', transition: 'width 0.5s ease' }} />
        </div>
        <div style={{ fontSize: '12px', color: '#374151', marginTop: '6px' }}>
          {bonusEligible ? '✅ Bonus eligible this month!' : `${100 - monthlyResolved} more complaints to unlock bonus`}
        </div>
      </div>

      {/* Complaints table */}
      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '15px', color: '#e5e7eb', letterSpacing: '0.03em' }}>My Assigned Complaints</span>
          <Link to="/worker/complaints" style={{ fontSize: '12px', color: '#22c55e', fontWeight: 600 }}>Manage all →</Link>
        </div>
        {complaints.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#374151', fontSize: '13px' }}>No complaints assigned right now.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#111' }}>
                {['#', 'Title', 'Priority', 'Status', 'Reported', 'Action'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#374151', letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: '1px solid #1a1a1a' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {complaints.slice(0, 6).map((c, i) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #111', background: i % 2 === 0 ? 'transparent' : '#080808' }}>
                  <td style={{ padding: '10px 14px', color: '#374151' }}>#{c.id}</td>
                  <td style={{ padding: '10px 14px', color: '#d1d5db', fontWeight: 500 }}>{c.title}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: priorityColor[c.priority], marginRight: 5 }} />
                    <span style={{ fontSize: '11px', color: priorityColor[c.priority], textTransform: 'capitalize' }}>{c.priority}</span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span className={`badge badge-${c.status}`}>{c.status.replace('_', ' ')}</span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#374151', whiteSpace: 'nowrap' }}>
                    {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <Link to="/worker/complaints" style={{ fontSize: '11px', color: '#22c55e', fontWeight: 600 }}>Resolve →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default WorkerDashboard;
