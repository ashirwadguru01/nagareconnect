// Complaint Detail Logic
document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth(['citizen', 'worker', 'admin']);
  if (!user) return;

  const urlParams = new URLSearchParams(window.location.search);
  const complaintId = urlParams.get('id');

  if (!complaintId) {
    window.location.href = user.role === 'admin' ? '/admin/complaints.html' :
                           user.role === 'worker' ? '/worker/tasks.html' : '/citizen/complaints.html';
    return;
  }

  const spinner = document.getElementById('loading-spinner');
  const contentArea = document.getElementById('detail-content');

  try {
    const c = await complaintService.getById(complaintId);

    // Title & Badges
    document.getElementById('complaint-id').textContent = `#${c.id}`;
    document.getElementById('complaint-title').textContent = c.title;

    const statusBadge = document.getElementById('complaint-status-badge');
    statusBadge.className = `badge badge-${c.status}`;
    statusBadge.textContent = c.status.replace('_', ' ');

    const priorityBadge = document.getElementById('complaint-priority-badge');
    priorityBadge.className = `badge badge-${c.priority}`;
    priorityBadge.textContent = `${c.priority} priority`;

    // Photo
    const imgEl = document.getElementById('complaint-img');
    if (c.image_url) {
      imgEl.src = c.image_url;
      imgEl.style.display = 'block';
    } else {
      imgEl.style.display = 'none';
    }

    // Description & Meta
    document.getElementById('complaint-desc').textContent = c.description;
    document.getElementById('complaint-address').textContent = c.address || `${c.lat}, ${c.lng}`;
    document.getElementById('complaint-date').textContent = `Reported on ${new Date(c.created_at).toLocaleString('en-IN')}`;

    const workerRow = document.getElementById('complaint-worker-row');
    if (c.worker_name) {
      document.getElementById('complaint-worker').textContent = c.worker_name;
      workerRow.style.display = 'flex';
    } else {
      workerRow.style.display = 'none';
    }

    const resolvedRow = document.getElementById('complaint-resolved-row');
    if (c.resolved_at) {
      document.getElementById('complaint-resolved').textContent = `✅ Resolved on ${new Date(c.resolved_at).toLocaleString('en-IN')}`;
      resolvedRow.style.display = 'flex';
    } else {
      resolvedRow.style.display = 'none';
    }

    // Timeline logs
    const timelineContainer = document.getElementById('timeline-container');
    const logs = c.logs || [];

    if (logs.length === 0) {
      timelineContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 13px;">No activity logged yet.</p>';
    } else {
      timelineContainer.innerHTML = logs.map((log, i) => `
        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background: var(--primary); flex-shrink: 0; margin-top: 4px;"></div>
            ${i < logs.length - 1 ? '<div style="width: 2px; flex: 1; background: var(--border-light); margin: 4px 0;"></div>' : ''}
          </div>
          <div style="flex: 1; padding-bottom: 8px;">
            <div style="font-size: 14px; font-weight: 600; color: var(--text-primary);">
              Status changed to <span class="badge badge-${log.new_status}">${log.new_status.replace('_', ' ')}</span>
            </div>
            ${log.note ? `<div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">${log.note}</div>` : ''}
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
              by ${log.changed_by_name || 'System'} · ${new Date(log.changed_at).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      `).join('');
    }

    // 3-Step Progress Tracker
    const statusSteps = ['pending', 'in_progress', 'resolved'];
    const stepIdx = statusSteps.indexOf(c.status);
    const progressContainer = document.getElementById('progress-steps-container');

    progressContainer.innerHTML = statusSteps.map((step, i) => {
      const isCompletedOrCurrent = i <= stepIdx;
      const isPast = i < stepIdx;
      return `
        <div style="display: flex; gap: 12px; margin-bottom: 16px; align-items: flex-start;">
          <div style="
            width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700;
            background: ${isCompletedOrCurrent ? 'var(--primary)' : 'var(--bg-tertiary)'};
            border: 2px solid ${isCompletedOrCurrent ? 'var(--primary)' : 'var(--border)'};
            color: ${isCompletedOrCurrent ? '#fff' : 'var(--text-muted)'};
          ">
            ${isPast ? '✓' : i + 1}
          </div>
          <div style="padding-top: 4px;">
            <div style="font-size: 14px; font-weight: 600; color: ${isCompletedOrCurrent ? 'var(--text-primary)' : 'var(--text-muted)'}; text-transform: capitalize;">
              ${step.replace('_', ' ')}
            </div>
            <div style="font-size: 12px; color: var(--text-muted);">
              ${i === 0 ? 'Issue reported' : i === 1 ? 'Worker assigned' : 'Complaint closed · +20 pts'}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Resolution / Rejection alert
    const alertBox = document.getElementById('status-alert-box');
    if (c.status === 'rejected') {
      alertBox.innerHTML = '<div class="alert alert-error">❌ This complaint was rejected.</div>';
    } else if (c.status === 'resolved') {
      alertBox.innerHTML = '<div class="alert alert-success">🎉 Resolved! You earned +20 reward points.</div>';
    } else {
      alertBox.innerHTML = '';
    }

    spinner.style.display = 'none';
    contentArea.style.display = 'block';

  } catch (err) {
    toast.error('Failed to load complaint details');
    spinner.style.display = 'none';
  }

  if (window.feather) {
    window.feather.replace();
  }
});
