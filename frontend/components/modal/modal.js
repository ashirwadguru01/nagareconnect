// ========================================================
// Modal Component (Vanilla JS & Web Component)
// ========================================================

/**
 * Create and show a modal.
 *
 * @param {object} config
 * @param {string}   config.title           - Modal heading
 * @param {string}   config.body            - Inner HTML for modal body
 * @param {string}  [config.size]           - 'sm' | '' | 'lg' | 'xl'
 * @param {Array}   [config.footer]         - Array of button descriptors { label, className, id, onClick }
 * @param {boolean} [config.closeOnBackdrop] - Close when clicking backdrop (default true)
 * @param {Function}[config.onClose]        - Callback when modal is closed
 * @returns {{ el: HTMLElement, close: Function }}
 */
function createModal(config = {}) {
  const {
    title = '',
    body = '',
    size = '',
    footer = [],
    closeOnBackdrop = true,
    onClose = null,
  } = config;

  const sizeClass = size ? `modal-${size}` : '';

  const footerHtml = footer.map((btn) =>
    `<button
      class="btn ${btn.className || 'btn-ghost'}"
      ${btn.id ? `id="${btn.id}"` : ''}
      type="button"
    >${btn.label}</button>`
  ).join('');

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-labelledby', 'modal-title-label');

  backdrop.innerHTML = `
    <div class="modal ${sizeClass}">
      <div class="modal-header">
        <span class="modal-title" id="modal-title-label">${title}</span>
        <button class="modal-close" id="modal-close-btn" aria-label="Close modal">×</button>
      </div>
      <div class="modal-body">${body}</div>
      ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
    </div>
  `;

  document.body.appendChild(backdrop);

  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden';

  function close() {
    backdrop.classList.add('hide');
    backdrop.addEventListener('animationend', () => {
      backdrop.remove();
      document.body.style.overflow = '';
      if (typeof onClose === 'function') onClose();
    }, { once: true });
    // Fallback in case animationend doesn't fire
    setTimeout(() => {
      if (backdrop.parentNode) {
        backdrop.remove();
        document.body.style.overflow = '';
      }
    }, 400);
  }

  // Wire close button
  backdrop.querySelector('#modal-close-btn')?.addEventListener('click', close);

  // Wire backdrop click
  if (closeOnBackdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });
  }

  // Wire footer buttons
  footer.forEach((btn) => {
    if (btn.id) {
      const el = backdrop.querySelector(`#${btn.id}`);
      if (el && typeof btn.onClick === 'function') {
        el.addEventListener('click', () => btn.onClick(close));
      }
    }
  });

  // Keyboard accessibility
  const handleKey = (e) => {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', handleKey);
    }
  };
  document.addEventListener('keydown', handleKey);

  return { el: backdrop, close };
}

/**
 * Quick confirm dialog
 * @param {string} message
 * @param {object} [opts]
 * @param {string}  [opts.title]         - Dialog title (default "Confirm")
 * @param {string}  [opts.confirmLabel]  - Confirm button text (default "Confirm")
 * @param {string}  [opts.confirmClass]  - Confirm button CSS class (default "btn-danger")
 * @param {Function} opts.onConfirm       - Called when confirmed
 */
function confirmModal(message, opts = {}) {
  const {
    title = 'Confirm',
    confirmLabel = 'Confirm',
    confirmClass = 'btn-danger',
    onConfirm,
  } = opts;

  createModal({
    title,
    body: `<p style="color: var(--text-secondary); font-size: 15px; line-height: 1.7;">${message}</p>`,
    footer: [
      { label: 'Cancel', className: 'btn-ghost', id: 'modal-cancel', onClick: (close) => close() },
      {
        label: confirmLabel,
        className: confirmClass,
        id: 'modal-confirm',
        onClick: (close) => {
          if (typeof onConfirm === 'function') onConfirm();
          close();
        },
      },
    ],
  });
}

// Expose globally
window.createModal = createModal;
window.confirmModal = confirmModal;
