// Worker Assigned Tasks Logic
document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth(['worker']);
  if (!user) return;

  const spinner = document.getElementById('loading-spinner');
  const contentArea = document.getElementById('tasks-content');
  const countEl = document.getElementById('tasks-count');
  const listContainer = document.getElementById('tasks-list');

  // Modal elements
  const modalBackdrop = document.getElementById('resolve-modal');
  const modalTitle = document.getElementById('modal-complaint-title');
  const modalClose = document.getElementById('modal-close-btn');
  const modalNote = document.getElementById('modal-note');
  const btnMarkInProgress = document.getElementById('btn-mark-inprogress');
  const btnMarkResolved = document.getElementById('btn-mark-resolved');

  let complaints = [];
  let selectedComplaint = null;

  function openModal(complaint) {
    selectedComplaint = complaint;
    modalTitle.textContent = complaint.title;
    modalNote.value = '';

    if (complaint.status === 'pending') {
      btnMarkInProgress.style.display = 'inline-flex';
    } else {
      btnMarkInProgress.style.display = 'none';
    }

    modalBackdrop.style.display = 'flex';
  }

  function closeModal() {
    selectedComplaint = null;
    modalBackdrop.style.display = 'none';
  }

  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  async function updateComplaintStatus(newStatus) {
    if (!selectedComplaint) return;

    btnMarkResolved.disabled = true;
    btnMarkInProgress.disabled = true;

    try {
      await complaintService.updateStatus(selectedComplaint.id, {
        status: newStatus,
        note: modalNote.value.trim()
      });
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}! 🎉`);
      closeModal();
      await loadTasks();
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      btnMarkResolved.disabled = false;
      btnMarkInProgress.disabled = false;
    }
  }

  btnMarkInProgress.addEventListener('click', () => updateComplaintStatus('in_progress'));
  btnMarkResolved.addEventListener('click', () => updateComplaintStatus('resolved'));

  function renderList() {
    countEl.textContent = `${complaints.length} active complaints assigned to you`;

    if (complaints.length === 0) {
      listContainer.innerHTML = `
        <div class="card">
          <div class="empty-state">
            <span>✅</span>
            <h3>No assigned complaints</h3>
            <p>You're all caught up!</p>
          </div>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = complaints.map(c => `
      <div class="card" style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;">
        ${c.image_url
          ? `<img src="${c.image_url}" alt="" style="width: 90px; height: 90px; border-radius: 12px; object-fit: cover; flex-shrink: 0;" />`
          : `<div style="width: 90px; height: 90px; border-radius: 12px; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; font-size: 32px; flex-shrink: 0;">🗑️</div>`
        }

        <div style="flex: 1; min-width: 240px;">
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 6px;">
            <span style="font-size: 16px; font-weight: 700; color: var(--text-primary);">${c.title}</span>
            <span class="badge badge-${c.status}">${c.status.replace('_', ' ')}</span>
            <span class="badge badge-${c.priority}">${c.priority}</span>
          </div>

          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; line-height: 1.6;">
            ${(c.description || '').substring(0, 140)}...
          </p>

          <div style="font-size: 13px; color: var(--text-muted); display: flex; gap: 16px; flex-wrap: wrap;">
            <span>📍 ${c.address || `${parseFloat(c.lat).toFixed(4)}, ${parseFloat(c.lng).toFixed(4)}`}</span>
            <span>👤 ${c.citizen_name || 'Citizen'}</span>
            ${c.citizen_phone ? `<span>📞 ${c.citizen_phone}</span>` : ''}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px; flex-shrink: 0;">
          <button class="btn btn-ghost btn-sm nav-btn" data-lat="${c.lat}" data-lng="${c.lng}">
            <i data-feather="navigation"></i> Navigate
          </button>
          ${c.status !== 'resolved' ? `
            <button class="btn btn-primary btn-sm resolve-btn" data-id="${c.id}">
              <i data-feather="check"></i> Update / Resolve
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');

    // Attach button listeners
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.addEventListener('click', () => {
        const lat = b.dataset.lat;
        const lng = b.dataset.lng;
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
      });
    });

    document.querySelectorAll('.resolve-btn').forEach(b => {
      b.addEventListener('click', () => {
        const id = parseInt(b.dataset.id);
        const comp = complaints.find(c => c.id === id);
        if (comp) openModal(comp);
      });
    });

    if (window.feather) feather.replace();
  }

  async function loadTasks() {
    try {
      complaints = await complaintService.getAssigned();
      renderList();
    } catch (err) {
      toast.error('Failed to load assigned tasks');
    }
  }

  await loadTasks();

  // If URL has ?id=..., open that modal immediately
  const urlId = new URLSearchParams(window.location.search).get('id');
  if (urlId) {
    const target = complaints.find(c => c.id === parseInt(urlId));
    if (target) openModal(target);
  }

  spinner.style.display = 'none';
  contentArea.style.display = 'block';
});
