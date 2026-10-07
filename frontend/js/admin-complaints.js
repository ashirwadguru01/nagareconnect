// Admin Complaints Logic
document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth(['admin']);
  if (!user) return;

  const spinner = document.getElementById('loading-spinner');
  const contentArea = document.getElementById('complaints-content');

  const searchInput = document.getElementById('search-input');
  const statusFilter = document.getElementById('status-filter');
  const totalCountEl = document.getElementById('total-count');
  const tableBody = document.getElementById('complaints-table-body');

  const pageInfo = document.getElementById('page-info');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  // Assign modal
  const assignModal = document.getElementById('assign-modal');
  const modalComplaintTitle = document.getElementById('modal-complaint-title');
  const workerSelect = document.getElementById('worker-select');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const confirmAssignBtn = document.getElementById('confirm-assign-btn');

  let complaints = [];
  let workers = [];
  let total = 0;
  let page = 1;
  const limit = 15;
  let selectedComplaint = null;

  function openAssignModal(complaint) {
    selectedComplaint = complaint;
    modalComplaintTitle.textContent = complaint.title;
    workerSelect.value = '';

    // Populate active workers
    workerSelect.innerHTML = '<option value="">-- Choose a worker --</option>' +
      workers.filter(w => w.is_active).map(w => `
        <option value="${w.id}">${w.name} (${w.total_resolved || 0} resolved)</option>
      `).join('');

    assignModal.style.display = 'flex';
  }

  function closeAssignModal() {
    selectedComplaint = null;
    assignModal.style.display = 'none';
  }

  modalCloseBtn.addEventListener('click', closeAssignModal);
  assignModal.addEventListener('click', (e) => {
    if (e.target === assignModal) closeAssignModal();
  });

  confirmAssignBtn.addEventListener('click', async () => {
    const workerId = workerSelect.value;
    if (!workerId) {
      toast.error('Please choose a worker to assign');
      return;
    }

    confirmAssignBtn.disabled = true;
    confirmAssignBtn.textContent = 'Assigning...';

    try {
      await complaintService.assign(selectedComplaint.id, parseInt(workerId));
      toast.success('Complaint assigned successfully!');
      closeAssignModal();
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Assignment failed');
    } finally {
      confirmAssignBtn.disabled = false;
      confirmAssignBtn.textContent = 'Assign Worker';
    }
  });

  function renderTable() {
    const search = searchInput.value.toLowerCase().trim();

    const filtered = complaints.filter(c =>
      c.title.toLowerCase().includes(search) ||
      (c.citizen_name || '').toLowerCase().includes(search)
    );

    totalCountEl.textContent = `${total} total complaints in the system`;

    const totalPages = Math.ceil(total / limit) || 1;
    pageInfo.textContent = `Page ${page} of ${totalPages}`;
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= totalPages;

    if (filtered.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 30px;">No complaints match the filter.</td></tr>';
      return;
    }

    tableBody.innerHTML = filtered.map(c => `
      <tr>
        <td style="color: var(--text-muted);">#${c.id}</td>
        <td style="color: var(--text-primary); font-weight: 500; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${c.title}
        </td>
        <td>${c.citizen_name || 'Citizen'}</td>
        <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px;">
          ${c.address || `${parseFloat(c.lat).toFixed(4)}, ${parseFloat(c.lng).toFixed(4)}`}
        </td>
        <td><span class="badge badge-${c.status}">${c.status.replace('_', ' ')}</span></td>
        <td><span class="badge badge-${c.priority}">${c.priority}</span></td>
        <td>${c.worker_name || '<span style="color: var(--text-muted);">—</span>'}</td>
        <td style="font-size: 12px;">${new Date(c.created_at).toLocaleDateString('en-IN')}</td>
        <td>
          <div style="display: flex; gap: 6px;">
            ${c.status === 'pending' ? `
              <button class="btn btn-ghost btn-sm assign-btn" data-id="${c.id}">
                <i data-feather="user-plus"></i> Assign
              </button>
            ` : ''}
            <a href="/citizen/complaint-detail.html?id=${c.id}" class="btn btn-ghost btn-sm" title="View details">
              <i data-feather="eye"></i>
            </a>
          </div>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.assign-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const comp = complaints.find(c => c.id === id);
        if (comp) openAssignModal(comp);
      });
    });

    if (window.feather) feather.replace();
  }

  async function loadData() {
    const params = { page, limit };
    if (statusFilter.value !== 'all') {
      params.status = statusFilter.value;
    }

    try {
      const [complaintsRes, workersRes] = await Promise.all([
        complaintService.getAll(params),
        adminService.getWorkers()
      ]);

      complaints = complaintsRes?.complaints || [];
      total = complaintsRes?.total || 0;
      workers = workersRes || [];

      renderTable();
    } catch (err) {
      toast.error('Failed to load complaints');
    }
  }

  searchInput.addEventListener('input', renderTable);

  statusFilter.addEventListener('change', () => {
    page = 1;
    loadData();
  });

  prevBtn.addEventListener('click', () => {
    if (page > 1) {
      page--;
      loadData();
    }
  });

  nextBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(total / limit) || 1;
    if (page < totalPages) {
      page++;
      loadData();
    }
  });

  await loadData();
  spinner.style.display = 'none';
  contentArea.style.display = 'block';
});
