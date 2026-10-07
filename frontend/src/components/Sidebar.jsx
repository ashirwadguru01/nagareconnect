import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiAlertTriangle, FiPlusCircle, FiGift, FiMap,
  FiUsers, FiBarChart2, FiTruck, FiClipboard, FiLogOut,
  FiShield, FiCheckCircle, FiStar
} from 'react-icons/fi';
import styles from './Sidebar.module.css';

const citizenNav = [
  { to: '/citizen', icon: <FiHome />, label: 'Dashboard' },
  { to: '/citizen/new-complaint', icon: <FiPlusCircle />, label: 'Report Issue' },
  { to: '/citizen/complaints', icon: <FiClipboard />, label: 'My Complaints' },
  { to: '/citizen/rewards', icon: <FiGift />, label: 'Rewards' },
  { to: '/citizen/map', icon: <FiMap />, label: 'Map View' },
];

const workerNav = [
  { to: '/worker', icon: <FiHome />, label: 'Dashboard' },
  { to: '/worker/complaints', icon: <FiClipboard />, label: 'Assigned Tasks' },
  { to: '/worker/map', icon: <FiMap />, label: 'Navigate' },
];

const adminNav = [
  { to: '/admin', icon: <FiBarChart2 />, label: 'Dashboard' },
  { to: '/admin/complaints', icon: <FiAlertTriangle />, label: 'All Complaints' },
  { to: '/admin/users', icon: <FiUsers />, label: 'Citizens' },
  { to: '/admin/workers', icon: <FiTruck />, label: 'Workers' },
  { to: '/admin/map', icon: <FiMap />, label: 'Map View' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems =
    user?.role === 'admin' ? adminNav :
    user?.role === 'worker' ? workerNav :
    citizenNav;

  const roleConfig = {
    admin: { label: 'Admin Portal', icon: <FiShield />, color: '#6c5ce7' },
    worker: { label: 'Worker Portal', icon: <FiTruck />, color: '#fdcb6e' },
    citizen: { label: 'Citizen Portal', icon: <FiStar />, color: '#00b894' },
  };

  const rc = roleConfig[user?.role] || roleConfig.citizen;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>🌿</div>
        <div>
          <div className={styles.logoText}>Nagar</div>
          <div className={styles.logoSub}>e-Connect</div>
        </div>
      </div>

      {/* Role badge */}
      <div className={styles.roleBadge} style={{ '--role-color': rc.color }}>
        <span className={styles.roleIcon}>{rc.icon}</span>
        <span>{rc.label}</span>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navLabel}>Navigation</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.split('/').length <= 2}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navText}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className={styles.userSection}>
        <div className={styles.userAvatar}>
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{user?.name}</div>
          <div className={styles.userEmail}>{user?.email}</div>
        </div>

        <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
          <FiLogOut />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
