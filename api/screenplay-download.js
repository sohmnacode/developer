const DOWNLOAD_URL = '/assets/9998/9998-screenplay-READER-COPY.pdf';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid request body.' });
    }
  }

  const name = (body?.name || '').trim();
  const email = (body?.email || '').trim();
  const website = (body?.website || '').trim();
  const consent = body?.consent === true;
  const source = (body?.source || '/9998').trim().slice(0, 200);

  if (website) {
    return res.status(200).json({ ok: true, downloadUrl: DOWNLOAD_URL });
  }
  if (!name || name.length > 100 || !email || email.length > 200 || !consent) {
    return res.status(400).json({ error: 'Name, email, and consent are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }

  const downloadedAt = new Date().toISOString();
  const key = process.env.WEB3FORMS_KEY || 'bee91e89-fdb3-4ee9-aaaa-ce280162ddb8';

  try {
    const notification = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: key,
        subject: `9998 screenplay downloaded by ${name}`,
        from_name: 'ReincarnatedAI Download Access',
        name,
        email,
        replyto: email,
        message: [
          'A visitor requested the 9998 screenplay PDF.',
          `Name: ${name}`,
          `Email: ${email}`,
          `Downloaded at: ${downloadedAt}`,
          `Source page: ${source}`,
          'Consent to access-record storage: Yes',
        ].join('\n'),
      }),
    });

    const raw = await notification.text();
    let data = {};
    try { data = JSON.parse(raw); } catch { /* response was not JSON */ }
    if (!notification.ok || !data.success) {
      console.error('Download notification failed:', notification.status, raw);
      return res.status(502).json({ error: 'We could not record access. Please try again.' });
    }

    return res.status(200).json({ ok: true, downloadUrl: DOWNLOAD_URL });
  } catch (error) {
    console.error('Download access error:', error.message);
    return res.status(500).json({ error: 'We could not record access. Please try again.' });
  }
}
