// ========================================================
// Badge / Status Chip Component (Vanilla JS)
// ========================================================

/**
 * Create an HTML string for a status badge.
 * @param {string} status    - e.g. 'pending', 'resolved', 'in_progress', 'rejected'
 * @param {object} [opts]
 * @param {string}  [opts.size]   - '' | 'xs' | 'lg'
 * @param {boolean} [opts.dot]    - Add a colored dot prefix
 * @param {boolean} [opts.pulse]  - Add animated pulse dot
 * @returns {string} HTML string
 */
function badgeHtml(status = '', opts = {}) {
  const { size = '', dot = false, pulse = false } = opts;

  const STATUS_LABELS = {
    pending:     'Pending',
    in_progress: 'In Progress',
    resolved:    'Resolved',
    rejected:    'Rejected',
    low:         'Low',
    medium:      'Medium',
    high:        'High',
    citizen:     'Citizen',
    worker:      'Worker',
    admin:       'Admin',
    active:      'Active',
    inactive:    'Inactive',
  };

  const label = STATUS_LABELS[status] || status.replace(/_/g, ' ');
  const dotClass = pulse ? 'badge-pulse' : dot ? 'badge-dot' : '';
  const sizeClass = size ? `badge-${size}` : '';

  return `<span class="badge badge-${status} ${sizeClass} ${dotClass}">${label}</span>`;
}

/**
 * Set a badge element's status in-place.
 * @param {HTMLElement|string} el     - Element or selector
 * @param {string}             status - New status string
 * @param {object}            [opts]
 */
function setBadge(el, status, opts = {}) {
  const target = typeof el === 'string' ? document.querySelector(el) : el;
  if (!target) return;

  const ALL_CLASSES = [
    'badge-pending', 'badge-in_progress', 'badge-resolved', 'badge-rejected',
    'badge-low', 'badge-medium', 'badge-high',
    'badge-citizen', 'badge-worker', 'badge-admin',
    'badge-active', 'badge-inactive',
    'badge-xs', 'badge-lg',
  ];

  target.classList.remove(...ALL_CLASSES);
  target.classList.add(`badge-${status}`);

  const STATUS_LABELS = {
    pending:     'Pending',
    in_progress: 'In Progress',
    resolved:    'Resolved',
    rejected:    'Rejected',
    low:         'Low',
    medium:      'Medium',
    high:        'High',
    citizen:     'Citizen',
    worker:      'Worker',
    admin:       'Admin',
    active:      'Active',
    inactive:    'Inactive',
  };

  if (opts.size) target.classList.add(`badge-${opts.size}`);
  target.textContent = STATUS_LABELS[status] || status.replace(/_/g, ' ');
}

// Expose globally
window.badgeHtml = badgeHtml;
window.setBadge  = setBadge;
