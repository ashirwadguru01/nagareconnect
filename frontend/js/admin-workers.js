// Admin Workers Logic
document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth(['admin']);
  if (!user) return;

  const spinner = document.getElementById('loading-spinner');
  const contentArea = document.getElementById('workers-content');

  const countEl = document.getElementById('workers-count');
  const bonusBanner = document.getElementById('bonus-workers-banner');
  const bonusNamesEl = document.getElementById('bonus-worker-names');

  const tabOverviewBtn = document.getElementById('tab-overview-btn');
  const tabPerfBtn = document.getElementById('tab-perf-btn');
  const overviewCard = document.getElementById('overview-card');
  const perfCard = document.getElementById('performance-card');

  const overviewTableBody = document.getElementById('overview-table-body');
  const perfContainer = document.getElementById('performance-list');

  let workers = [];
  let performance = [];

  function switchTab(tab) {
    if (tab === 'overview') {
      tabOverviewBtn.classList.add('btn-primary');
      tabOverviewBtn.classList.remove('btn-ghost');
      tabPerfBtn.classList.add('btn-ghost');
      tabPerfBtn.classList.remove('btn-primary');
      overviewCard.style.display = 'block';
      perfCard.style.display = 'none';
    } else {
      tabOverviewBtn.classList.add('btn-ghost');
      tabOverviewBtn.classList.remove('btn-primary');
      tabPerfBtn.classList.add('btn-primary');
      tabPerfBtn.classList.remove('btn-ghost');
      overviewCard.style.display = 'none';
      perfCard.style.display = 'block';
    }
  }

  tabOverviewBtn.addEventListener('click', () => switchTab('overview'));
  tabPerfBtn.addEventListener('click', () => switchTab('performance'));

  function renderData() {
    countEl.textContent = `${workers.length} municipal workers registered`;

    const bonusWorkers = performance.filter(w => w.bonus_eligible);
    if (bonusWorkers.length > 0) {
      bonusNamesEl.textContent = `${bonusWorkers.length} worker(s) are eligible for bonus this month: ${bonusWorkers.map(w => w.name).join(', ')}`;
      bonusBanner.style.display = 'flex';
    } else {
      bonusBanner.style.display = 'none';
    }

    // Overview Table
    if (workers.length === 0) {
      overviewTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">No workers registered yet.</td></tr>';
    } else {
      overviewTableBody.innerHTML = workers.map(w => `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="
                width: 34px; height: 34px; border-radius: 50%;
                background: linear-gradient(135deg, #fdcb6e, #e17055);
                display: flex; align-items: center; justify-content: center;
                font-size: 13px; font-weight: 700; color: #fff;
              ">
                ${(w.name?.[0] || 'W').toUpperCase()}
              </div>
              <span style="font-weight: 600; color: var(--text-primary);">${w.name}</span>
            </div>
          </td>
          <td style="font-size: 13px;">${w.email}</td>
          <td style="font-size: 13px;">${w.phone || '—'}</td>
          <td style="font-weight: 700;">${w.total_assigned || 0}</td>
          <td style="font-weight: 700; color: var(--primary);">${w.total_resolved || 0}</td>
          <td><span class="badge ${w.is_active ? 'badge-resolved' : 'badge-rejected'}">${w.is_active ? 'Active' : 'Disabled'}</span></td>
        </tr>
      `).join('');
    }

    // Performance List
    if (performance.length === 0) {
      perfContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 13px;">No monthly performance data yet.</p>';
    } else {
      perfContainer.innerHTML = performance.map(w => {
        const pct = Math.min(((w.resolved_count || 0) / 100) * 100, 100);
        return `
          <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; flex-wrap: wrap; gap: 4px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; font-size: 14px;">${w.name}</span>
                ${w.bonus_eligible ? '<span class="badge badge-resolved">🏆 Bonus Eligible</span>' : ''}
              </div>
              <span style="font-size: 14px; font-weight: 700; color: ${w.bonus_eligible ? 'var(--primary)' : 'var(--text-secondary)'};">
                ${w.resolved_count || 0} / 100
              </span>
            </div>
            <div style="height: 8px; background: var(--bg-tertiary); border-radius: 999px; overflow: hidden;">
              <div style="
                height: 100%; width: ${pct}%;
                background: ${w.bonus_eligible ? 'linear-gradient(90deg, var(--primary), var(--accent))' : 'var(--info)'};
                border-radius: 999px; transition: width 0.6s ease;
              "></div>
            </div>
          </div>
        `;
      }).join('');
    }

    if (window.feather) feather.replace();
  }

  try {
    const [workersRes, perfRes] = await Promise.all([
      adminService.getWorkers(),
      adminService.getWorkerPerformance()
    ]);

    workers = workersRes || [];
    performance = perfRes || [];
    renderData();

    spinner.style.display = 'none';
    contentArea.style.display = 'block';
  } catch (err) {
    toast.error('Failed to load workers data');
    spinner.style.display = 'none';
  }
});
