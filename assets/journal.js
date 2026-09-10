(() => {
  const key = 'rai-experience-journal';
  const form = document.getElementById('form'), entries = document.getElementById('entries'), status = document.getElementById('journalStatus');
  let undoRows = null;
  const notify = text => { status.textContent = text; };
  function load() {
    let rows;
    try { rows = JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { throw new Error('Saved entries could not be read. Export a backup before changing them.'); }
    if (!Array.isArray(rows) || rows.some(r => !r || ['title','type','body','date'].some(k=>typeof r[k] !== 'string'))) throw new Error('Saved entries could not be read. Export a backup before changing them.');
    return rows;
  }
  function save(rows) {
    try { localStorage.setItem(key, JSON.stringify(rows)); }
    catch { throw new Error('This browser could not save your entry. Keep a copy of your text or export a backup.'); }
  }
  function render() {
    let rows;
    try { rows = load(); } catch { notify('Saved entries could not be read. Export a backup before changing them.'); return; }
    entries.replaceChildren();
    if (!rows.length) { const p = document.createElement('p'); p.className = 'lede'; p.textContent = 'No entries saved yet.'; entries.append(p); }
    rows.forEach((row, index) => {
      const article = document.createElement('article'); article.className = 'card';
      const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = `${row.type} · ${row.date}`;
      const title = document.createElement('h3'); title.textContent = row.title;
      const body = document.createElement('p'); body.style.whiteSpace = 'pre-wrap'; body.textContent = row.body;
      const remove = document.createElement('button'); remove.className = 'button secondary'; remove.textContent = 'Delete'; remove.setAttribute('aria-label', `Delete entry: ${row.title}`);
      remove.onclick = () => {
        try { const current = load(); const next = current.filter((_,i)=>i!==index); save(next); undoRows = current; document.getElementById('undoDelete').hidden = false; render(); notify('Entry deleted. You can undo this deletion.'); }
        catch (error) { notify(error.message); }
      };
      article.append(meta,title,body,remove); entries.append(article);
    });
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const title = document.getElementById('title').value.trim();
    const body = document.getElementById('body').value.trim();
    if (!body) { notify('Describe your experience before saving.'); return; }
    try {
      const rows = load(); rows.unshift({ title:title || 'Untitled experience', type:document.getElementById('type').value, body, date:new Date().toLocaleDateString() });
      save(rows); form.reset(); undoRows = null; document.getElementById('undoDelete').hidden = true; render(); notify('Entry saved in this browser.');
    } catch (error) { notify(error.message); }
  });
  document.getElementById('undoDelete').onclick = () => {
    if (!undoRows) return;
    try { save(undoRows); undoRows = null; document.getElementById('undoDelete').hidden = true; render(); notify('Entry restored.'); }
    catch (error) { notify(error.message); }
  };
  document.getElementById('export').onclick = () => {
    try {
      // Preserve the original bytes even if a stored record is malformed.
      const raw = localStorage.getItem(key) || '[]';
      const url = URL.createObjectURL(new Blob([raw], {type:'application/json'}));
      const link = document.createElement('a'); link.href = url; link.download = 'reincarnatedai-experience-journal.json'; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
    } catch { notify('This browser is blocking access to saved entries.'); }
  };
  render();
})();
