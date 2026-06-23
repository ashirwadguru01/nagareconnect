import { useState, useEffect } from 'react';
import { getWorkers, getWorkerPerformance } from '../../services/adminService';
import { FiAward, FiTrendingUp } from 'react-icons/fi';

const AdminWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([getWorkers(), getWorkerPerformance()])
      .then(([w, p]) => { setWorkers(w.data); setPerformance(p.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;

  const bonusWorkers = performance.filter(w => w.bonus_eligible);

  return (
    <div className="page-wrapper animate-fadeIn">
      <div className="page-header">
        <h1>Worker Management</h1>
        <p>{workers.length} municipal workers registered</p>
      </div>

      {bonusWorkers.length > 0 && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <FiAward style={{ fontSize: '20px', flexShrink: 0 }} />
          <span><strong>{bonusWorkers.length} worker(s)</strong> are eligible for bonus this month: {bonusWorkers.map(w => w.name).join(', ')}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('overview')}>Worker Overview</button>
        <button className={`btn btn-sm ${activeTab === 'performance' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('performance')}><FiTrendingUp /> Monthly Performance</button>
      </div>

      {activeTab === 'overview' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Worker</th><th>Email</th><th>Phone</th><th>Assigned</th><th>Resolved</th><th>Status</th></tr></thead>
              <tbody>
                {workers.map(w => (
                  <tr key={w.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #fdcb6e, #e17055)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                          {w.name?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{w.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px' }}>{w.email}</td>
                    <td style={{ fontSize: '13px' }}>{w.phone || '—'}</td>
                    <td style={{ fontWeight: 700 }}>{w.total_assigned || 0}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{w.total_resolved || 0}</td>
                    <td><span className={`badge ${w.is_active ? 'badge-resolved' : 'badge-rejected'}`}>{w.is_active ? 'Active' : 'Disabled'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monthly Performance (Current Month)</h3>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Bonus threshold: 100 resolutions</span>
          </div>
          {performance.map(w => {
            const pct = Math.min(((w.resolved_count || 0) / 100) * 100, 100);
            return (
              <div key={w.id} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{w.name}</span>
                    {w.bonus_eligible && <span className="badge badge-resolved">🏆 Bonus Eligible</span>}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: w.bonus_eligible ? 'var(--primary)' : 'var(--text-secondary)' }}>
                    {w.resolved_count || 0} / 100
                  </span>
                </div>
                <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: w.bonus_eligible ? 'linear-gradient(90deg, var(--primary), var(--accent))' : 'var(--info)', borderRadius: '999px' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminWorkers;
