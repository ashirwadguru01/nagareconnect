// ========================================================
// Complaint Card Component (Vanilla JS)
// ========================================================

const CATEGORY_EMOJI = {
  garbage:       '🗑️',
  road:          '🛣️',
  water:         '💧',
  electricity:   '⚡',
  sewage:        '🚽',
  streetlight:   '💡',
  park:          '🌳',
  noise:         '📢',
  stray_animals: '🐾',
  other:         '📋',
};

/**
 * Generate HTML for a complaint card.
 * @param {object} complaint   - Complaint data from the API
 * @param {object} [opts]
 * @param {string}  [opts.linkBase]     - Base URL for the detail link
 * @param {string}  [opts.actionLabel]  - Override CTA button text
 * @param {boolean} [opts.compact]      - Use compact list variant
 * @param {boolean} [opts.showWorker]   - Display assigned worker name
 * @param {boolean} [opts.adminMode]    - Show admin action buttons
 * @returns {string} HTML string
 */
function complaintCardHtml(complaint, opts = {}) {
  const c = complaint;
  const {
    linkBase    = '/citizen/complaint-detail.html',
    actionLabel = 'Details →',
    compact     = false,
    showWorker  = true,
    adminMode   = false,
  } = opts;

  const emoji       = CATEGORY_EMOJI[c.category] || '📋';
  const dateStr     = new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const address     = c.address || (c.lat ? `${parseFloat(c.lat).toFixed(4)}, ${parseFloat(c.lng).toFixed(4)}` : 'Location not set');
  const statusLabel = c.status.replace(/_/g, ' ');
  const detailHref  = `${linkBase}?id=${c.id}`;

  const thumb = c.image_url
    ? `<div class="complaint-thumb"><img src="${c.image_url}" alt="${c.title}" /></div>`
    : `<div class="complaint-thumb">${emoji}</div>`;

  const workerInfo = (showWorker && c.worker_name)
    ? `<span>👷 ${c.worker_name}</span>`
    : '';

  const resolvedInfo = c.resolved_at
    ? `<span>✅ ${new Date(c.resolved_at).toLocaleDateString('en-IN')}</span>`
    : '';

  const adminActions = adminMode ? `
    <button class="btn btn-ghost btn-sm" data-action="assign" data-id="${c.id}" title="Assign worker">
      <i data-feather="user-plus" style="width:14px;height:14px;"></i>
    </button>
  ` : '';

  return `
    <div class="complaint-card ${compact ? 'complaint-card-list' : ''}"
         data-status="${c.status}" data-id="${c.id}">
      ${thumb}
      <div class="complaint-body">
        <div class="complaint-title-row">
          <span class="complaint-title" title="${c.title}">${c.title}</span>
          <span class="badge badge-${c.status}">${statusLabel}</span>
          <span class="badge badge-${c.priority}">${c.priority}</span>
        </div>
        <div class="complaint-address" title="${address}">
          📍 ${address}
        </div>
        <div class="complaint-meta">
          <span>📅 ${dateStr}</span>
          ${workerInfo}
          ${resolvedInfo}
          <span>🔢 #${c.id}</span>
        </div>
      </div>
      <div class="complaint-actions">
        ${adminActions}
        <a href="${detailHref}" class="btn btn-ghost btn-sm">${actionLabel}</a>
      </div>
    </div>
  `;
}

/**
 * Render a list of complaint cards into a container.
 * @param {string|HTMLElement} container
 * @param {Array} complaints
 * @param {object} [opts]        - Same opts as complaintCardHtml
 * @param {object} [emptyState]  - { icon, title, message, actionHref, actionLabel }
 */
function renderComplaintCards(container, complaints, opts = {}, emptyState = {}) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return;

  if (!complaints || complaints.length === 0) {
    const {
      icon        = '📋',
      title       = 'No complaints found',
      message     = 'Nothing here yet.',
      actionHref  = null,
      actionLabel = 'Report Issue',
    } = emptyState;

    el.innerHTML = `
      <div class="card">
        <div class="empty-state">
          <span>${icon}</span>
          <h3>${title}</h3>
          <p>${message}</p>
          ${actionHref ? `<a href="${actionHref}" class="btn btn-primary" style="margin-top: 12px;">${actionLabel}</a>` : ''}
        </div>
      </div>
    `;
    return;
  }

  el.innerHTML = complaints.map((c) => complaintCardHtml(c, opts)).join('');

  // Re-render feather icons
  if (window.feather) {
    window.feather.replace();
  }
}

// Expose globally
window.complaintCardHtml    = complaintCardHtml;
window.renderComplaintCards = renderComplaintCards;
window.CATEGORY_EMOJI       = CATEGORY_EMOJI;
