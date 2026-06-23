import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStats } from '../../services/adminService';
import { getAllComplaints } from '../../services/complaintService';
import { useAuth } from '../../context/AuthContext';
import { FiBell, FiSearch, FiChevronDown, FiClipboard, FiUsers, FiMap, FiEdit2, FiFileText, FiClock, FiRefreshCw, FiCheckCircle, FiShield, FiLock, FiActivity, FiUserCheck } from 'react-icons/fi';
import ProfileModal from '../../components/ProfileModal';
import NotificationBell from '../../components/NotificationBell';

/* SVG Sparkline */
const Sparkline = ({ data }) => {
  if (!data?.length) return null;
  const w = 120, h = 28, max = Math.max(...data, 1);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  return (
    <svg width={w} height={h} style={{ overflow: 'visible', marginTop: 4 }}>
      <polyline fill="none" stroke="#22c55e" strokeWidth="1.5" points={pts} />
    </svg>
  );
};

/* Level Badge */
const LevelBadge = ({ level, unlocked }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
    <div style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${unlocked ? '#22c55e' : 'var(--border)'}`, background: unlocked ? 'rgba(34,197,94,0.1)' : 'var(--bg-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: unlocked ? '#22c55e' : 'var(--text-muted)' }}>
      {unlocked ? <FiShield size={16} /> : <FiLock size={14} />}
    </div>
    <span style={{ fontSize: 9, color: unlocked ? '#22c55e' : 'var(--text-muted)', fontWeight: 700, fontFamily: 'Poppins,sans-serif' }}>Lv. {level}</span>
  </div>
);

const C = { background: 'var(--bg-800)', border: '1px solid var(--border)', borderRadius: 10, fontFamily: 'Poppins,sans-serif', transition: 'background 0.3s ease' };
const scRing = { fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Poppins,sans-serif' };
const scTitle = { fontFamily: 'Poppins,sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.03em' };
const statusColor = { pending: '#f59e0b', in_progress: '#3b82f6', resolved: '#22c55e', rejected: '#ef4444' };

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    Promise.all([getStats(), getAllComplaints({ limit: 5 })])
      .then(([s, c]) => { setStats(s.data); setComplaints(c.data.complaints || []); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-900)' }}>
      <div className="spinner" />
    </div>
  );

  const total = stats.total_complaints || 0;
  const resolved = stats.resolved || 0;
  const pending = stats.pending || 0;
  const inProgress = stats.in_progress || 0;
  const resRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-900)', fontFamily: 'Poppins,sans-serif', transition: 'background 0.3s ease' }}>

      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}

      <style>{`
        .admin-topbar {
          display: flex; align-items: center; padding: 0 24px; gap: 12px; flex-shrink: 0;
          height: 56px; background: var(--bg-800); border-bottom: 1px solid var(--border);
          transition: background 0.3s ease, border-color 0.3s ease;
        }
        .admin-search {
          display: flex; align-items: center; gap: 8px; background: var(--bg-700);
          border: 1px solid var(--border); border-radius: 7px; padding: 6px 12px; width: 200px;
        }
        .admin-stats-row {
          display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;
        }
        .admin-row-2 {
          display: grid; grid-template-columns: 250px 1fr 250px; gap: 12px;
        }
        .admin-row-3 {
          display: grid; grid-template-columns: 1fr 1fr 250px; gap: 12px;
        }
        .quick-actions-grid {
          display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;
        }
        @media (max-width: 1200px) {
          .admin-row-2 { grid-template-columns: 200px 1fr 200px; }
          .admin-row-3 { grid-template-columns: 1fr 1fr 200px; }
        }
        @media (max-width: 992px) {
          .admin-stats-row { grid-template-columns: repeat(3, 1fr); }
          .admin-row-2 { grid-template-columns: 1fr; }
          .admin-row-3 { grid-template-columns: 1fr; }
          .quick-actions-grid { grid-template-columns: 1fr 1fr 1fr; }
        }
        @media (max-width: 768px) {
          .admin-topbar { height: auto; padding: 12px 16px; flex-wrap: wrap; }
          .admin-search { display: none; }
          .admin-stats-row { grid-template-columns: repeat(2, 1fr); }
          .quick-actions-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .admin-stats-row { grid-template-columns: repeat(2, 1fr); gap: 8px; }
        }
      `}</style>

      {/* ── Topbar ── */}
      <div className="admin-topbar">
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Poppins,sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Admin Dashboard</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Poppins,sans-serif' }}>Hello, {user?.name} — city-wide complaint overview</div>
        </div>
        <div className="admin-search">
          <FiSearch size={12} color="var(--text-muted)" />
          <input placeholder="Search complaints..." style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-secondary)', fontSize: 12, width: '100%', fontFamily: 'Poppins,sans-serif' }} />
        </div>
        {/* Live notification bell */}
        <NotificationBell />
        <button
          onClick={() => setProfileOpen(true)}
          title="Edit your profile"
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '4px 10px',
            background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: 7,
            cursor: 'pointer',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e55'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(34,197,94,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000', position: 'relative' }}>
            {user?.name?.[0]}
            <span style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: '50%', background: 'var(--bg-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiEdit2 size={6} color="#22c55e" />
            </span>
          </div>
          <FiChevronDown size={11} color="var(--text-muted)" />
        </button>
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Row 1 — Stats bar */}
        <div className="admin-stats-row">
          {[
            { label: 'Total Reports', value: total,      icon: <FiFileText size={14} />,     color: '#64748b' },
            { label: 'Pending',       value: pending,    icon: <FiClock size={14} />,         color: '#f59e0b' },
            { label: 'In Progress',   value: inProgress, icon: <FiRefreshCw size={14} />,    color: '#3b82f6' },
            { label: 'Resolved',      value: resolved,   icon: <FiCheckCircle size={14} />,  color: '#22c55e' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: 'clamp(14px, 3vw, 18px) clamp(12px, 3vw, 20px)',
              background: 'var(--bg-800)', border: '1px solid var(--border)',
              borderRadius: '12px', borderBottom: `3px solid ${s.color}`,
              transition: 'background 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8, color: s.color }}>
                {s.icon}
                <span style={{ ...scRing }}>{s.label}</span>
              </div>
              <div style={{ fontFamily: 'Poppins,sans-serif', fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
          <div style={{
            padding: 'clamp(14px, 3vw, 14px) clamp(12px, 3vw, 16px)',
            background: 'var(--bg-800)', border: '1px solid var(--border)',
            borderRadius: '12px', borderBottom: '3px solid #22c55e',
            gridColumn: 'auto', transition: 'background 0.3s ease'
          }}>
            <div style={scRing}>RESOLUTION RATE</div>
            <div style={{ fontFamily: 'Poppins,sans-serif', fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 2 }}>{resRate}%</div>
            <Sparkline data={[2, 5, 3, 8, 6, 10, resRate]} />
          </div>
        </div>

        {/* Row 2 — Status | Complaints | Timeline */}
        <div className="admin-row-2">

          {/* Status Overview */}
          <div style={{ ...C, padding: '16px' }}>
            <div style={{ ...scTitle, marginBottom: 14 }}>Status Overview</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { l: 'Resolved', v: resolved, c: '#22c55e' },
                { l: 'Pending', v: pending, c: '#f59e0b' },
                { l: 'In Progress', v: inProgress, c: '#3b82f6' },
              ].map(x => (
                <div key={x.l}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: x.c, display: 'inline-block' }} />
                      {x.l}
                    </span>
                    <span style={{ fontSize: 12, fontFamily: 'Poppins,sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}>{x.v} ({total > 0 ? Math.round((x.v / total) * 100) : 0}%)</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--bg-600)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${total > 0 ? (x.v / total) * 100 : 0}%`, background: x.c, borderRadius: 3, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 6, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total</span>
                <span style={{ fontSize: 13, fontFamily: 'Poppins,sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}>{total}</span>
              </div>
            </div>
          </div>

          {/* Recent complaints table */}
          <div style={{ ...C, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={scTitle}>Recent Complaints</span>
              <Link to="/admin/complaints" style={{ fontSize: 12, color: '#22c55e', fontWeight: 600, fontFamily: 'Poppins,sans-serif' }}>View all</Link>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'var(--bg-700)' }}>
                  {['#', 'Title', 'Location', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', fontFamily: 'Poppins,sans-serif' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 28, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Poppins,sans-serif' }}>No complaints yet</td></tr>
                ) : complaints.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 ? 'var(--bg-700)' : 'transparent' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text-muted)', fontFamily: 'Poppins,sans-serif' }}>{i + 1}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text-primary)', fontWeight: 500, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Poppins,sans-serif' }}>{c.title}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text-secondary)', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11, fontFamily: 'Poppins,sans-serif' }}>{c.address || `${Number(c.lat)?.toFixed(2)}, ${Number(c.lng)?.toFixed(2)}`}</td>
                    <td style={{ padding: '9px 12px' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, textTransform: 'capitalize', background: `${statusColor[c.status]}18`, color: statusColor[c.status], border: `1px solid ${statusColor[c.status]}35`, fontFamily: 'Poppins,sans-serif' }}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '9px 12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontFamily: 'Poppins,sans-serif' }}>{new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)' }}>
              <Link to="/admin/complaints" style={{ fontSize: 12, color: '#22c55e', fontWeight: 600, fontFamily: 'Poppins,sans-serif' }}>View All Complaints →</Link>
            </div>
          </div>

          {/* Activity Timeline */}
          <div style={{ ...C, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={scTitle}>Activity Timeline</span>
              <Link to="/admin/complaints" style={{ fontSize: 12, color: '#22c55e', fontWeight: 600, fontFamily: 'Poppins,sans-serif' }}>View all</Link>
            </div>
            {[
              { icon: <FiFileText size={13} />,    iconColor: '#94a3b8', t: 'Total Complaints Filed', s: `${total} complaints overall`,       v: 'System' },
              { icon: <FiClock size={13} />,        iconColor: '#f59e0b', t: 'Pending Review',         s: `${pending} awaiting assignment`,    v: 'Now' },
              { icon: <FiRefreshCw size={13} />,   iconColor: '#3b82f6', t: 'In Progress',             s: `${inProgress} being worked on`,     v: 'Active' },
              { icon: <FiCheckCircle size={13} />, iconColor: '#22c55e', t: 'Resolved',                s: `${resolved} closed successfully`,   v: `${resRate}%` },
            ].map((item, i, arr) => (
              <div key={i} style={{ display: 'flex', gap: 10, paddingBottom: i < arr.length - 1 ? 14 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--bg-700)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: item.iconColor }}>{item.icon}</div>
                  {i < arr.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--border)', marginTop: 4 }} />}
                </div>
                <div style={{ paddingTop: 3 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 1, fontFamily: 'Poppins,sans-serif' }}>{item.t}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'Poppins,sans-serif' }}>{item.s}</div>
                  <div style={{ fontSize: 10, color: '#22c55e', marginTop: 2, fontWeight: 700, fontFamily: 'Poppins,sans-serif' }}>{item.v}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 3 — Worker Performance | Quick Actions | Today's Impact */}
        <div className="admin-row-3">

          {/* Worker Performance */}
          <div style={{ ...C, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={scTitle}>Worker Performance</span>
              <Link to="/admin/workers" style={{ fontSize: 12, color: '#22c55e', fontWeight: 600, fontFamily: 'Poppins,sans-serif' }}>View all</Link>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'Poppins,sans-serif' }}>Level 1</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Poppins,sans-serif' }}>{resolved} / {Math.max(total, 20)} pts</span>
              </div>
              <div style={{ height: 6, background: 'var(--bg-600)', borderRadius: 3, overflow: 'hidden', marginBottom: 18 }}>
                <div style={{ height: '100%', width: `${Math.min((resolved / Math.max(total, 1)) * 100, 100)}%`, background: '#22c55e', borderRadius: 3, transition: '0.5s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                {[1, 2, 3, 4, 5].map(l => <LevelBadge key={l} level={l} unlocked={l === 1} />)}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ ...C, padding: 16 }}>
            <div style={{ ...scTitle, marginBottom: 14 }}>Quick Actions</div>
            <div className="quick-actions-grid">
              {[
                { icon: <FiClipboard size={18} />, label: 'All Complaints', sub: 'Manage & assign', color: '#22c55e', to: '/admin/complaints' },
                { icon: <FiUsers size={18} />, label: 'Manage Users', sub: 'Citizens & roles', color: '#3b82f6', to: '/admin/users' },
                { icon: <FiMap size={18} />, label: 'City Map', sub: 'Live heatmap', color: '#8b5cf6', to: '/admin/map' },
              ].map((a, i) => (
                <Link key={i} to={a.to} style={{ textDecoration: 'none', padding: '14px 12px', background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'Poppins,sans-serif', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = a.color}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <div style={{ color: a.color }}>{a.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Poppins,sans-serif' }}>{a.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Poppins,sans-serif' }}>{a.sub}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Today's Impact */}
          <div style={{ ...C, padding: 16 }}>
            <div style={{ ...scTitle, marginBottom: 14 }}>Today's Impact</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: <FiCheckCircle size={18} />, label: 'Issues Resolved',  val: resolved,                  color: '#22c55e' },
                { icon: <FiActivity size={18} />,    label: 'Avg. Resolution',   val: '-- hrs',                  color: '#3b82f6' },
                { icon: <FiUserCheck size={18} />,   label: 'Active Workers',    val: stats.total_workers || 0,  color: '#f59e0b' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: 8, transition: 'background 0.3s ease' }}>
                  <span style={{ color: item.color }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700, fontFamily: 'Poppins,sans-serif' }}>{item.label}</div>
                    <div style={{ fontFamily: 'Poppins,sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{item.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
