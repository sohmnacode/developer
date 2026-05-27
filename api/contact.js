export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Email service not configured.' });
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'ReincarnatedAI Contact <onboarding@resend.dev>',
        to: 'lawrence@sohmna.com',
        reply_to: email,
        subject: `New message from ${name}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#f9f7ff;border-radius:12px;">
            <h2 style="margin:0 0 24px;font-size:22px;color:#1A1535;">New Contact Form Submission</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:10px 0;font-size:13px;color:#666;width:80px;vertical-align:top;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">Name</td>
                <td style="padding:10px 0;font-size:15px;color:#1A1535;">${escapeHtml(name)}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;font-size:13px;color:#666;vertical-align:top;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">Email</td>
                <td style="padding:10px 0;font-size:15px;color:#1A1535;"><a href="mailto:${escapeHtml(email)}" style="color:#7B4FC9;">${escapeHtml(email)}</a></td>
              </tr>
              <tr>
                <td style="padding:10px 0;font-size:13px;color:#666;vertical-align:top;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">Message</td>
                <td style="padding:10px 0;font-size:15px;color:#1A1535;line-height:1.65;white-space:pre-wrap;">${escapeHtml(message)}</td>
              </tr>
            </table>
            <hr style="border:none;border-top:1px solid rgba(100,75,180,.15);margin:28px 0 20px;">
            <p style="margin:0;font-size:12px;color:#aaa;">Sent from the ReincarnatedAI contact form · <a href="https://reincarnatedai.com" style="color:#9B79E9;text-decoration:none;">reincarnatedai.com</a></p>
          </div>`,
      }),
    });

    if (!r.ok) {
      const errBody = await r.text();
      console.error('Resend error:', r.status, errBody);
      return res.status(500).json({ error: 'Failed to send message. Please try again.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact handler error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
