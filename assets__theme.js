// ============================================================
// Kate Chaparro — Portfolio Theme Toggle
// Persists user choice across pages. Runs immediately to avoid
// flash of unstyled content (FOUC).
// ============================================================

(function() {
  // Apply theme immediately on script load (before DOM render finishes)
  const stored = localStorage.getItem('kc-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', initialTheme);

  // Wire up toggle buttons after DOM is ready
  function init() {
    const buttons = document.querySelectorAll('[data-theme-toggle]');
    buttons.forEach(btn => updateButton(btn, document.documentElement.getAttribute('data-theme')));

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('kc-theme', next);
        document.querySelectorAll('[data-theme-toggle]').forEach(b => updateButton(b, next));
      });
    });
  }

  function updateButton(btn, theme) {
    const icon = btn.querySelector('.icon');
    const label = btn.querySelector('.label');
    if (theme === 'dark') {
      if (icon) icon.textContent = '☀';
      if (label) label.textContent = 'LIGHT';
    } else {
      if (icon) icon.textContent = '☾';
      if (label) label.textContent = 'DARK';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
