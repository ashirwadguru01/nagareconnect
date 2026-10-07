// Admin Users Logic
document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth(['admin']);
  if (!user) return;

  const spinner = document.getElementById('loading-spinner');
  const contentArea = document.getElementById('users-content');

  const countEl = document.getElementById('users-count');
  const searchInput = document.getElementById('search-input');
  const roleFilter = document.getElementById('role-filter');
  const tableBody = document.getElementById('users-table-body');

  let users = [];

  function renderTable() {
    const search = searchInput.value.toLowerCase().trim();
    const role = roleFilter.value;

    const filtered = users.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search);
      const matchRole = role === 'all' || u.role === role;
      return matchSearch && matchRole;
    });

    countEl.textContent = `${users.length} registered users`;

    if (filtered.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">No users match your criteria.</td></tr>';
      return;
    }

    tableBody.innerHTML = filtered.map(u => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="
              width: 34px; height: 34px; border-radius: 50%;
              background: linear-gradient(135deg, var(--primary), var(--accent));
              display: flex; align-items: center; justify-content: center;
              font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0;
            ">
              ${(u.name?.[0] || 'U').toUpperCase()}
            </div>
            <div>
              <div style="font-size: 14px; font-weight: 600; color: var(--text-primary);">${u.name}</div>
              <div style="font-size: 12px; color: var(--text-muted);">${u.email}</div>
            </div>
          </div>
        </td>
        <td>
          <select class="form-select role-select" data-id="${u.id}" style="width: auto; padding: 4px 8px; font-size: 12px;">
            <option value="citizen" ${u.role === 'citizen' ? 'selected' : ''}>Citizen</option>
            <option value="worker" ${u.role === 'worker' ? 'selected' : ''}>Worker</option>
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
          </select>
        </td>
        <td style="font-weight: 700; color: var(--primary);">${u.points ?? 0}</td>
        <td>
          <span class="badge ${u.is_active ? 'badge-resolved' : 'badge-rejected'}">
            ${u.is_active ? 'Active' : 'Disabled'}
          </span>
        </td>
        <td style="font-size: 12px;">${new Date(u.created_at).toLocaleDateString('en-IN')}</td>
        <td>
          <button class="btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-ghost'} toggle-status-btn" data-id="${u.id}">
            ${u.is_active ? 'Disable' : 'Enable'}
          </button>
        </td>
      </tr>
    `).join('');

    // Attach role change listeners
    document.querySelectorAll('.role-select').forEach(sel => {
      sel.addEventListener('change', async (e) => {
        const id = sel.dataset.id;
        const newRole = sel.value;
        try {
          await adminService.changeRole(id, newRole);
          toast.success('User role updated successfully');
          await loadUsers();
        } catch (err) {
          toast.error(err.message || 'Failed to update role');
        }
      });
    });

    // Attach toggle status listeners
    document.querySelectorAll('.toggle-status-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = btn.dataset.id;
        try {
          await adminService.toggleUser(id);
          toast.success('User status updated');
          await loadUsers();
        } catch (err) {
          toast.error(err.message || 'Failed to update status');
        }
      });
    });

    if (window.feather) feather.replace();
  }

  async function loadUsers() {
    try {
      users = await adminService.getUsers();
      renderTable();
    } catch (err) {
      toast.error('Failed to load users');
    }
  }

  searchInput.addEventListener('input', renderTable);
  roleFilter.addEventListener('change', renderTable);

  await loadUsers();
  spinner.style.display = 'none';
  contentArea.style.display = 'block';
});
