/**
 * Nagar e-Connect – Component Bundle (JS)
 * =========================================
 * Single script that pulls in all modular component scripts.
 * Include this AFTER api.js and auth.js.
 *
 * Usage in any HTML page (before page-specific script):
 *   <script src="/js/api.js"></script>
 *   <script src="/js/auth.js"></script>
 *   <script src="/components/components.js"></script>
 *   <script src="/js/your-page.js"></script>
 *
 * All components are loaded inline below so a single <script> tag suffices.
 * Alternatively, include individual component scripts as needed.
 */

// ── Inline all component scripts dynamically ──────────────────────────────────
(function () {
  const BASE = '/components';
  const scripts = [
    `${BASE}/toast/toast.js`,
    `${BASE}/modal/modal.js`,
    `${BASE}/spinner/spinner.js`,
    `${BASE}/badge/badge.js`,
    `${BASE}/stat-card/stat-card.js`,
    `${BASE}/complaint-card/complaint-card.js`,
    `${BASE}/navbar/navbar.js`,
    `${BASE}/sidebar/sidebar.js`,
  ];

  // Load sequentially to respect dependency order
  function loadNext(i) {
    if (i >= scripts.length) return;
    const s = document.createElement('script');
    s.src = scripts[i];
    s.onload = () => loadNext(i + 1);
    s.onerror = () => { console.warn('[Components] Failed to load:', scripts[i]); loadNext(i + 1); };
    document.head.appendChild(s);
  }

  // Start after DOM is ready to avoid race with auth/api
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => loadNext(0));
  } else {
    loadNext(0);
  }
})();
