import { useState, useEffect } from 'react';
import { getAssignedComplaints } from '../../services/complaintService';
import { getWorkerPerformance } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiMap, FiAward } from 'react-icons/fi';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAssignedComplaints(), getWorkerPerformance()])
      .then(([c, p]) => {
        setComplaints(c.data);
        const myPerf = p.data.find(w => w.id === user?.id);
        setPerformance(myPerf);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;

  const pending = complaints.filter(c => c.status === 'pending').length;
  const inProgress = complaints.filter(c => c.status === 'in_progress').length;
  const monthlyResolved = performance?.resolved_count || 0;
  const bonusEligible = performance?.bonus_eligible;

  return (
    <div className="page-wrapper animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, background: 'linear-gradient(135deg, var(--text-primary), var(--warning))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Worker Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Welcome, {user?.name}</p>
        </div>
        <Link to="/worker/map" className="btn btn-primary"><FiMap /> Navigate to Complaints</Link>
      </div>

      {bonusEligible && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <FiAward style={{ fontSize: '20px' }} />
          <span>🎉 Congratulations! You've resolved <strong>100+</strong> complaints this month and are eligible for a bonus/increment!</span>
        </div>
      )}

      <div className="grid-4" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Assigned Tasks', value: complaints.length, icon: '📋', color: '#6c5ce7', bg: 'rgba(108,92,231,0.1)' },
          { label: 'Pending', value: pending, icon: '⏳', color: '#fdcb6e', bg: 'rgba(253,203,110,0.1)' },
          { label: 'In Progress', value: inProgress, icon: '🔄', color: '#74b9ff', bg: 'rgba(116,185,255,0.1)' },
          { label: 'This Month', value: monthlyResolved, icon: '✅', color: '#00b894', bg: 'rgba(0,184,148,0.1)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ '--accent-color': s.color, '--icon-bg': s.bg }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Progress */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Monthly Bonus Progress</h3>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Goal: 100 resolutions</span>
        </div>
        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{monthlyResolved} / 100 complaints resolved</span>
          <span style={{ color: bonusEligible ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 700 }}>
            {bonusEligible ? '🏆 Bonus Eligible!' : `${100 - monthlyResolved} more to go`}
          </span>
        </div>
        <div style={{ height: '10px', background: 'var(--bg-tertiary)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min((monthlyResolved / 100) * 100, 100)}%`, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: '999px', transition: 'width 0.6s ease' }} />
        </div>
      </div>

      {/* Assigned Complaints */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Assigned Complaints</h3>
          <Link to="/worker/complaints" className="btn btn-ghost btn-sm">View All</Link>
        </div>
        {complaints.length === 0 ? (
          <div className="empty-state">
            <span>✅</span>
            <h3>All caught up!</h3>
            <p>No complaints assigned to you right now.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Title</th><th>Location</th><th>Priority</th><th>Status</th><th>Reported</th><th></th></tr></thead>
              <tbody>
                {complaints.slice(0, 5).map(c => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.title}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.address || `${c.lat}, ${c.lng}`}</td>
                    <td><span className={`badge badge-${c.priority}`}>{c.priority}</span></td>
                    <td><span className={`badge badge-${c.status}`}>{c.status.replace('_', ' ')}</span></td>
                    <td>{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                    <td><Link to={`/worker/complaints/${c.id}`} className="btn btn-ghost btn-sm">Resolve</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerDashboard;
