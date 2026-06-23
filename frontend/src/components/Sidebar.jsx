import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FiHome, FiPlus, FiList, FiMap, FiGift,
  FiBriefcase, FiLogOut, FiClipboard, FiUsers, FiGrid, FiAward, FiMenu, FiX,
} from 'react-icons/fi';
import styles from './Sidebar.module.css';
import NotificationBell from './NotificationBell';

const navByCitizen = [
  { to: '/citizen',               icon: <FiHome size={15} />,      label: 'Dashboard' },
  { to: '/citizen/new-complaint', icon: <FiPlus size={15} />,      label: 'Report Issue' },
  { to: '/citizen/complaints',    icon: <FiList size={15} />,      label: 'My Complaints' },
  { to: '/citizen/map',           icon: <FiMap size={15} />,       label: 'Live Map' },
  { to: '/citizen/rewards',       icon: <FiGift size={15} />,      label: 'Rewards' },
];

const navByWorker = [
  { to: '/worker',            icon: <FiHome size={15} />,      label: 'Dashboard' },
  { to: '/worker/complaints', icon: <FiClipboard size={15} />, label: 'Assigned Tasks' },
  { to: '/worker/appraisal',  icon: <FiAward size={15} />,    label: 'Appraisal' },
  { to: '/worker/map',        icon: <FiMap size={15} />,       label: 'Navigate' },
];

const navByAdmin = [
  { to: '/admin',             icon: <FiHome size={15} />,      label: 'Dashboard' },
  { to: '/admin/complaints',  icon: <FiClipboard size={15} />, label: 'Complaints' },
  { to: '/admin/users',       icon: <FiUsers size={15} />,     label: 'Citizens' },
  { to: '/admin/workers',     icon: <FiBriefcase size={15} />, label: 'Workers' },
  { to: '/admin/appraisals',  icon: <FiAward size={15} />,    label: 'Appraisals' },
  { to: '/admin/map',         icon: <FiMap size={15} />,       label: 'City Map' },
];

const dashboardByRole = { admin: '/admin', worker: '/worker', citizen: '/citizen' };

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const dropRef = useRef(null);

  const navItems  = user?.role === 'admin' ? navByAdmin
    : user?.role === 'worker' ? navByWorker
    : navByCitizen;

  const roleColor = user?.role === 'admin' ? '#f59e0b'
    : user?.role === 'worker' ? '#3b82f6' : '#22c55e';

  const dashPath  = dashboardByRole[user?.role] || '/';

  // Close dropdown on outside click
  const handleBlur = (e) => {
    if (!dropRef.current?.contains(e.relatedTarget)) setDropOpen(false);
  };

  // Close mobile menu on route change
  const closeMobile = () => setMenuOpen(false);

  // Close mobile menu on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setMenuOpen(false); setDropOpen(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <header className={styles.topNav}>
        {/* ── Brand → Dashboard ── */}
        <button
          className={styles.brand}
          onClick={() => { navigate('/'); closeMobile(); }}
          title="Go to Homepage"
        >
          <div className={styles.brandDot} />
          <div>
            <div className={styles.brandName}>Nagar e-Connect</div>
            <div className={styles.brandSub}>Swachh Bharat Initiative</div>
          </div>
        </button>

        {/* ── Desktop Nav links ── */}
        <nav className={styles.nav}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split('/').length === 2}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* ── Theme toggle (SVG sun/moon) ── */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            background: 'none', border: '1px solid var(--border)', borderRadius: '8px',
            cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'var(--text-secondary)',
            transition: 'all 0.2s', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.color = '#22c55e'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          {theme === 'dark' ? (
            /* Sun icon for switching to light */
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            /* Moon icon for switching to dark */
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        {/* ── Notification Bell ── */}
        <NotificationBell />

        {/* ── Hamburger button (mobile) ── */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          title={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
        </button>

        {/* ── User dropdown ── */}
        <div
          className={styles.userBlock}
          ref={dropRef}
          tabIndex={0}
          onBlur={handleBlur}
          onClick={() => setDropOpen(o => !o)}
          title="Account menu"
        >
          <div
            className={styles.userAvatar}
            style={{ borderColor: roleColor, color: roleColor }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.name}</div>
            <div className={styles.userRole} style={{ color: roleColor }}>
              {user?.role}
              {user?.role === 'citizen' && user?.points != null ? ` · ${user.points} pts` : ''}
            </div>
          </div>

          {/* Desktop dropdown */}
          {dropOpen && (
            <div className={styles.dropdown}>
              <button
                className={styles.dropItem}
                onMouseDown={() => { navigate(dashPath); setDropOpen(false); }}
              >
                <FiGrid size={13} />
                Dashboard
              </button>
              <div className={styles.dropDivider} />
              <button
                className={`${styles.dropItem} ${styles.dropDanger}`}
                onMouseDown={() => { logout(); navigate('/'); }}
              >
                <FiLogOut size={13} />
                Log out
              </button>
            </div>
          )}
        </div>

        <style>{`
          @keyframes topGlow {
            0%,100% { box-shadow: 0 0 6px #22c55e; }
            50%      { box-shadow: 0 0 14px #22c55e; }
          }
          @keyframes dropFade {
            from { opacity: 0; transform: translateY(-6px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </header>

      {/* ── Mobile overlay ── */}
      {menuOpen && (
        <div
          className={styles.overlay}
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile nav panel ── */}
      {menuOpen && (
        <nav className={styles.mobileNav}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split('/').length === 2}
              className={({ isActive }) =>
                `${styles.mobileNavItem} ${isActive ? styles.active : ''}`
              }
              onClick={closeMobile}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className={styles.mobileDivider} />

          {/* User info row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 16px', marginBottom: '4px',
          }}>
            <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: `2px solid ${roleColor}`,
            background: 'var(--bg-700)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700, color: roleColor,
            fontFamily: 'Poppins, sans-serif',
            flexShrink: 0,
          }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Poppins, sans-serif' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '11px', color: roleColor, textTransform: 'capitalize', fontFamily: 'Poppins, sans-serif' }}>
                {user?.role}
                {user?.role === 'citizen' && user?.points != null ? ` · ${user.points} pts` : ''}
              </div>
            </div>
          </div>

          <button
            className={styles.mobileLogout}
            onClick={() => { logout(); navigate('/'); closeMobile(); }}
          >
            <FiLogOut size={15} />
            Log out
          </button>
        </nav>
      )}
    </>
  );
};

export default Sidebar;
