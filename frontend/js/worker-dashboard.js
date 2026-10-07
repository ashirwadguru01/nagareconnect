// Worker Dashboard Logic
document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth(['worker']);
  if (!user) return;

  document.getElementById('worker-name').textContent = user.name || 'Worker';

  const spinner = document.getElementById('loading-spinner');
  const contentArea = document.getElementById('dashboard-content');

  try {
    const [complaintsRes, perfRes] = await Promise.all([
      complaintService.getAssigned(),
      adminService.getWorkerPerformance()
    ]);

    const complaints = complaintsRes || [];
    const perfList = perfRes || [];
    const myPerf = perfList.find(w => w.id === user.id);

    const pending = complaints.filter(c => c.status === 'pending').length;
    const inProgress = complaints.filter(c => c.status === 'in_progress').length;
    const monthlyResolved = myPerf?.resolved_count || 0;
    const bonusEligible = myPerf?.bonus_eligible;

    // Render Stats
    document.getElementById('stat-assigned').textContent = complaints.length;
    document.getElementById('stat-pending').textContent = pending;
    document.getElementById('stat-inprogress').textContent = inProgress;
    document.getElementById('stat-monthly').textContent = monthlyResolved;

    // Bonus Banner
    if (bonusEligible) {
      document.getElementById('bonus-alert-banner').style.display = 'flex';
    }

    // Monthly Progress Bar
    document.getElementById('progress-count-text').textContent = `${monthlyResolved} / 100 complaints resolved`;
    const bonusStatusText = document.getElementById('progress-status-text');
    if (bonusEligible) {
      bonusStatusText.textContent = '🏆 Bonus Eligible!';
      bonusStatusText.style.color = 'var(--primary)';
    } else {
      bonusStatusText.textContent = `${Math.max(100 - monthlyResolved, 0)} more to go`;
    }

    const pct = Math.min((monthlyResolved / 100) * 100, 100);
    document.getElementById('bonus-progress-bar').style.width = `${pct}%`;

    // Assigned Complaints Table
    const tableContainer = document.getElementById('assigned-table-container');
    const recent = complaints.slice(0, 5);

    if (recent.length === 0) {
      tableContainer.innerHTML = `
        <div class="empty-state">
          <span>✅</span>
          <h3>All caught up!</h3>
          <p>No complaints assigned to you right now.</p>
        </div>
      `;
    } else {
      tableContainer.innerHTML = `
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Location</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Reported</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${recent.map(c => `
                <tr>
                  <td style="color: var(--text-primary); font-weight: 500;">${c.title}</td>
                  <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${c.address || `${parseFloat(c.lat).toFixed(4)}, ${parseFloat(c.lng).toFixed(4)}`}
                  </td>
                  <td><span class="badge badge-${c.priority}">${c.priority}</span></td>
                  <td><span class="badge badge-${c.status}">${c.status.replace('_', ' ')}</span></td>
                  <td>${new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                  <td>
                    <a href="/worker/tasks.html?id=${c.id}" class="btn btn-ghost btn-sm">Resolve</a>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    spinner.style.display = 'none';
    contentArea.style.display = 'block';

  } catch (err) {
    toast.error('Failed to load worker dashboard');
    spinner.style.display = 'none';
  }

  if (window.feather) feather.replace();
});
