export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Safely parse body — Vercel may pass string or object
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid request body.' }); }
  }

  const name    = (body?.name    || '').trim();
  const email   = (body?.email   || '').trim();
  const message = (body?.message || '').trim();

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  const key = process.env.WEB3FORMS_KEY;
  if (!key) {
    return res.status(500).json({ error: 'WEB3FORMS_KEY is not configured in environment variables.' });
  }

  try {
    const r = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: key,
        subject:    `New message from ${name} — ReincarnatedAI`,
        from_name:  'ReincarnatedAI Contact Form',
        name,
        email,
        message,
        replyto:    email,
      }),
    });

    let data = {};
    try { data = await r.json(); } catch { /* ignore parse error */ }

    if (!r.ok || !data.success) {
      console.error('Web3Forms error:', r.status, JSON.stringify(data));
      // Surface the exact error so we can debug
      return res.status(500).json({ error: data.message || `Web3Forms status ${r.status}` });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact handler error:', err.message);
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
}
