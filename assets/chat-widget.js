/* ── RAI Multi-Window Chat ── */

const MODES = [
  { id: 'researcher', label: 'Researcher' },
  { id: 'skeptic',    label: 'Skeptic' },
  { id: 'guide',      label: 'Guide' },
  { id: 'compare',    label: 'Compare' },
];

const STARTERS = {
  researcher: [
    'What does the research say about consciousness surviving death?',
    'Explain the Penrose-Hameroff Orch OR theory',
    'What patterns appear across NDE reports globally?',
    'How does Ian Stevenson\'s reincarnation research work?',
    'What is the hard problem of consciousness?',
    'What did the AWARE study find about near-death experiences?',
    'How does quantum biology relate to consciousness?',
    'What evidence exists for veridical NDEs?',
    'How do children\'s past-life memories get scientifically verified?',
    'What is Integrated Information Theory and what does it predict?',
    'What did Pim van Lommel\'s cardiac arrest study conclude?',
    'What is the Global Consciousness Project and what has it found?',
    'How does the filter theory of consciousness differ from production theory?',
    'What brain changes occur during a near-death experience?',
    'What is the significance of terminal lucidity before death?',
  ],
  skeptic: [
    'What are the strongest objections to NDE survival claims?',
    'How does oxygen deprivation explain near-death experiences?',
    'What are the methodological problems with reincarnation research?',
    'Why hasn\'t parapsychology produced accepted science after 140 years?',
    'Can hallucinations and REM intrusion fully explain NDEs?',
    'What\'s the best materialist explanation for past-life memories in children?',
    'How does confirmation bias affect consciousness research?',
    'Is the filter theory of consciousness actually testable?',
    'What do mainstream neuroscientists say about the soul?',
    'How does the brain generate the illusion of a unified self?',
    'What\'s wrong with the methodology in NDE studies?',
    'Could expectation and culture explain NDE similarities globally?',
  ],
  guide: [
    'I had an experience I don\'t have words for',
    'I\'m not sure if what I experienced was real',
    'Someone I love recently died and I\'ve been wondering…',
    'I\'ve been having vivid dreams about a past life',
    'I\'m afraid of dying — what does the research actually say?',
    'I feel like I\'ve lived before. Is that possible?',
    'How do I process or make sense of a near-death experience?',
    'Why do I feel like consciousness is bigger than my body?',
    'I was with someone when they passed and I saw something',
    'What happens to our awareness in the moments before death?',
    'Can love survive death? What does the science suggest?',
    'I feel a deep connection to a place or time I\'ve never known',
  ],
  compare: [
    'How do materialist and filter theories explain NDEs differently?',
    'Compare IIT, Global Workspace Theory, and Orch OR',
    'What does each major theory say about consciousness after death?',
    'How does panpsychism differ from the filter theory of mind?',
    'How do Eastern and Western science view consciousness differently?',
    'Compare Buddhist, Hindu and scientific frameworks on rebirth',
    'How do dualism and physicalism differ on the mind-body problem?',
    'How do NDEs compare to psychedelic experiences scientifically?',
    'Compare Stevenson\'s methodology with modern past-life research',
    'What do quantum mechanics and neuroscience disagree about?',
    'How do the Tibetan Book of the Dead and NDE research compare?',
    'Compare the survival hypothesis with the super-psi hypothesis',
  ],
};

/* ── Window gap + width for tiling ── */
const WINDOW_WIDTH  = 390;
const WINDOW_GAP    = 14;
const FAB_ZONE      = 100; // right space reserved for FAB

/* ── RaiManager — owns all open windows and the FAB ── */
const RaiManager = (() => {
  const windows = [];

  function openWindow(restoreState) {
    /* On mobile keep at most one window */
    if (window.innerWidth <= 600 && windows.length > 0) {
      windows[windows.length - 1].el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const win = new ChatWindow(restoreState || null);
    windows.push(win);
    reposition();
  }

  function closeWindow(win) {
    const idx = windows.indexOf(win);
    if (idx === -1) return;
    win.destroy();
    windows.splice(idx, 1);
    reposition();
  }

  function reposition() {
    /* Tile windows right→left, accounting for FAB zone */
    windows.forEach((win, i) => {
      const rightOffset = FAB_ZONE + i * (WINDOW_WIDTH + WINDOW_GAP);
      win.el.style.right = rightOffset + 'px';
    });
  }

  function init() {
    /* FAB */
    const fabEl = document.createElement('div');
    fabEl.className = 'rai-manager-fab';
    fabEl.innerHTML = `
      <button class="rai-fab" aria-label="Open new RAI chat">
        <span class="rai-fab-icon">✦</span>
        <span class="rai-fab-label">ASK RAI</span>
      </button>`;
    fabEl.querySelector('.rai-fab').addEventListener('click', () => openWindow());
    document.body.appendChild(fabEl);

    /* Restore last session as first window */
    const saved = (() => {
      try {
        const raw = sessionStorage.getItem('rai_widget_v1');
        if (!raw) return null;
        const s = JSON.parse(raw);
        return (Array.isArray(s.history) && s.history.length) ? s : null;
      } catch { return null; }
    })();
    if (saved) openWindow(saved);
  }

  return { init, openWindow, closeWindow };
})();

/* ── ChatWindow — fully self-contained chat instance ── */
class ChatWindow {
  constructor(savedState) {
    this.uid      = 'rai-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    this.history  = savedState?.history  || [];
    this.chatMode = savedState?.chatMode || 'researcher';
    this.busy     = false;
    this.startersShown = !this.history.length;
    this.el = null;
    this._build();
  }

  /* ── DOM ── */
  _build() {
    const uid = this.uid;
    this.el = document.createElement('div');
    this.el.className = 'rai-window';
    this.el.id = uid;
    this.el.innerHTML = `
      <div class="rai-panel">
        <div class="rai-header">
          <div class="rai-header-left">
            <div class="rai-avatar">R</div>
            <div>
              <div class="rai-title">RAI</div>
              <div class="rai-subtitle">Soul Science Research</div>
            </div>
          </div>
          <div class="rai-header-actions">
            <button class="rai-new-btn" title="Open a new chat window">New chat</button>
            <button class="rai-close-btn" title="Close this window">&#x2715;</button>
          </div>
        </div>
        <div class="rai-modes"></div>
        <div class="rai-msgs">
          <div class="rai-starters"></div>
        </div>
        <div class="rai-input-wrap">
          <textarea placeholder="Ask about consciousness, NDEs…" rows="1"></textarea>
          <button class="rai-send" disabled>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M14 8L2 2l2.5 6L2 14l12-6z" fill="white"/>
            </svg>
          </button>
        </div>
        <div class="rai-footer-row">
          <div class="rai-disclaimer">RAI synthesizes research — not medical or spiritual advice</div>
          <button class="rai-save-btn rai-btn-reading" hidden>📚 Reading list</button>
          <button class="rai-save-btn rai-btn-share" hidden>✦ Share</button>
          <button class="rai-save-btn rai-btn-save" hidden>↓ Save</button>
        </div>
      </div>`;
    document.body.appendChild(this.el);
    this._bindEvents();
    this._renderModes();
    if (this.history.length) {
      this._restoreMessages();
      this._showActions();
    } else {
      this._renderStarters();
    }
  }

  _q(sel) { return this.el.querySelector(sel); }

  _bindEvents() {
    /* Close */
    this._q('.rai-close-btn').addEventListener('click', () => RaiManager.closeWindow(this));

    /* New chat window */
    this._q('.rai-new-btn').addEventListener('click', () => RaiManager.openWindow());

    /* Input */
    const ta = this._q('textarea');
    ta.addEventListener('input', () => this._resizeTextarea());
    ta.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); }
    });

    /* Send */
    this._q('.rai-send').addEventListener('click', () => this.send());

    /* Footer actions */
    this._q('.rai-btn-save').addEventListener('click',    () => this._saveChat());
    this._q('.rai-btn-reading').addEventListener('click', () => this.send('Based on our conversation so far, please generate a personalized reading list for me — books, papers, and researchers I should explore next. Organize by topic and include a brief note on why each is relevant to what we discussed.'));
    this._q('.rai-btn-share').addEventListener('click',   () => this._shareCard());
  }

  _resizeTextarea() {
    const ta = this._q('textarea');
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 100) + 'px';
    this._q('.rai-send').disabled = !ta.value.trim() || this.busy;
  }

  _renderModes() {
    this._q('.rai-modes').innerHTML = MODES.map(m =>
      `<button class="rai-mode-btn${m.id === this.chatMode ? ' active' : ''}" data-mode="${m.id}">${m.label}</button>`
    ).join('');
    this._q('.rai-modes').addEventListener('click', e => {
      const btn = e.target.closest('.rai-mode-btn');
      if (!btn) return;
      this.chatMode = btn.dataset.mode;
      this._renderModes();
      if (this.startersShown) this._renderStarters();
      this._save();
    });
  }

  _renderStarters() {
    const el = this._q('.rai-starters');
    if (!el) return;
    const pool = STARTERS[this.chatMode].slice();
    const picked = pool.sort(() => Math.random() - 0.5).slice(0, 2);
    el.innerHTML = picked.map(q =>
      `<button class="rai-starter">${q}</button>`
    ).join('');
    el.querySelectorAll('.rai-starter').forEach(btn => {
      btn.addEventListener('click', () => this.send(btn.textContent));
    });
  }

  _restoreMessages() {
    const msgs = this._q('.rai-msgs');
    const starters = this._q('.rai-starters');
    if (starters) starters.remove();
    for (const m of this.history) {
      msgs.insertAdjacentHTML('beforeend', m.role === 'user'
        ? `<div class="rai-msg user"><div class="rai-bubble user">${_esc(m.content)}</div></div>`
        : `<div class="rai-msg assistant"><div class="rai-avatar-sm">R</div><div class="rai-bubble assistant">${_md(m.content)}</div></div>`
      );
    }
    setTimeout(() => { msgs.scrollTop = msgs.scrollHeight; }, 50);
  }

  _showActions() {
    this._q('.rai-btn-save').hidden    = false;
    this._q('.rai-btn-reading').hidden = false;
    this._q('.rai-btn-share').hidden   = false;
  }

  /* ── Session persistence (keyed per-window so windows don't clobber each other) ── */
  _save() {
    try {
      /* Always persist the most-recently-active window as the restoration candidate */
      sessionStorage.setItem('rai_widget_v1', JSON.stringify({
        history: this.history,
        chatMode: this.chatMode,
      }));
    } catch {}
  }

  destroy() {
    this.el.style.animation = 'raiPanelIn .15s ease reverse';
    setTimeout(() => this.el.remove(), 140);
  }

  /* ── Send ── */
  async send(text) {
    const ta      = this._q('textarea');
    const msgs    = this._q('.rai-msgs');
    const sendBtn = this._q('.rai-send');
    const msg     = (typeof text === 'string' ? text : ta.value).trim();
    if (!msg || this.busy) return;

    /* Remove starters on first message */
    if (this.startersShown) {
      const s = this._q('.rai-starters');
      if (s) s.remove();
      this.startersShown = false;
    }

    if (typeof text !== 'string') { ta.value = ''; ta.style.height = 'auto'; }
    sendBtn.disabled = true;
    this.busy = true;
    this.history.push({ role: 'user', content: msg });
    this._save();

    msgs.insertAdjacentHTML('beforeend',
      `<div class="rai-msg user"><div class="rai-bubble user">${_esc(msg)}</div></div>`
    );

    const assistId = this.uid + '-a' + Date.now();
    msgs.insertAdjacentHTML('beforeend', `
      <div class="rai-msg assistant">
        <div class="rai-avatar-sm">R</div>
        <div class="rai-bubble assistant" id="${assistId}">
          <span class="rai-cursor"><span>✦</span><span>✦</span><span>✦</span></span>
        </div>
      </div>`
    );
    document.getElementById(assistId)?.closest('.rai-msg')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    let content = '';
    const setBubble = html => {
      const b = document.getElementById(assistId);
      if (b) b.innerHTML = html;
    };

    const parseChunk = chunk => {
      for (const line of chunk.split('\n\n')) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const ev = JSON.parse(data);
          if (ev.error) throw new Error(ev.error);
          if (ev.text) {
            content += ev.text;
            setBubble(_md(content) + '<span class="rai-cursor"><span>✦</span><span>✦</span><span>✦</span></span>');
          }
        } catch (e) { if (e.message && !e.message.startsWith('Unexpected')) throw e; }
      }
    };

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: this.history, mode: this.chatMode }),
      });

      if (!res.ok) {
        setBubble('Sorry, something went wrong. Please try again.');
        this.history.pop();
        this._save();
        return;
      }

      if (res.body?.getReader) {
        const reader = res.body.getReader();
        const dec    = new TextDecoder();
        let buf = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const parts = buf.split('\n\n');
          buf = parts.pop() ?? '';
          for (const p of parts) parseChunk(p + '\n\n');
        }
        if (buf) parseChunk(buf);
      } else {
        parseChunk(await res.text());
      }

      setBubble(content ? _md(content) : 'No response. Please try again.');
      if (content) {
        this.history.push({ role: 'assistant', content });
        this._save();
        this._showActions();
      }
    } catch {
      setBubble('Connection error. Please try again.');
      this.history.pop();
      this._save();
    } finally {
      this.busy = false;
      sendBtn.disabled = false;
    }
  }

  /* ── Save transcript ── */
  _saveChat() {
    if (!this.history.length) return;
    const modeLabel = { researcher:'Researcher', skeptic:'Skeptic', guide:'Gentle Guide', compare:'Compare Theories' };
    const date = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
    const lines = ['ReincarnatedAI — Chat Transcript', date + ' · Mode: ' + (modeLabel[this.chatMode] || this.chatMode), '', '─'.repeat(48), ''];
    for (const m of this.history) {
      lines.push(m.role === 'user' ? 'You:' : 'RAI:');
      lines.push(m.content.trim(), '');
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain' }));
    a.download = 'reincarnatedai-chat-' + new Date().toISOString().slice(0, 10) + '.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /* ── Share card ── */
  _shareCard() {
    const userMsgs = this.history.filter(m => m.role === 'user');
    const aiMsgs   = this.history.filter(m => m.role === 'assistant');
    if (!userMsgs.length || !aiMsgs.length) return;
    const question = userMsgs[userMsgs.length - 1].content;
    const answer   = aiMsgs[aiMsgs.length - 1].content.replace(/[#*`_>]/g,'').replace(/\s+/g,' ').trim();
    const W = 1080, H = 580;
    const canvas = document.createElement('canvas');
    canvas.width = W * 2; canvas.height = H * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0,'#0D0B1F'); bg.addColorStop(1,'#170F38');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W*.12, H*.5, 0, W*.12, H*.5, W*.55);
    glow.addColorStop(0,'rgba(109,40,217,.2)'); glow.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(160,139,222,.6)'; ctx.font = '600 11px Inter,system-ui,sans-serif';
    ctx.fillText('REINCARNATEDAI', 52, 52);
    ctx.fillStyle = 'rgba(139,92,246,.5)'; ctx.font = '13px system-ui'; ctx.fillText('✦', 52, 88);
    const qTrunc = question.length > 100 ? question.slice(0,97)+'…' : question;
    ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.font = '400 13px Inter,system-ui,sans-serif'; ctx.fillText(qTrunc, 52, 120);
    ctx.strokeStyle = 'rgba(139,92,246,.2)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(52,140); ctx.lineTo(W-52,140); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = '600 20px Inter,system-ui,sans-serif';
    (function wrap(text, x, y, maxW, lh, max) {
      const words = text.split(' '); let line = '', count = 0;
      for (let i = 0; i < words.length; i++) {
        const test = line + words[i] + ' ';
        if (ctx.measureText(test).width > maxW && i > 0) {
          ctx.fillText(line.trim(), x, y + count*lh); line = words[i]+' '; count++;
          if (count >= max) { ctx.fillText(line.trim()+'…', x, y+count*lh); return; }
        } else { line = test; }
      }
      if (line.trim()) ctx.fillText(line.trim(), x, y+count*lh);
    })(answer, 52, 172, W-104, 30, 7);
    const date = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
    ctx.fillStyle = 'rgba(139,92,246,.45)'; ctx.font = '500 11px Inter,system-ui,sans-serif';
    ctx.fillText('reincarnatedai.com', 52, H-32);
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    ctx.fillText(date, W-52-ctx.measureText(date).width, H-32);
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'reincarnatedai-' + new Date().toISOString().slice(0,10) + '.png';
    a.click();
  }
}

/* ── Helpers ── */
function _esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function _md(text) {
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/^### (.+)$/gm,'<h3>$1</h3>')
    .replace(/^## (.+)$/gm,'<h2>$1</h2>')
    .replace(/^# (.+)$/gm,'<h1>$1</h1>')
    .replace(/\n\n+/g,'</p><p>')
    .replace(/^(.)/,'<p>$1').replace(/(.)$/,'$1</p>');
}

/* ── Boot ── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => RaiManager.init());
} else {
  RaiManager.init();
}
