import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAllRead, markOneRead } from '../services/notificationService';

const typeStyle = {
  complaint: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  resolved:  { color: '#22c55e', bg: 'rgba(34,197,94,0.1)'  },
  warning:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)'  },
  info:      { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
};

const BellIcon = ({ count }) => (
  <div style={{ position: 'relative', display: 'inline-flex' }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
    {count > 0 && (
      <span style={{
        position: 'absolute', top: -6, right: -6,
        minWidth: 16, height: 16, borderRadius: 8,
        background: '#ef4444', fontSize: 9, fontWeight: 700,
        color: '#fff', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '0 3px',
        animation: 'pulse 2s infinite',
      }}>{count > 9 ? '9+' : count}</span>
    )}
  </div>
);

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationBell = () => {
  const [notifs, setNotifs]     = useState([]);
  const [open, setOpen]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const dropRef                 = useRef(null);
  const navigate                = useNavigate();

  const load = useCallback(async () => {
    try {
      const res = await getNotifications();
      setNotifs(res.data);
    } catch (_) {}
  }, []);

  // Poll every 30 seconds
  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifs.filter(n => !n.is_read).length;

  const handleMarkAll = async () => {
    setLoading(true);
    await markAllRead();
    setNotifs(prev => prev.map(n => ({ ...n, is_read: 1 })));
    setLoading(false);
  };

  const handleClick = async (notif) => {
    if (!notif.is_read) {
      await markOneRead(notif.id);
      setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: 1 } : n));
    }
    setOpen(false);
    if (notif.complaint_id) navigate(`/admin/complaints`);
  };

  return (
    <div ref={dropRef} style={{ position: 'relative', flexShrink: 0 }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.15); }
        }
        @keyframes notifSlide {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Bell Button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Notifications"
        style={{
          width: 34, height: 34, borderRadius: 8,
          background: open ? 'var(--bg-hover)' : 'var(--bg-700)',
          border: `1px solid ${open ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-secondary)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)'; e.currentTarget.style.color = '#22c55e'; }}
        onMouseLeave={e => {
          if (!open) {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }
        }}
      >
        <BellIcon count={unread} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
          width: 340, maxHeight: 420, overflowY: 'auto',
          background: 'var(--bg-800)', border: '1px solid var(--border)',
          borderRadius: 14, boxShadow: 'var(--shadow-lg)',
          zIndex: 500, animation: 'notifSlide 0.2s ease',
          fontFamily: 'Poppins, sans-serif',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 16px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0,
            background: 'var(--bg-800)', borderRadius: '14px 14px 0 0',
          }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Notifications</span>
              {unread > 0 && (
                <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: '#22c55e',
                  background: 'rgba(34,197,94,0.1)', padding: '2px 7px', borderRadius: 99 }}>
                  {unread} new
                </span>
              )}
            </div>
            {unread > 0 && (
              <button onClick={handleMarkAll} disabled={loading}
                style={{ fontSize: 11, color: '#22c55e', background: 'none', border: 'none',
                  cursor: 'pointer', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          {notifs.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No notifications yet
            </div>
          ) : notifs.map(n => {
            const ts = typeStyle[n.type] || typeStyle.info;
            return (
              <div key={n.id} onClick={() => handleClick(n)}
                style={{
                  display: 'flex', gap: 12, padding: '12px 16px',
                  cursor: 'pointer', borderBottom: '1px solid var(--border)',
                  background: n.is_read ? 'transparent' : 'rgba(34,197,94,0.04)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(34,197,94,0.04)'}
              >
                {/* Dot */}
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  background: ts.bg, color: ts.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                }}>
                  {n.type === 'complaint' ? '📋' : n.type === 'resolved' ? '✅' : n.type === 'warning' ? '❌' : '🔔'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: n.is_read ? 500 : 700, color: 'var(--text-primary)' }}>
                      {n.title}
                    </span>
                    {!n.is_read && (
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', flexShrink: 0, marginTop: 4 }} />
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                    {timeAgo(n.created_at)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
