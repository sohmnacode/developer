(function () {
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
    ],
    skeptic: [
      'What are the strongest objections to NDE survival claims?',
      'How does oxygen deprivation explain near-death experiences?',
    ],
    guide: [
      'I had an experience I don\'t have words for',
      'Someone I love recently died and I\'ve been wondering…',
    ],
    compare: [
      'How do materialist and filter theories explain NDEs differently?',
      'Compare IIT, Global Workspace Theory, and Orch OR',
    ],
  };

  let isOpen = false;
  let chatMode = 'researcher';
  let history = [];
  let busy = false;
  let startersShown = true;

  function init() {
    const widget = document.createElement('div');
    widget.id = 'rai-widget';
    widget.innerHTML = `
      <div class="rai-panel hidden" id="raiPanel">
        <div class="rai-header">
          <div class="rai-header-left">
            <div class="rai-avatar">R</div>
            <div>
              <div class="rai-title">RAI</div>
              <div class="rai-subtitle">Soul Science Research</div>
            </div>
          </div>
          <div style="display:flex;gap:6px">
            <button class="rai-hbtn" onclick="window.__raiToggle()" title="Minimize">&#8722;</button>
          </div>
        </div>
        <div class="rai-modes" id="raiModes"></div>
        <div class="rai-msgs" id="raiMsgs">
          <div class="rai-starters" id="raiStarters"></div>
        </div>
        <div class="rai-input-wrap">
          <textarea id="raiIn" placeholder="Ask about consciousness, NDEs…" rows="1"
            oninput="window.__raiResize(this)" onkeydown="window.__raiKey(event)"></textarea>
          <button class="rai-send" id="raiSend" onclick="window.__raiSend()" disabled>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M14 8L2 2l2.5 6L2 14l12-6z" fill="white"/>
            </svg>
          </button>
        </div>
        <div class="rai-disclaimer">RAI synthesizes research — not medical or spiritual advice</div>
      </div>
      <button class="rai-fab" onclick="window.__raiToggle()" aria-label="Open RAI chat">
        <span class="rai-fab-icon">✦</span>
        <span class="rai-fab-label">ASK RAI</span>
      </button>
    `;
    document.body.appendChild(widget);

    // Intercept all "ASK RAI" nav links
    document.querySelectorAll('a.cta-nav, a.cta').forEach(el => {
      const href = el.getAttribute('href') || '';
      if (href.includes('chatbox') || el.textContent.trim() === 'ASK RAI') {
        el.addEventListener('click', e => {
          e.preventDefault();
          window.__raiToggle(true);
        });
        el.removeAttribute('href');
        el.style.cursor = 'pointer';
      }
    });

    renderModes();
    renderStarters();
  }

  function renderModes() {
    document.getElementById('raiModes').innerHTML = MODES.map(m =>
      `<button class="rai-mode-btn${m.id === chatMode ? ' active' : ''}"
        onclick="window.__raiSetMode('${m.id}')">${m.label}</button>`
    ).join('');
  }

  function renderStarters() {
    const el = document.getElementById('raiStarters');
    if (!el) return;
    el.innerHTML = STARTERS[chatMode].map(q =>
      `<button class="rai-starter" onclick="window.__raiSend(this.textContent)">${q}</button>`
    ).join('');
  }

  window.__raiToggle = function (forceOpen) {
    isOpen = forceOpen !== undefined ? !!forceOpen : !isOpen;
    const panel = document.getElementById('raiPanel');
    panel.classList.toggle('hidden', !isOpen);
    if (isOpen) setTimeout(() => document.getElementById('raiIn').focus(), 250);
  };

  window.__raiSetMode = function (mode) {
    chatMode = mode;
    renderModes();
    if (startersShown) renderStarters();
  };

  window.__raiResize = function (el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 100) + 'px';
    document.getElementById('raiSend').disabled = !el.value.trim() || busy;
  };

  window.__raiKey = function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); window.__raiSend(); }
  };

  window.__raiSend = async function (text) {
    const input   = document.getElementById('raiIn');
    const msgs    = document.getElementById('raiMsgs');
    const sendBtn = document.getElementById('raiSend');
    const msg     = (typeof text === 'string' ? text : input.value).trim();
    if (!msg || busy) return;

    // Hide starters
    if (startersShown) {
      const s = document.getElementById('raiStarters');
      if (s) s.remove();
      startersShown = false;
    }

    if (typeof text !== 'string') { input.value = ''; input.style.height = 'auto'; }
    sendBtn.disabled = true;
    busy = true;

    history.push({ role: 'user', content: msg });

    msgs.insertAdjacentHTML('beforeend',
      `<div class="rai-msg user"><div class="rai-bubble user">${esc(msg)}</div></div>`
    );

    const assistId = 'raiA' + Date.now();
    msgs.insertAdjacentHTML('beforeend', `
      <div class="rai-msg assistant">
        <div class="rai-avatar-sm">R</div>
        <div class="rai-bubble assistant" id="${assistId}"><span class="rai-cursor">▋</span></div>
      </div>
    `);
    // Scroll to top of new assistant message
    document.getElementById(assistId).closest('.rai-msg').scrollIntoView({ behavior: 'smooth', block: 'start' });

    let assistContent = '';

    function setBubble(html) {
      const b = document.getElementById(assistId);
      if (b) b.innerHTML = html;
    }

    function parseSSEChunk(chunk) {
      const lines = chunk.split('\n\n');
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) throw new Error(parsed.error);
          if (parsed.text) {
            assistContent += parsed.text;
            setBubble(md(assistContent) + '<span class="rai-cursor">▋</span>');
          }
        } catch (e) {
          if (e.message && !e.message.startsWith('Unexpected')) throw e;
        }
      }
    }

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, mode: chatMode }),
      });

      if (!res.ok) {
        setBubble('Sorry, something went wrong. Please try again.');
        history.pop();
        return;
      }

      // Streaming path (modern browsers + desktop)
      if (res.body && typeof res.body.getReader === 'function') {
        const reader  = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          // Pull complete events (separated by \n\n)
          const parts = buffer.split('\n\n');
          buffer = parts.pop() ?? '';
          for (const part of parts) parseSSEChunk(part + '\n\n');
        }
        // Flush remainder
        if (buffer) parseSSEChunk(buffer);
      } else {
        // Non-streaming fallback for older mobile browsers
        const raw = await res.text();
        parseSSEChunk(raw);
      }

      setBubble(assistContent ? md(assistContent) : 'No response. Please try again.');
      if (assistContent) history.push({ role: 'assistant', content: assistContent });

    } catch {
      setBubble('Connection error. Please try again.');
      history.pop();
    } finally {
      busy = false;
      sendBtn.disabled = false;
    }
  };

  function esc(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function md(text) {
    return text
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,'<em>$1</em>')
      .replace(/^### (.+)$/gm,'<h3>$1</h3>')
      .replace(/^## (.+)$/gm,'<h2>$1</h2>')
      .replace(/^# (.+)$/gm,'<h1>$1</h1>')
      .replace(/\n\n+/g,'</p><p>')
      .replace(/^(.)/,'<p>$1').replace(/(.)$/, '$1</p>');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
