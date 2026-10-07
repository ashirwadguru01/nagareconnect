// ========================================================
// Sidebar Component (Vanilla JS & Web Component)
// ========================================================

const SidebarConfig = {
  roles: {
    admin: { label: 'Admin Portal', icon: 'shield', color: '#6c5ce7' },
    worker: { label: 'Worker Portal', icon: 'truck', color: '#fdcb6e' },
    citizen: { label: 'Citizen Portal', icon: 'star', color: '#00b894' },
  },
  menus: {
    citizen: [
      { to: '/citizen/dashboard.html', icon: 'home', label: 'Dashboard' },
      { to: '/citizen/new-complaint.html', icon: 'plus-circle', label: 'Report Issue' },
      { to: '/citizen/complaints.html', icon: 'clipboard', label: 'My Complaints' },
      { to: '/citizen/rewards.html', icon: 'gift', label: 'Rewards' },
      { to: '/citizen/map.html', icon: 'map', label: 'Map View' },
    ],
    worker: [
      { to: '/worker/dashboard.html', icon: 'home', label: 'Dashboard' },
      { to: '/worker/tasks.html', icon: 'clipboard', label: 'Assigned Tasks' },
      { to: '/worker/map.html', icon: 'map', label: 'Navigate' },
    ],
    admin: [
      { to: '/admin/dashboard.html', icon: 'bar-chart-2', label: 'Dashboard' },
      { to: '/admin/complaints.html', icon: 'alert-triangle', label: 'All Complaints' },
      { to: '/admin/users.html', icon: 'users', label: 'Citizens' },
      { to: '/admin/workers.html', icon: 'truck', label: 'Workers' },
      { to: '/admin/map.html', icon: 'map', label: 'Map View' },
    ],
  },
};

function renderSidebarComponent(container, userOverride = null) {
  const mount = typeof container === 'string' ? document.querySelector(container) : container;
  if (!mount) return;

  const user = userOverride || (typeof getCurrentUser === 'function' ? getCurrentUser() : null) || {
    name: 'Citizen User',
    email: 'citizen@nagareconnect.in',
    role: 'citizen',
  };

  const currentPath = window.location.pathname;
  const role = user.role || 'citizen';
  const roleInfo = SidebarConfig.roles[role] || SidebarConfig.roles.citizen;
  const navItems = SidebarConfig.menus[role] || SidebarConfig.menus.citizen;

  const navHtml = navItems.map((item) => {
    const isActive =
      currentPath.endsWith(item.to) ||
      currentPath === item.to ||
      (item.to.includes('complaints.html') && currentPath.includes('complaint-detail.html'));

    return `
      <a href="${item.to}" class="sidebar-nav-item ${isActive ? 'active' : ''}">
        <span class="nav-icon"><i data-feather="${item.icon}"></i></span>
        <span class="nav-text">${item.label}</span>
      </a>
    `;
  }).join('');

  mount.innerHTML = `
    <button class="mobile-nav-toggle" id="mobile-toggle" aria-label="Toggle Navigation">
      <i data-feather="menu"></i>
    </button>
    <div class="sidebar-backdrop" id="sidebar-backdrop"></div>

    <aside class="sidebar" id="app-sidebar">
      <a href="/" class="sidebar-logo">
        <div class="sidebar-logo-icon">🌿</div>
        <div>
          <div class="sidebar-logo-text">Nagar</div>
          <div class="sidebar-logo-sub">e-Connect</div>
        </div>
      </a>

      <div class="role-badge" data-role="${role}">
        <span class="role-icon"><i data-feather="${roleInfo.icon}"></i></span>
        <span>${roleInfo.label}</span>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-label">Navigation</div>
        ${navHtml}
      </nav>

      <div class="sidebar-user">
        <div class="user-avatar">${(user.name?.[0] || 'U').toUpperCase()}</div>
        <div class="user-info">
          <div class="user-name">${user.name || 'User'}</div>
          <div class="user-email">${user.email || ''}</div>
        </div>
        <button class="logout-btn" id="logout-btn" title="Logout" aria-label="Logout">
          <i data-feather="log-out"></i>
        </button>
      </div>
    </aside>
  `;

  // Attach interactive toggle and logout
  const sidebar = mount.querySelector('#app-sidebar');
  const backdrop = mount.querySelector('#sidebar-backdrop');
  const toggle = mount.querySelector('#mobile-toggle');
  const logoutBtn = mount.querySelector('#logout-btn');

  toggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
    backdrop?.classList.toggle('open');
  });

  backdrop?.addEventListener('click', () => {
    sidebar?.classList.remove('open');
    backdrop?.classList.remove('open');
  });

  logoutBtn?.addEventListener('click', () => {
    if (typeof logout === 'function') {
      logout();
    } else {
      localStorage.removeItem('nagareconnect_token');
      localStorage.removeItem('nagareconnect_user');
      window.location.href = '/login.html';
    }
  });

  if (window.feather) {
    window.feather.replace();
  }
}

// Web Component: <app-sidebar>
class AppSidebarElement extends HTMLElement {
  connectedCallback() {
    renderSidebarComponent(this);
  }
}

if (!customElements.get('app-sidebar')) {
  customElements.define('app-sidebar', AppSidebarElement);
}

// Auto mount if #sidebar-mount exists
document.addEventListener('DOMContentLoaded', () => {
  const mount = document.getElementById('sidebar-mount');
  if (mount && !mount.hasChildNodes()) {
    renderSidebarComponent(mount);
  }
});

// Export for global usage
window.renderSidebar = renderSidebarComponent;
