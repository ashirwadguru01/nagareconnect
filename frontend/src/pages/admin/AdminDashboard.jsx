import { useState, useEffect } from 'react';
import { getStats } from '../../services/adminService';
import { getAllComplaints } from '../../services/complaintService';
import { FiAlertTriangle, FiUsers, FiTruck, FiCheckCircle } from 'react-icons/fi';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getAllComplaints({ limit: 5, page: 1 })])
      .then(([s, c]) => { setStats(s.data); setRecentComplaints(c.data.complaints); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;

  const resolutionRate = stats.total_complaints > 0
    ? Math.round((stats.resolved / stats.total_complaints) * 100) : 0;

  return (
    <div className="page-wrapper animate-fadeIn">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>City-wide complaint management and analytics</p>
      </div>

      <div className="grid-4" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Total Complaints', value: stats.total_complaints, icon: '📋', color: '#6c5ce7', bg: 'rgba(108,92,231,0.1)' },
          { label: 'Pending', value: stats.pending, icon: '⏳', color: '#fdcb6e', bg: 'rgba(253,203,110,0.1)' },
          { label: 'In Progress', value: stats.in_progress, icon: '🔄', color: '#74b9ff', bg: 'rgba(116,185,255,0.1)' },
          { label: 'Resolved', value: stats.resolved, icon: '✅', color: '#00b894', bg: 'rgba(0,184,148,0.1)' },
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

      <div className={styles.row}>
        {/* Resolution Rate */}
        <div className="card" style={{ flex: '0 0 280px' }}>
          <h3 className="card-title" style={{ marginBottom: '20px' }}>Resolution Rate</h3>
          <div className={styles.donutWrap}>
            <svg viewBox="0 0 100 100" className={styles.donut}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg-tertiary)" strokeWidth="12" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--primary)" strokeWidth="12"
                strokeDasharray={`${resolutionRate * 2.51} 251`} strokeLinecap="round" transform="rotate(-90 50 50)" />
            </svg>
            <div className={styles.donutText}>
              <span className={styles.donutVal}>{resolutionRate}%</span>
              <span className={styles.donutLabel}>Resolved</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 800 }}>{stats.total_citizens}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Citizens</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 800 }}>{stats.total_workers}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Workers</div>
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="card" style={{ flex: 1 }}>
          <h3 className="card-title" style={{ marginBottom: '20px' }}>Monthly Complaints Trend</h3>
          <div className={styles.barChart}>
            {stats.monthly?.map((m, i) => {
              const maxCount = Math.max(...stats.monthly.map(x => x.count), 1);
              return (
                <div key={i} className={styles.barItem}>
                  <div className={styles.barWrap}>
                    <div className={styles.bar} style={{ height: `${(m.count / maxCount) * 100}%` }} />
                  </div>
                  <div className={styles.barLabel}>{m.month.substring(5)}</div>
                  <div className={styles.barVal}>{m.count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Recent Complaints</h3>
          <a href="/admin/complaints" className="btn btn-ghost btn-sm">View All</a>
        </div>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>#</th><th>Title</th><th>Citizen</th><th>Worker</th><th>Status</th><th>Priority</th><th>Date</th></tr></thead>
            <tbody>
              {recentComplaints.map(c => (
                <tr key={c.id}>
                  <td style={{ color: 'var(--text-muted)' }}>#{c.id}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.title}</td>
                  <td>{c.citizen_name}</td>
                  <td>{c.worker_name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                  <td><span className={`badge badge-${c.status}`}>{c.status.replace('_', ' ')}</span></td>
                  <td><span className={`badge badge-${c.priority}`}>{c.priority}</span></td>
                  <td>{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
