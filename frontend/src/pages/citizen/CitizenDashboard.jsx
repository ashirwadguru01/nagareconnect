import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyComplaints } from '../../services/complaintService';
import { getMyPoints, getTransactions } from '../../services/rewardService';
import { useAuth } from '../../context/AuthContext';
import { FiPlusCircle, FiGift, FiStar } from 'react-icons/fi';
import styles from './CitizenDashboard.module.css';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [pointsData, setPointsData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyComplaints(), getMyPoints(), getTransactions()])
      .then(([c, p, t]) => {
        setComplaints(c.data);
        setPointsData(p.data);
        setTransactions(t.data.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper animate-fadeIn">
      <div className={styles.header}>
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p>Track your reported issues and rewards from here.</p>
        </div>
        <Link to="/citizen/new-complaint" className="btn btn-primary">
          <FiPlusCircle /> Report New Issue
        </Link>
      </div>

      <div className={`grid-4 ${styles.statsRow}`}>
        {[
          { label: 'Total Reports', value: stats.total, icon: '📋', color: '#6c5ce7', bg: 'rgba(108,92,231,0.1)' },
          { label: 'Pending', value: stats.pending, icon: '⏳', color: '#fdcb6e', bg: 'rgba(253,203,110,0.1)' },
          { label: 'In Progress', value: stats.inProgress, icon: '🔄', color: '#74b9ff', bg: 'rgba(116,185,255,0.1)' },
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

      <div className={styles.grid}>
        <div className={styles.pointsCard}>
          <div className={styles.pointsHeader}>
            <div>
              <div className={styles.pointsLabel}><FiStar /> Reward Points</div>
              <div className={styles.pointsValue}>{pointsData?.current_points ?? 0}</div>
            </div>
            <Link to="/citizen/rewards" className="btn btn-accent btn-sm"><FiGift /> Redeem</Link>
          </div>
          <div className={styles.pointsStats}>
            <div><span className={styles.ps_label}>Total Earned</span><span className={styles.ps_val}>{pointsData?.total_earned ?? 0}</span></div>
            <div><span className={styles.ps_label}>Redeemed</span><span className={styles.ps_val}>{pointsData?.total_redeemed ?? 0}</span></div>
          </div>
          <div className={styles.pointsTip}>💡 Earn +5 on submission, +20 when resolved</div>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
            <Link to="/citizen/rewards" className={styles.seeAll}>See all</Link>
          </div>
          {transactions.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <span>🎯</span><p>No transactions yet. Start reporting issues!</p>
            </div>
          ) : (
            transactions.map((t) => (
              <div key={t.id} className={styles.txItem}>
                <div className={`${styles.txIcon} ${t.type === 'earned' ? styles.earned : styles.redeemed}`}>{t.type === 'earned' ? '+' : '-'}</div>
                <div className={styles.txInfo}>
                  <div className={styles.txDesc}>{t.description}</div>
                  <div className={styles.txDate}>{new Date(t.created_at).toLocaleDateString('en-IN')}</div>
                </div>
                <div className={`${styles.txPoints} ${t.type === 'earned' ? styles.earnedText : styles.redeemedText}`}>
                  {t.type === 'earned' ? '+' : '-'}{t.points} pts
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Recent Complaints</h3>
          <Link to="/citizen/complaints" className={styles.seeAll}>View all →</Link>
        </div>
        {complaints.length === 0 ? (
          <div className="empty-state">
            <span>🗑️</span>
            <h3>No complaints yet</h3>
            <p>Report your first garbage issue and start earning rewards!</p>
            <Link to="/citizen/new-complaint" className="btn btn-primary" style={{ marginTop: '12px' }}>Report Now</Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Title</th><th>Location</th><th>Status</th><th>Priority</th><th>Date</th><th></th></tr></thead>
              <tbody>
                {complaints.slice(0, 5).map((c) => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.title}</td>
                    <td>{(c.address || `${c.lat?.toFixed(4)}, ${c.lng?.toFixed(4)}`).substring(0, 30)}...</td>
                    <td><span className={`badge badge-${c.status}`}>{c.status.replace('_', ' ')}</span></td>
                    <td><span className={`badge badge-${c.priority}`}>{c.priority}</span></td>
                    <td>{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                    <td><Link to={`/citizen/complaints/${c.id}`} className="btn btn-ghost btn-sm">View</Link></td>
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

export default CitizenDashboard;
