(function () {
  if (window.RaiChat) return;
  function context(history) {
    // Keep complete recent turns and always include the latest user message.
    let selected = [], chars = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      const message = history[i];
      if (!message || typeof message.content !== 'string' || !['user','assistant'].includes(message.role)) throw new Error('Please start a new conversation.');
      if (i === history.length - 1 && message.content.length > 6000) throw new Error('Please keep your question under 6,000 characters.');
      // Older long model responses are truncated only in the context sent upstream.
      const content = message.content.slice(0, 6000);
      if (selected.length >= 23 || chars + content.length > 24000) break;
      selected.unshift({role:message.role, content}); chars += content.length;
    }
    if (selected[0]?.role === 'assistant') selected.shift();
    return selected;
  }
  async function consume(response, onText) {
    if (!response.ok) {
      let error = 'Research chat is temporarily unavailable.';
      try { const body = await response.json(); if (typeof body.error === 'string') error = body.error; } catch {}
      throw new Error(error);
    }
    if (!response.body || !response.headers.get('content-type')?.includes('text/event-stream')) throw new Error('The server returned an unexpected response. Please try again.');
    const reader = response.body.getReader(), decoder = new TextDecoder();
    let buffer = '', text = '', complete = false;
    const parse = frame => {
      const raw = frame.split('\n').filter(l=>l.startsWith('data:')).map(l=>l.slice(5).trimStart()).join('\n').trim();
      if (!raw) return;
      if (raw === '[DONE]') { complete = true; return; }
      let event;
      try { event = JSON.parse(raw); } catch { throw new Error('The response was interrupted. Please try again.'); }
      if (event.error) throw new Error(String(event.error));
      if (typeof event.text === 'string') { text += event.text; onText(text); }
    };
    try {
      while (!complete) {
        const { done, value } = await reader.read();
        buffer += done ? decoder.decode() : decoder.decode(value, { stream:true });
        buffer = buffer.replace(/\r\n/g, '\n');
        let boundary;
        while ((boundary = buffer.indexOf('\n\n')) >= 0) { parse(buffer.slice(0,boundary)); buffer = buffer.slice(boundary+2); }
        if (done) { if (buffer.trim()) parse(buffer); break; }
      }
      if (!complete || !text.trim()) throw new Error('The response was interrupted. Please try again.');
      return text;
    } finally { try { await reader.cancel(); } catch {} }
  }
  async function request(payload, onText, controller = new AbortController()) {
    const timeout = setTimeout(()=>controller.abort(), 65000);
    try {
      const response = await fetch('/api/research', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...payload,messages:context(payload.messages)}), signal:controller.signal });
      return await consume(response,onText);
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('The request timed out or was cancelled. Please try again.');
      throw error;
    } finally { clearTimeout(timeout); }
  }
  window.RaiChat = { context, consume, request };
})();
