// My Complaints Logic
document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth(['citizen']);
  if (!user) return;

  const spinner = document.getElementById('loading-spinner');
  const contentArea = document.getElementById('complaints-content');
  const listContainer = document.getElementById('complaints-list');
  const countBadge = document.getElementById('complaints-count');
  const searchInput = document.getElementById('search-input');
  const statusFilter = document.getElementById('status-filter');

  let complaints = [];

  function renderList() {
    const search = searchInput.value.toLowerCase().trim();
    const status = statusFilter.value;

    let filtered = complaints;

    if (status !== 'all') {
      filtered = filtered.filter(c => c.status === status);
    }

    if (search) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(search) ||
        (c.address || '').toLowerCase().includes(search)
      );
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="card">
          <div class="empty-state">
            <span>🔍</span>
            <h3>No complaints found</h3>
            <p>Try adjusting your search or filters, or report a new issue.</p>
            <a href="/citizen/new-complaint.html" class="btn btn-primary" style="margin-top: 12px;">Report Issue</a>
          </div>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filtered.map(c => `
      <div class="card" style="display: flex; gap: 16px; align-items: center; padding: 16px 20px; flex-wrap: wrap;">
        ${c.image_url
          ? `<img src="${c.image_url}" alt="" style="width: 70px; height: 70px; border-radius: 10px; object-fit: cover; flex-shrink: 0;" />`
          : `<div style="width: 70px; height: 70px; border-radius: 10px; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0;">🗑️</div>`
        }
        <div style="flex: 1; min-width: 220px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px; flex-wrap: wrap;">
            <span style="font-size: 15px; font-weight: 600; color: var(--text-primary);">${c.title}</span>
            <span class="badge badge-${c.status}">${c.status.replace('_', ' ')}</span>
            <span class="badge badge-${c.priority}">${c.priority}</span>
          </div>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 6px;">
            ${c.address || `${parseFloat(c.lat).toFixed(4)}, ${parseFloat(c.lng).toFixed(4)}`}
          </p>
          <div style="display: flex; gap: 16px; font-size: 12px; color: var(--text-muted); flex-wrap: wrap;">
            <span>📅 ${new Date(c.created_at).toLocaleDateString('en-IN')}</span>
            ${c.worker_name ? `<span>👷 ${c.worker_name}</span>` : ''}
            ${c.resolved_at ? `<span>✅ Resolved ${new Date(c.resolved_at).toLocaleDateString('en-IN')}</span>` : ''}
          </div>
        </div>
        <a href="/citizen/complaint-detail.html?id=${c.id}" class="btn btn-ghost btn-sm" style="flex-shrink: 0;">
          Details →
        </a>
      </div>
    `).join('');
  }

  try {
    complaints = await complaintService.getMy();
    countBadge.textContent = `${complaints.length} total complaints`;
    renderList();

    searchInput.addEventListener('input', renderList);
    statusFilter.addEventListener('change', renderList);

    spinner.style.display = 'none';
    contentArea.style.display = 'block';
  } catch (err) {
    toast.error('Failed to load complaints');
    spinner.style.display = 'none';
  }

  if (window.feather) {
    window.feather.replace();
  }
});
