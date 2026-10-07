// ========================================================
// Navbar Component (Vanilla JS & Web Component)
// ========================================================

function renderNavbarComponent(container, options = {}) {
  const mount = typeof container === 'string' ? document.querySelector(container) : container;
  if (!mount) return;

  const user = (typeof getCurrentUser === 'function' ? getCurrentUser() : null);
  const title = options.title || document.title.split('—')[0].trim() || 'Nagar e-Connect';

  mount.innerHTML = `
    <header class="navbar-header" id="app-navbar">
      <div class="navbar-left">
        <a href="/" class="navbar-brand">
          <span class="navbar-brand-icon">🌿</span>
          <span class="navbar-brand-name">Nagar <span class="navbar-brand-accent">e-Connect</span></span>
        </a>
        <div class="navbar-divider"></div>
        <span class="navbar-page-title">${title}</span>
      </div>

      <div class="navbar-right">
        ${user ? `
          <div class="navbar-user-chip">
            <span class="navbar-user-avatar">${(user.name?.[0] || 'U').toUpperCase()}</span>
            <span class="navbar-user-name">${user.name || 'User'}</span>
          </div>
        ` : `
          <a href="/login.html" class="btn btn-ghost btn-sm">Sign In</a>
        `}
        <a href="/citizen/new-complaint.html" class="btn btn-primary btn-sm">
          <i data-feather="plus-circle"></i> Report Issue
        </a>
      </div>
    </header>
  `;

  if (window.feather) {
    window.feather.replace();
  }
}

// Web Component: <app-navbar>
class AppNavbarElement extends HTMLElement {
  connectedCallback() {
    renderNavbarComponent(this, { title: this.getAttribute('title') });
  }
}

if (!customElements.get('app-navbar')) {
  customElements.define('app-navbar', AppNavbarElement);
}

window.renderNavbar = renderNavbarComponent;
