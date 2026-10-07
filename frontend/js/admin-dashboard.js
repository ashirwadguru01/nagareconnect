// Admin Dashboard Logic
document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth(['admin']);
  if (!user) return;

  const spinner = document.getElementById('loading-spinner');
  const contentArea = document.getElementById('dashboard-content');

  try {
    const [statsRes, complaintsRes] = await Promise.all([
      adminService.getStats(),
      complaintService.getAll({ limit: 5, page: 1 })
    ]);

    const stats = statsRes || {
      total_complaints: 0,
      pending: 0,
      in_progress: 0,
      resolved: 0,
      total_citizens: 0,
      total_workers: 0,
      monthly: []
    };

    const recentComplaints = complaintsRes?.complaints || [];

    // Render Stats
    document.getElementById('stat-total').textContent = stats.total_complaints;
    document.getElementById('stat-pending').textContent = stats.pending;
    document.getElementById('stat-inprogress').textContent = stats.in_progress;
    document.getElementById('stat-resolved').textContent = stats.resolved;

    // Resolution Donut
    const resolutionRate = stats.total_complaints > 0
      ? Math.round((stats.resolved / stats.total_complaints) * 100)
      : 0;

    document.getElementById('donut-rate-text').textContent = `${resolutionRate}%`;
    const progressCircle = document.getElementById('donut-progress-circle');
    const dashLength = resolutionRate * 2.51;
    progressCircle.setAttribute('stroke-dasharray', `${dashLength} 251`);

    document.getElementById('total-citizens').textContent = stats.total_citizens || 0;
    document.getElementById('total-workers').textContent = stats.total_workers || 0;

    // Monthly Bar Chart
    const barChartContainer = document.getElementById('monthly-barchart');
    const monthlyData = stats.monthly || [];
    const maxCount = Math.max(...monthlyData.map(x => x.count), 1);

    if (monthlyData.length === 0) {
      barChartContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 13px; margin: auto;">No monthly trend data available.</p>';
    } else {
      barChartContainer.innerHTML = monthlyData.map(m => `
        <div class="bar-item">
          <div class="bar-wrap">
            <div class="bar" style="height: ${(m.count / maxCount) * 100}%;"></div>
          </div>
          <div class="bar-label">${m.month.substring(5)}</div>
          <div class="bar-val">${m.count}</div>
        </div>
      `).join('');
    }

    // Recent Complaints Table
    const tableBody = document.getElementById('recent-table-body');
    if (recentComplaints.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No complaints recorded yet.</td></tr>';
    } else {
      tableBody.innerHTML = recentComplaints.map(c => `
        <tr>
          <td style="color: var(--text-muted);">#${c.id}</td>
          <td style="color: var(--text-primary); font-weight: 500;">${c.title}</td>
          <td>${c.citizen_name || 'Citizen'}</td>
          <td>${c.worker_name || '<span style="color: var(--text-muted);">Unassigned</span>'}</td>
          <td><span class="badge badge-${c.status}">${c.status.replace('_', ' ')}</span></td>
          <td><span class="badge badge-${c.priority}">${c.priority}</span></td>
          <td>${new Date(c.created_at).toLocaleDateString('en-IN')}</td>
        </tr>
      `).join('');
    }

    spinner.style.display = 'none';
    contentArea.style.display = 'block';

  } catch (err) {
    toast.error('Failed to load admin dashboard');
    spinner.style.display = 'none';
  }

  if (window.feather) feather.replace();
});
