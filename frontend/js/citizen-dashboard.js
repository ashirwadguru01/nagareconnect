// Citizen Dashboard Logic
document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth(['citizen']);
  if (!user) return;

  const welcomeName = document.getElementById('welcome-name');
  if (welcomeName) {
    welcomeName.textContent = user.name ? user.name.split(' ')[0] : 'Citizen';
  }

  const contentArea = document.getElementById('dashboard-content');
  const spinner = document.getElementById('loading-spinner');

  try {
    const [complaintsRes, pointsRes, transactionsRes] = await Promise.all([
      complaintService.getMy(),
      rewardService.getMyPoints(),
      rewardService.getTransactions()
    ]);

    const complaints = complaintsRes || [];
    const pointsData = pointsRes || { current_points: 0, total_earned: 0, total_redeemed: 0 };
    const transactions = transactionsRes || [];

    const stats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'pending').length,
      inProgress: complaints.filter(c => c.status === 'in_progress').length,
      resolved: complaints.filter(c => c.status === 'resolved').length,
    };

    // Render stats
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-pending').textContent = stats.pending;
    document.getElementById('stat-inprogress').textContent = stats.inProgress;
    document.getElementById('stat-resolved').textContent = stats.resolved;

    // Render points
    document.getElementById('current-points').textContent = pointsData.current_points ?? 0;
    document.getElementById('total-earned').textContent = pointsData.total_earned ?? 0;
    document.getElementById('total-redeemed').textContent = pointsData.total_redeemed ?? 0;

    // Render recent activity
    const activityContainer = document.getElementById('recent-activity-container');
    const recentTx = transactions.slice(0, 5);

    if (recentTx.length === 0) {
      activityContainer.innerHTML = `
        <div class="empty-state" style="padding: 30px 0;">
          <span>🎯</span>
          <p>No transactions yet. Start reporting issues to earn points!</p>
        </div>
      `;
    } else {
      activityContainer.innerHTML = recentTx.map(t => `
        <div class="tx-item">
          <div class="tx-icon ${t.type === 'earned' ? 'earned' : 'redeemed'}">
            ${t.type === 'earned' ? '+' : '-'}
          </div>
          <div class="tx-info">
            <div class="tx-desc">${t.description}</div>
            <div class="tx-date">${new Date(t.created_at).toLocaleDateString('en-IN')}</div>
          </div>
          <div class="tx-points ${t.type === 'earned' ? 'earned-text' : 'redeemed-text'}">
            ${t.type === 'earned' ? '+' : '-'}${t.points} pts
          </div>
        </div>
      `).join('');
    }

    // Render recent complaints
    const complaintsContainer = document.getElementById('recent-complaints-container');
    const recentComplaints = complaints.slice(0, 5);

    if (recentComplaints.length === 0) {
      complaintsContainer.innerHTML = `
        <div class="empty-state">
          <span>🗑️</span>
          <h3>No complaints yet</h3>
          <p>Report your first garbage issue and start earning rewards!</p>
          <a href="/citizen/new-complaint.html" class="btn btn-primary" style="margin-top: 12px;">Report Now</a>
        </div>
      `;
    } else {
      complaintsContainer.innerHTML = `
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Location</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${recentComplaints.map(c => `
                <tr>
                  <td style="color: var(--text-primary); font-weight: 500;">${c.title}</td>
                  <td>${((c.address || `${parseFloat(c.lat).toFixed(4)}, ${parseFloat(c.lng).toFixed(4)}`)).substring(0, 32)}...</td>
                  <td><span class="badge badge-${c.status}">${c.status.replace('_', ' ')}</span></td>
                  <td><span class="badge badge-${c.priority}">${c.priority}</span></td>
                  <td>${new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                  <td><a href="/citizen/complaint-detail.html?id=${c.id}" class="btn btn-ghost btn-sm">View</a></td>
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
    toast.error('Failed to load dashboard data');
    spinner.style.display = 'none';
  }

  if (window.feather) {
    window.feather.replace();
  }
});
