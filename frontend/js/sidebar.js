// Nagar e-Connect - Responsive Sidebar Component

function renderSidebar() {
  const mount = document.getElementById('sidebar-mount');
  if (!mount) return;

  const user = getCurrentUser() || { name: 'User', email: '', role: 'citizen' };
  const currentPath = window.location.pathname;

  const roleConfig = {
    admin: { label: 'Admin Portal', icon: 'shield', color: '#6c5ce7' },
    worker: { label: 'Worker Portal', icon: 'truck', color: '#fdcb6e' },
    citizen: { label: 'Citizen Portal', icon: 'star', color: '#00b894' },
  };

  const citizenNav = [
    { to: '/citizen/dashboard.html', icon: 'home', label: 'Dashboard' },
    { to: '/citizen/new-complaint.html', icon: 'plus-circle', label: 'Report Issue' },
    { to: '/citizen/complaints.html', icon: 'clipboard', label: 'My Complaints' },
    { to: '/citizen/rewards.html', icon: 'gift', label: 'Rewards' },
    { to: '/citizen/map.html', icon: 'map', label: 'Map View' },
  ];

  const workerNav = [
    { to: '/worker/dashboard.html', icon: 'home', label: 'Dashboard' },
    { to: '/worker/tasks.html', icon: 'clipboard', label: 'Assigned Tasks' },
    { to: '/worker/map.html', icon: 'map', label: 'Navigate' },
  ];

  const adminNav = [
    { to: '/admin/dashboard.html', icon: 'bar-chart-2', label: 'Dashboard' },
    { to: '/admin/complaints.html', icon: 'alert-triangle', label: 'All Complaints' },
    { to: '/admin/users.html', icon: 'users', label: 'Citizens' },
    { to: '/admin/workers.html', icon: 'truck', label: 'Workers' },
    { to: '/admin/map.html', icon: 'map', label: 'Map View' },
  ];

  const navItems = user.role === 'admin' ? adminNav : user.role === 'worker' ? workerNav : citizenNav;
  const rc = roleConfig[user.role] || roleConfig.citizen;

  const navHtml = navItems.map(item => {
    // Check if active
    const isActive = currentPath.endsWith(item.to) || (currentPath === item.to) ||
      (item.to.includes('complaints.html') && currentPath.includes('complaint-detail.html'));
    return `
      <a href="${item.to}" class="sidebar-nav-item ${isActive ? 'active' : ''}">
        <span class="nav-icon"><i data-feather="${item.icon}"></i></span>
        <span class="nav-text">${item.label}</span>
      </a>
    `;
  }).join('');

  mount.innerHTML = `
    <!-- Mobile toggle button -->
    <button class="mobile-nav-toggle" id="mobile-toggle" aria-label="Toggle Navigation">
      <i data-feather="menu"></i>
    </button>
    <div class="sidebar-backdrop" id="sidebar-backdrop"></div>

    <aside class="sidebar" id="app-sidebar">
      <!-- Logo -->
      <a href="/" class="sidebar-logo">
        <div class="sidebar-logo-icon">🌿</div>
        <div>
          <div class="sidebar-logo-text">Nagar</div>
          <div class="sidebar-logo-sub">e-Connect</div>
        </div>
      </a>

      <!-- Role Badge -->
      <div class="role-badge" data-role="${user.role}">
        <span class="role-icon"><i data-feather="${rc.icon}"></i></span>
        <span>${rc.label}</span>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <div class="nav-section-label">Navigation</div>
        ${navHtml}
      </nav>

      <!-- User Profile & Logout -->
      <div class="sidebar-user">
        <div class="user-avatar">
          ${(user.name?.[0] || 'U').toUpperCase()}
        </div>
        <div class="user-info">
          <div class="user-name">${user.name || 'User'}</div>
          <div class="user-email">${user.email || ''}</div>
        </div>
        <button class="logout-btn" id="logout-btn" title="Logout">
          <i data-feather="log-out"></i>
        </button>
      </div>
    </aside>
  `;

  // Attach event handlers
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    logout();
  });

  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const toggle = document.getElementById('mobile-toggle');

  toggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
    backdrop?.classList.toggle('open');
  });

  backdrop?.addEventListener('click', () => {
    sidebar?.classList.remove('open');
    backdrop?.classList.remove('open');
  });

  // Render Feather Icons
  if (window.feather) {
    window.feather.replace();
  }
}

// Auto-run when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  renderSidebar();
});
