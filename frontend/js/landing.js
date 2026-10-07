// Landing Page logic
document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  const navActions = document.getElementById('nav-actions');
  const heroPrimaryBtn = document.getElementById('hero-primary-btn');

  if (user) {
    const dashUrl = getDashboardUrl(user.role);
    if (navActions) {
      navActions.innerHTML = `
        <a href="${dashUrl}" class="btn btn-primary">Dashboard →</a>
      `;
    }
    if (heroPrimaryBtn) {
      heroPrimaryBtn.href = dashUrl;
      heroPrimaryBtn.textContent = 'Go to Dashboard →';
    }
  }

  if (window.feather) {
    window.feather.replace();
  }
});
