(function () {
  if (window.RaiSafe) return;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function highlight(value, query) {
    const text = String(value ?? '');
    if (!query) return escape(text);
    const pattern = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    let result = '', position = 0;
    for (const match of text.matchAll(pattern)) {
      result += escape(text.slice(position, match.index)) + '<mark>' + escape(match[0]) + '</mark>';
      position = match.index + match[0].length;
    }
    return result + escape(text.slice(position));
  }
  function pageUrl(value = location.href) {
    try {
      const url = new URL(value, location.origin);
      if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return null;
      const path = url.pathname.replace(/\/+$/, '') || '/';
      if (path === '/case' && /^[a-z0-9-]+$/.test(url.searchParams.get('id') || '')) return '/case/' + url.searchParams.get('id');
      return path;
    } catch { return null; }
  }
  function bookmarks(value) {
    if (!Array.isArray(value)) return [];
    const seen = new Set();
    return value.flatMap(item => {
      if (!item || typeof item.url !== 'string' || typeof item.title !== 'string') return [];
      const url = pageUrl(item.url);
      if (!url || seen.has(url)) return [];
      seen.add(url);
      return [{url, title:item.title, desc:typeof item.desc === 'string' ? item.desc : '', date:typeof item.date === 'string' ? item.date : ''}];
    });
  }
  window.RaiSafe = { escape, highlight, pageUrl, bookmarks };
})();
