// Rewards Marketplace Logic
document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth(['citizen']);
  if (!user) return;

  const spinner = document.getElementById('loading-spinner');
  const contentArea = document.getElementById('rewards-content');

  const tabCatalogBtn = document.getElementById('tab-catalog-btn');
  const tabHistoryBtn = document.getElementById('tab-history-btn');
  const catalogView = document.getElementById('catalog-view');
  const historyView = document.getElementById('history-card');

  let catalog = [];
  let pointsData = { current_points: 0, total_earned: 0, total_redeemed: 0 };
  let transactions = [];

  function switchTab(tab) {
    if (tab === 'catalog') {
      tabCatalogBtn.classList.add('active');
      tabHistoryBtn.classList.remove('active');
      catalogView.style.display = 'grid';
      historyView.style.display = 'none';
    } else {
      tabCatalogBtn.classList.remove('active');
      tabHistoryBtn.classList.add('active');
      catalogView.style.display = 'none';
      historyView.style.display = 'block';
    }
  }

  tabCatalogBtn.addEventListener('click', () => switchTab('catalog'));
  tabHistoryBtn.addEventListener('click', () => switchTab('history'));

  function getCategoryEmoji(cat) {
    switch (cat) {
      case 'Shopping': return '🛍️';
      case 'Cashback': return '💸';
      case 'Entertainment': return '🎬';
      case 'Civic': return '🏛️';
      case 'Transport': return '🚌';
      case 'Environment': return '🌱';
      default: return '🎁';
    }
  }

  function renderData() {
    // Points banner
    document.getElementById('available-points').textContent = pointsData.current_points ?? 0;
    document.getElementById('total-earned').textContent = pointsData.total_earned ?? 0;
    document.getElementById('total-redeemed').textContent = pointsData.total_redeemed ?? 0;

    // Catalog items
    catalogView.innerHTML = catalog.map(item => {
      const canAfford = (pointsData.current_points ?? 0) >= item.points_required;
      return `
        <div class="reward-card ${!canAfford ? 'locked' : ''}">
          <div class="reward-emoji">${getCategoryEmoji(item.category)}</div>
          <div class="reward-category">${item.category || 'General'}</div>
          <h3 class="reward-name">${item.name}</h3>
          <p class="reward-desc">${item.description || ''}</p>
          <div class="reward-footer">
            <div class="reward-points"><i data-feather="star" style="width: 14px; height: 14px;"></i> ${item.points_required} pts</div>
            <button
              class="btn ${canAfford ? 'btn-primary' : 'btn-ghost'} btn-sm redeem-btn"
              data-id="${item.id}"
              data-name="${item.name}"
              data-pts="${item.points_required}"
              ${!canAfford ? 'disabled' : ''}
            >
              ${canAfford ? 'Redeem' : 'Not enough pts'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach redeem listeners
    document.querySelectorAll('.redeem-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = parseInt(btn.dataset.id);
        const name = btn.dataset.name;
        const pts = btn.dataset.pts;

        if (!confirm(`Redeem "${name}" for ${pts} points?`)) return;

        btn.disabled = true;
        btn.textContent = 'Redeeming...';

        try {
          await rewardService.redeem(id);
          toast.success(`Redeemed "${name}" successfully! 🎉`);
          await loadAll();
        } catch (err) {
          toast.error(err.message || 'Redemption failed');
          btn.disabled = false;
          btn.textContent = 'Redeem';
        }
      });
    });

    // History items
    const historyContainer = document.getElementById('history-table-body');
    if (transactions.length === 0) {
      document.getElementById('history-card').innerHTML = `
        <div class="empty-state">
          <span>📋</span>
          <h3>No transactions yet</h3>
          <p>Earn points by reporting issues or redeeming catalog rewards.</p>
        </div>
      `;
    } else {
      historyContainer.innerHTML = transactions.map(t => `
        <tr>
          <td><span class="badge ${t.type === 'earned' ? 'badge-resolved' : 'badge-rejected'}">${t.type}</span></td>
          <td>${t.description}</td>
          <td style="font-weight: 700; color: ${t.type === 'earned' ? 'var(--primary)' : 'var(--danger)'};">
            ${t.type === 'earned' ? '+' : '-'}${t.points}
          </td>
          <td>${new Date(t.created_at).toLocaleDateString('en-IN')}</td>
        </tr>
      `).join('');
    }

    if (window.feather) feather.replace();
  }

  async function loadAll() {
    try {
      const [c, p, t] = await Promise.all([
        rewardService.getCatalog(),
        rewardService.getMyPoints(),
        rewardService.getTransactions()
      ]);
      catalog = c || [];
      pointsData = p || { current_points: 0, total_earned: 0, total_redeemed: 0 };
      transactions = t || [];
      renderData();
    } catch (e) {
      toast.error('Failed to load rewards');
    }
  }

  await loadAll();
  spinner.style.display = 'none';
  contentArea.style.display = 'block';
});
