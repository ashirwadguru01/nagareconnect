import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyComplaints } from '../../services/complaintService';
import { getMyPoints, getTransactions } from '../../services/rewardService';
import { useAuth } from '../../context/AuthContext';
import { FiPlus, FiArrowUpRight } from 'react-icons/fi';

const statusColor = {
  pending:     '#f59e0b',
  in_progress: '#3b82f6',
  resolved:    '#22c55e',
  rejected:    '#ef4444',
};
const priorityColor = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };
const S = { fontFamily: 'Poppins, sans-serif' };

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints]     = useState([]);
  const [pointsData, setPointsData]     = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);

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
    total:      complaints.length,
    pending:    complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in_progress').length,
    resolved:   complaints.filter(c => c.status === 'resolved').length,
  };

  if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px) clamp(14px, 4vw, 36px)', maxWidth: 1200, ...S, animation: 'pageFadeIn 0.4s ease' }}>

      {/* Responsive styles injected */}
      <style>{`
        .citizen-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .citizen-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .citizen-mid {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }
        .citizen-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .citizen-table .col-loc,
        .citizen-table .col-pri,
        .citizen-table .col-date { display: table-cell; }

        @media (max-width: 900px) {
          .citizen-stats { grid-template-columns: repeat(2, 1fr); }
          .citizen-mid   { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
          .citizen-stats { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .citizen-table .col-loc,
          .citizen-table .col-pri,
          .citizen-table .col-date { display: none; }
          .citizen-table td, .citizen-table th { padding: 10px 10px !important; }
        }
      `}</style>

      {/* Header */}
      <div className="citizen-header">
        <div>
          <h1 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px', ...S }}>
            My Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', ...S }}>
            Hello, {user?.name?.split(' ')[0]} — here's your activity overview
          </p>
        </div>
        <Link to="/citizen/new-complaint" style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          padding: '10px 18px', background: '#22c55e', color: '#000',
          borderRadius: '10px', fontSize: '14px', fontWeight: 700,
          textDecoration: 'none', ...S,
          boxShadow: '0 4px 16px rgba(34,197,94,0.3)',
          transition: 'all 0.2s', flexShrink: 0,
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#16a34a'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#22c55e'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <FiPlus size={15} /> Report Issue
        </Link>
      </div>

      {/* Stat cards — 4 col desktop, 2 col tablet/mobile */}
      <div className="citizen-stats">
        {[
          { label: 'Total Reports', value: stats.total,      color: '#f1f5f9' },
          { label: 'Pending',       value: stats.pending,    color: '#f59e0b' },
          { label: 'In Progress',   value: stats.inProgress, color: '#3b82f6' },
          { label: 'Resolved',      value: stats.resolved,   color: '#22c55e' },
        ].map((s, i) => (
          <div key={i} style={{
            padding: 'clamp(14px, 3vw, 22px) clamp(12px, 3vw, 24px)',
            background: '#0f1318',
            border: '1px solid #1e2530',
            borderRadius: '14px',
            borderBottom: `3px solid ${s.color}`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px', ...S }}>
              {s.label}
            </div>
            <div style={{ fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 700, color: s.color, lineHeight: 1, ...S }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Points + Transactions — side by side desktop, stacked mobile */}
      <div className="citizen-mid">

        {/* Points panel */}
        <div style={{ background: '#0f1318', border: '1px solid #1e2530', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', ...S }}>
            Reward Points
          </p>
          <div style={{ fontSize: '52px', fontWeight: 700, color: '#22c55e', lineHeight: 1, ...S }}>
            {pointsData?.current_points ?? 0}
          </div>
          <div style={{ borderTop: '1px solid #1e2530', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[['Total Earned', `+${pointsData?.total_earned ?? 0}`, '#22c55e'], ['Redeemed', `-${pointsData?.total_redeemed ?? 0}`, '#ef4444']].map(([l, v, c]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b', ...S }}>{l}</span>
                <span style={{ color: c, fontWeight: 700, ...S }}>{v}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: '#475569', background: '#080b0f', borderRadius: '8px', padding: '8px 10px', lineHeight: 1.5, ...S }}>
            +5 pts on submit · +20 pts when resolved
          </p>
          <Link to="/citizen/rewards" style={{
            textAlign: 'center', padding: '10px', border: '1px solid #22c55e',
            borderRadius: '8px', color: '#22c55e', fontSize: '13px', fontWeight: 600,
            textDecoration: 'none', transition: 'background 0.2s', ...S,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            Redeem Points
          </Link>
        </div>

        {/* Recent transactions */}
        <div style={{ background: '#0f1318', border: '1px solid #1e2530', borderRadius: '14px', overflow: 'hidden', minWidth: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2530', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#f1f5f9', ...S }}>Point Activity</span>
            <Link to="/citizen/rewards" style={{ fontSize: '13px', color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', ...S }}>
              View all <FiArrowUpRight size={13} />
            </Link>
          </div>
          {transactions.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', fontSize: '14px', color: '#475569', ...S }}>
              No activity yet. Report your first issue to earn points.
            </div>
          ) : transactions.map((t, i) => (
            <div key={t.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '13px 20px', borderBottom: i < transactions.length - 1 ? '1px solid #0f1318' : 'none',
              background: i % 2 === 0 ? 'transparent' : '#080b0f',
              minWidth: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                  background: t.type === 'earned' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${t.type === 'earned' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 700,
                  color: t.type === 'earned' ? '#22c55e' : '#ef4444',
                }}>
                  {t.type === 'earned' ? '+' : '-'}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: '13px', color: '#d1d5db', fontWeight: 500, ...S, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</p>
                  <p style={{ fontSize: '11px', color: '#475569', ...S }}>
                    {new Date(t.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: t.type === 'earned' ? '#22c55e' : '#ef4444', ...S, flexShrink: 0, marginLeft: '8px' }}>
                {t.type === 'earned' ? '+' : '-'}{t.points}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complaints table */}
      <div style={{ background: '#0f1318', border: '1px solid #1e2530', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2530', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: '#f1f5f9', ...S }}>My Complaints</span>
          <Link to="/citizen/complaints" style={{ fontSize: '13px', color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', ...S }}>
            View all <FiArrowUpRight size={13} />
          </Link>
        </div>

        {complaints.length === 0 ? (
          <div style={{ padding: '56px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#64748b', marginBottom: '8px', ...S }}>No complaints yet</div>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px', ...S }}>Report your first garbage issue and earn 5 points</p>
            <Link to="/citizen/new-complaint" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '10px 20px', background: '#22c55e', color: '#000',
              borderRadius: '8px', fontSize: '14px', fontWeight: 700, textDecoration: 'none', ...S,
            }}>
              <FiPlus size={14} /> Report Now
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="citizen-table">
              <thead>
                <tr style={{ background: '#080b0f' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #1e2530', ...S }}>#</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #1e2530', ...S }}>Title</th>
                  <th className="col-loc" style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #1e2530', ...S }}>Location</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #1e2530', ...S }}>Status</th>
                  <th className="col-pri" style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #1e2530', ...S }}>Priority</th>
                  <th className="col-date" style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #1e2530', ...S }}>Date</th>
                  <th style={{ padding: '10px 16px', borderBottom: '1px solid #1e2530' }}></th>
                </tr>
              </thead>
              <tbody>
                {complaints.slice(0, 6).map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #1e2530', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#161b23'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', color: '#475569', ...S }}>#{c.id}</td>
                    <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...S }}>{c.title}</td>
                    <td className="col-loc" style={{ padding: '12px 16px', color: '#64748b', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...S }}>
                      {c.address ? c.address.substring(0, 35) : `${parseFloat(c.lat).toFixed(3)}, ${parseFloat(c.lng).toFixed(3)}`}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: statusColor[c.status], fontWeight: 600, textTransform: 'capitalize', ...S }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor[c.status], display: 'inline-block', flexShrink: 0 }} />
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="col-pri" style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', color: priorityColor[c.priority], textTransform: 'capitalize', fontWeight: 700, ...S }}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="col-date" style={{ padding: '12px 16px', color: '#475569', whiteSpace: 'nowrap', ...S }}>
                      {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Link to={`/citizen/complaints/${c.id}`} style={{ fontSize: '12px', color: '#22c55e', fontWeight: 600, ...S }}>View</Link>
                    </td>
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
