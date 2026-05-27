export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Safely parse body — Vercel may pass string or object depending on runtime
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid request.' }); }
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
    return res.status(500).json({ error: 'Email service not configured.' });
  }

  try {
    const r = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key:  key,
        subject:     `New message from ${name} — ReincarnatedAI`,
        from_name:   'ReincarnatedAI Contact Form',
        name,
        email,
        message,
        // Tells Web3Forms to send the reply-to as the visitor's email
        replyto:     email,
      }),
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok || !data.success) {
      console.error('Web3Forms error:', r.status, data);
      return res.status(500).json({ error: data.message || 'Failed to send. Please try again.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact handler error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
