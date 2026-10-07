// ========================================================
// Spinner / Loading Component (Vanilla JS & Web Component)
// ========================================================

/**
 * Show a page-level loading spinner inside a container.
 * @param {string|HTMLElement} container  - Selector or element
 * @param {string} [label]               - Optional loading text
 */
function showSpinner(container, label = '') {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return;
  el.innerHTML = `
    <div class="spinner-overlay">
      <div class="spinner"></div>
      ${label ? `<p class="spinner-label">${label}</p>` : ''}
    </div>
  `;
}

/**
 * Show a full-page blocking spinner.
 * @param {string} [label]
 * @returns {Function} hide() - Call to remove the spinner
 */
function showFullPageSpinner(label = 'Loading…') {
  const existing = document.getElementById('fullpage-spinner');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.id = 'fullpage-spinner';
  el.className = 'spinner-fullpage';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.innerHTML = `
    <div class="spinner spinner-lg"></div>
    ${label ? `<p class="spinner-label">${label}</p>` : ''}
  `;
  document.body.appendChild(el);

  return function hide() {
    el.remove();
  };
}

/**
 * Render skeleton loading cards.
 * @param {string|HTMLElement} container
 * @param {number} [count=3]
 * @param {string} [type='card']  - 'card' | 'row' | 'text'
 */
function showSkeleton(container, count = 3, type = 'card') {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return;

  const templates = {
    card: `
      <div class="skeleton skeleton-card" style="margin-bottom: 16px;"></div>
    `,
    row: `
      <div style="display: flex; gap: 12px; margin-bottom: 16px; align-items: center;">
        <div class="skeleton skeleton-avatar"></div>
        <div style="flex:1">
          <div class="skeleton skeleton-title" style="width: 40%;"></div>
          <div class="skeleton skeleton-text" style="width: 70%;"></div>
        </div>
      </div>
    `,
    text: `
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text" style="width: 80%;"></div>
    `,
  };

  const tpl = templates[type] || templates.card;
  el.innerHTML = Array.from({ length: count }, () => tpl).join('');
}

// ---- Web Component: <loading-spinner> ----
class LoadingSpinnerElement extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute('label') || '';
    const size  = this.getAttribute('size') || '';   // 'sm' | '' | 'lg'
    const color = this.getAttribute('color') || '';  // '' | 'accent' | 'info' | 'danger'

    this.innerHTML = `
      <div class="spinner-overlay">
        <div class="spinner ${size ? 'spinner-' + size : ''} ${color ? 'spinner-' + color : ''}"></div>
        ${label ? `<p class="spinner-label">${label}</p>` : ''}
      </div>
    `;
  }
}

if (!customElements.get('loading-spinner')) {
  customElements.define('loading-spinner', LoadingSpinnerElement);
}

// Expose globally
window.showSpinner          = showSpinner;
window.showFullPageSpinner  = showFullPageSpinner;
window.showSkeleton         = showSkeleton;
