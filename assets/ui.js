// Apply saved theme immediately to prevent flash of unstyled content
(function () {
  if (localStorage.getItem('rai-theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('nav');
  if (!nav || nav.querySelector('.nav-icon-btn')) return;

  const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

  const moonSVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  const sunSVG  = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

  // Search icon
  const searchEl = document.createElement('a');
  searchEl.href = '/search';
  searchEl.className = 'nav-icon-btn';
  searchEl.title = 'Search';
  searchEl.setAttribute('aria-label', 'Search');
  searchEl.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="7.5"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>`;

  // Theme toggle
  const themeBtn = document.createElement('button');
  themeBtn.className = 'nav-icon-btn';
  themeBtn.title = 'Toggle dark mode';
  themeBtn.setAttribute('aria-label', 'Toggle dark mode');
  themeBtn.innerHTML = isDark() ? sunSVG : moonSVG;

  themeBtn.addEventListener('click', () => {
    if (isDark()) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('rai-theme', 'light');
      themeBtn.innerHTML = moonSVG;
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('rai-theme', 'dark');
      themeBtn.innerHTML = sunSVG;
    }
  });

  nav.appendChild(searchEl);
  nav.appendChild(themeBtn);
});
