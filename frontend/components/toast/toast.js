// ========================================================
// Toast Notification Component (Vanilla JS)
// ========================================================

(function () {
  // Ensure container exists
  function getContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  const TOAST_ICONS = {
    success: '✅',
    error:   '❌',
    warning: '⚠️',
    info:    'ℹ️',
  };

  /**
   * Show a toast notification.
   * @param {'success'|'error'|'warning'|'info'} type
   * @param {string} message - Main message text
   * @param {object} [opts]
   * @param {string}  [opts.title]      - Optional bold title above message
   * @param {number}  [opts.duration]   - Display duration in ms (default 3500)
   * @param {boolean} [opts.dismissible] - Show close button (default true)
   */
  function showToast(type = 'info', message = '', opts = {}) {
    const {
      title = '',
      duration = 3500,
      dismissible = true,
    } = opts;

    const container = getContainer();
    const icon = TOAST_ICONS[type] || 'ℹ️';

    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.setAttribute('role', 'alert');
    el.setAttribute('aria-live', 'polite');

    el.innerHTML = `
      <span class="toast-icon" aria-hidden="true">${icon}</span>
      <div class="toast-body">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      ${dismissible ? '<button class="toast-close-btn" aria-label="Dismiss notification">×</button>' : ''}
      <span class="toast-progress" style="animation-duration: ${duration}ms;"></span>
    `;

    container.appendChild(el);

    // Auto-dismiss
    let timer = setTimeout(() => dismiss(el), duration);

    // Manual dismiss
    const closeBtn = el.querySelector('.toast-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        clearTimeout(timer);
        dismiss(el);
      });
    }

    return el;
  }

  function dismiss(el) {
    el.classList.add('hide');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }

  // Public API — replaces the api.js inline `toast` object
  const toast = {
    success: (msg, opts) => showToast('success', msg, opts),
    error:   (msg, opts) => showToast('error',   msg, opts),
    warning: (msg, opts) => showToast('warning', msg, opts),
    info:    (msg, opts) => showToast('info',    msg, opts),
    show:    showToast,
  };

  // Expose globally
  window.toast = toast;
  window.showToast = showToast;
})();
