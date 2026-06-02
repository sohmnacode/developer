/* ── RAI Bookmarks ── */

const RaiBookmarks = (() => {
  const KEY = 'rai_bookmarks_v1';

  function get() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  }

  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
  }

  function has(url) {
    return get().some(b => b.url === url);
  }

  function add(item) {
    const list = get().filter(b => b.url !== item.url);
    list.unshift(item);
    save(list);
  }

  function remove(url) {
    save(get().filter(b => b.url !== url));
  }

  function toggle(item) {
    if (has(item.url)) { remove(item.url); return false; }
    add(item); return true;
  }

  return { get, has, add, remove, toggle };
})();

/* ── Inject bookmark button into nav ── */
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const url   = window.location.pathname.replace(/\/$/, '') || '/';
  const title = document.title.replace(/\s*\|.*$/, '').trim();
  const desc  = document.querySelector('meta[name="description"]')?.content || '';

  /* Don't show on bookmarks page itself */
  if (url === '/bookmarks') return;

  const bookmarkSVG   = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;
  const bookmarkedSVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;

  const btn = document.createElement('button');
  btn.className = 'nav-icon-btn nav-bookmark-btn';
  btn.title = RaiBookmarks.has(url) ? 'Remove bookmark' : 'Bookmark this page';
  btn.setAttribute('aria-label', 'Bookmark this page');
  btn.innerHTML = RaiBookmarks.has(url) ? bookmarkedSVG : bookmarkSVG;
  if (RaiBookmarks.has(url)) btn.classList.add('active');

  btn.addEventListener('click', () => {
    const added = RaiBookmarks.toggle({ url, title, desc, date: new Date().toISOString() });
    btn.innerHTML = added ? bookmarkedSVG : bookmarkSVG;
    btn.title = added ? 'Remove bookmark' : 'Bookmark this page';
    btn.classList.toggle('active', added);

    /* Toast feedback */
    showToast(added ? 'Page bookmarked' : 'Bookmark removed', added);
  });

  /* Insert before search icon (first .nav-icon-btn) or append */
  const firstIcon = nav.querySelector('.nav-icon-btn');
  if (firstIcon) nav.insertBefore(btn, firstIcon);
  else nav.appendChild(btn);
});

function showToast(msg, positive) {
  const existing = document.querySelector('.rai-bookmark-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'rai-bookmark-toast';
  toast.textContent = msg;
  toast.style.cssText = `
    position:fixed;bottom:88px;right:28px;z-index:10000;
    padding:10px 18px;border-radius:10px;font-size:13px;font-weight:500;
    background:${positive ? 'linear-gradient(135deg,#6D28D9,#8B5CF6)' : 'rgba(30,24,60,0.92)'};
    color:#fff;box-shadow:0 4px 20px rgba(100,75,180,.3);
    animation:raiToastIn .2s ease;font-family:'Inter',system-ui,sans-serif;
    pointer-events:none;
  `;
  document.body.appendChild(toast);

  const style = document.createElement('style');
  style.textContent = `@keyframes raiToastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`;
  document.head.appendChild(style);

  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity .25s'; }, 1800);
  setTimeout(() => toast.remove(), 2100);
}
