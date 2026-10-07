// ========================================================
// Stat Card Component (Vanilla JS & Web Component)
// ========================================================

/**
 * Generate HTML for a stat card.
 * @param {object} config
 * @param {string}  config.icon         - Emoji or feather icon name
 * @param {string|number} config.value  - Main metric value
 * @param {string}  config.label        - Card label
 * @param {string} [config.accentColor] - CSS colour for stripe & icon
 * @param {string} [config.iconBg]      - CSS colour for icon background
 * @param {object} [config.trend]       - { direction: 'up'|'down', text: '+12 this month' }
 * @param {string} [config.id]          - Optional id for value element (for live updates)
 * @returns {string} HTML string
 */
function statCardHtml(config = {}) {
  const {
    icon = '📊',
    value = 0,
    label = '',
    accentColor = 'var(--primary)',
    iconBg = 'rgba(0, 184, 148, 0.12)',
    trend = null,
    id = '',
  } = config;

  const trendHtml = trend
    ? `<div class="stat-trend ${trend.direction || 'up'}">
        ${trend.direction === 'down' ? '↓' : '↑'} ${trend.text}
       </div>`
    : '';

  return `
    <div class="stat-card" style="--accent-color: ${accentColor}; --icon-bg: ${iconBg};">
      <div class="stat-icon">${icon}</div>
      <div class="stat-info">
        <div class="stat-value" ${id ? `id="${id}"` : ''}>${value}</div>
        <div class="stat-label">${label}</div>
        ${trendHtml}
      </div>
    </div>
  `;
}

/**
 * Animate a stat value counter from 0 to target.
 * @param {HTMLElement|string} el     - Element or selector
 * @param {number}             target - Target number
 * @param {number}            [duration=800]  - ms
 */
function animateCounter(el, target, duration = 800) {
  const element = typeof el === 'string' ? document.querySelector(el) : el;
  if (!element) return;

  const start = performance.now();
  const from  = parseInt(element.textContent) || 0;

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out quart
    const eased = 1 - Math.pow(1 - progress, 4);
    element.textContent = Math.round(from + (target - from) * eased);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// ---- Web Component: <stat-card> ----
// Usage: <stat-card icon="📋" value="42" label="Total Reports" accent="#6c5ce7"></stat-card>
class StatCardElement extends HTMLElement {
  connectedCallback() {
    const icon        = this.getAttribute('icon')   || '📊';
    const value       = this.getAttribute('value')  || '0';
    const label       = this.getAttribute('label')  || '';
    const accent      = this.getAttribute('accent') || 'var(--primary)';
    const iconBg      = this.getAttribute('icon-bg')|| '';
    const animate     = this.hasAttribute('animate');

    const derivedIconBg = iconBg || accent.replace(')', ', 0.12)').replace('rgb', 'rgba');

    this.innerHTML = statCardHtml({
      icon, value, label,
      accentColor: accent,
      iconBg: derivedIconBg,
    });

    if (animate) {
      const valueEl = this.querySelector('.stat-value');
      if (valueEl) {
        valueEl.textContent = '0';
        animateCounter(valueEl, parseInt(value) || 0);
      }
    }
  }
}

if (!customElements.get('stat-card')) {
  customElements.define('stat-card', StatCardElement);
}

// Expose globally
window.statCardHtml   = statCardHtml;
window.animateCounter = animateCounter;
