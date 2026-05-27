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

  const STATE_KEY = 'rai_widget_v1';
  let chatMode = 'researcher';
  let history = [];
  let busy = false;
  let startersShown = true;
  let isOpen = true;

  /* ── Persistence ── */
  function saveState() {
    try { sessionStorage.setItem(STATE_KEY, JSON.stringify({ history, chatMode, startersShown, isOpen })); } catch {}
  }
  function loadState() {
    try {
      const raw = sessionStorage.getItem(STATE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (Array.isArray(s.history) && s.history.length) history = s.history;
      if (s.chatMode) chatMode = s.chatMode;
      if (typeof s.startersShown === 'boolean') startersShown = s.startersShown;
      if (typeof s.isOpen === 'boolean') isOpen = s.isOpen;
    } catch {}
  }

  /* ── Build UI ── */
  function init() {
    loadState();

    const widget = document.createElement('div');
    widget.id = 'rai-widget';
    widget.innerHTML = `
      <div class="rai-panel${isOpen ? '' : ' rai-hidden'}" id="raiPanel">
        <div class="rai-header">
          <div class="rai-header-left">
            <div class="rai-avatar">R</div>
            <div>
              <div class="rai-title">RAI</div>
              <div class="rai-subtitle">Soul Science Research</div>
            </div>
          </div>
          <div class="rai-header-actions">
            <button class="rai-new-btn" onclick="window.__raiNewChat()" title="Start a new conversation">New chat</button>
            <button class="rai-min-btn" onclick="window.__raiMinimize()" title="Minimize">&#8722;</button>
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
        <div class="rai-footer-row">
          <div class="rai-disclaimer">RAI synthesizes research — not medical or spiritual advice</div>
          <button class="rai-save-btn" id="raiSave" onclick="window.__raiSaveChat()" hidden>↓ Save</button>
        </div>
      </div>
      <button class="rai-fab${isOpen ? ' rai-hidden' : ''}" id="raiFab" onclick="window.__raiMinimize()" aria-label="Open RAI chat">
        <span class="rai-fab-icon">✦</span>
        <span class="rai-fab-label">ASK RAI</span>
      </button>
    `;
    document.body.appendChild(widget);

    renderModes();
    if (history.length) {
      restoreMessages();
      document.getElementById('raiSave').hidden = false;
    } else if (startersShown) {
      renderStarters();
    }
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
    const pool = STARTERS[chatMode].slice();
    const picked = pool.sort(() => Math.random() - 0.5).slice(0, 2);
    el.innerHTML = picked.map(q =>
      `<button class="rai-starter" onclick="window.__raiSend(this.textContent)">${q}</button>`
    ).join('');
  }

  function restoreMessages() {
    const msgs = document.getElementById('raiMsgs');
    const startersEl = document.getElementById('raiStarters');
    if (startersEl) startersEl.remove();

    for (const m of history) {
      if (m.role === 'user') {
        msgs.insertAdjacentHTML('beforeend',
          `<div class="rai-msg user"><div class="rai-bubble user">${esc(m.content)}</div></div>`
        );
      } else {
        msgs.insertAdjacentHTML('beforeend', `
          <div class="rai-msg assistant">
            <div class="rai-avatar-sm">R</div>
            <div class="rai-bubble assistant">${md(m.content)}</div>
          </div>
        `);
      }
    }
    setTimeout(() => { msgs.scrollTop = msgs.scrollHeight; }, 50);
  }

  /* ── Public API ── */
  window.__raiMinimize = function () {
    isOpen = !isOpen;
    saveState();
    document.getElementById('raiPanel').classList.toggle('rai-hidden', !isOpen);
    document.getElementById('raiFab').classList.toggle('rai-hidden', isOpen);
  };

  window.__raiNewChat = function () {
    history = [];
    chatMode = 'researcher';
    startersShown = true;
    saveState();
    const msgs = document.getElementById('raiMsgs');
    msgs.innerHTML = '<div class="rai-starters" id="raiStarters"></div>';
    renderModes();
    renderStarters();
    document.getElementById('raiIn').value = '';
    document.getElementById('raiIn').style.height = 'auto';
    document.getElementById('raiSend').disabled = true;
    document.getElementById('raiSave').hidden = true;
  };

  window.__raiSaveChat = function () {
    if (!history.length) return;
    const modeLabel = { researcher: 'Researcher', skeptic: 'Skeptic', guide: 'Gentle Guide', compare: 'Compare Theories' };
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const lines = [
      'ReincarnatedAI — Chat Transcript',
      date + ' · Mode: ' + (modeLabel[chatMode] || chatMode),
      '',
      '─'.repeat(48),
      '',
    ];
    for (const m of history) {
      lines.push(m.role === 'user' ? 'You:' : 'RAI:');
      lines.push(m.content.trim());
      lines.push('');
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'reincarnatedai-chat-' + new Date().toISOString().slice(0, 10) + '.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  window.__raiSetMode = function (mode) {
    chatMode = mode;
    renderModes();
    if (startersShown) renderStarters();
    saveState();
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

    if (startersShown) {
      const s = document.getElementById('raiStarters');
      if (s) s.remove();
      startersShown = false;
      saveState();
    }

    if (typeof text !== 'string') { input.value = ''; input.style.height = 'auto'; }
    sendBtn.disabled = true;
    busy = true;

    history.push({ role: 'user', content: msg });
    saveState();

    msgs.insertAdjacentHTML('beforeend',
      `<div class="rai-msg user"><div class="rai-bubble user">${esc(msg)}</div></div>`
    );

    const assistId = 'raiA' + Date.now();
    msgs.insertAdjacentHTML('beforeend', `
      <div class="rai-msg assistant">
        <div class="rai-avatar-sm">R</div>
        <div class="rai-bubble assistant" id="${assistId}"><span class="rai-cursor"><span>✦</span><span>✦</span><span>✦</span></span></div>
      </div>
    `);
    const assistRow = document.getElementById(assistId).closest('.rai-msg');
    assistRow.scrollIntoView({ behavior: 'smooth', block: 'start' });

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
            setBubble(md(assistContent) + '<span class="rai-cursor"><span>✦</span><span>✦</span><span>✦</span></span>');
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
        saveState();
        return;
      }

      if (res.body && typeof res.body.getReader === 'function') {
        const reader  = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() ?? '';
          for (const part of parts) parseSSEChunk(part + '\n\n');
        }
        if (buffer) parseSSEChunk(buffer);
      } else {
        const raw = await res.text();
        parseSSEChunk(raw);
      }

      setBubble(assistContent ? md(assistContent) : 'No response. Please try again.');
      if (assistContent) {
        history.push({ role: 'assistant', content: assistContent });
        saveState();
        document.getElementById('raiSave').hidden = false;
      }

    } catch {
      setBubble('Connection error. Please try again.');
      history.pop();
      saveState();
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
