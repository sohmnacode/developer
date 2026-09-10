import { allowRequest, readBody, stringField, RequestError, createLimiter } from '../lib/request.js';
const limit = createLimiter({ limit: 4, total: 80 });
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONSENT_VERSION = '2026-09-10';

export function contactPayload(body) {
  const kind = body.kind ?? 'contact';
  if (!['contact', 'experience', 'digest'].includes(kind)) throw new RequestError('Unknown form.');
  const name = stringField(body.name, 'Name', { min: kind === 'contact' ? 1 : 0, max: 100 });
  const email = stringField(body.email, 'Email', { min: kind === 'experience' ? 0 : 1, max: 254 });
  if (email && !emailPattern.test(email)) throw new RequestError('Enter a valid email address.');
  let subject, message;
  if (kind === 'experience') {
    if (body.consent !== true || body.consentVersion !== CONSENT_VERSION) throw new RequestError('Please agree to the experience submission consent.');
    if (!['NDE', 'Past-Life', 'OBE', 'Other'].includes(body.type)) throw new RequestError('Choose an experience type.');
    if (typeof body.openToContact !== 'boolean') throw new RequestError('Invalid contact preference.');
    const description = stringField(body.description, 'Description', { min: 40, max: 12000 });
    const details = {};
    for (const field of ['year','age','location','background','verified','verifyDetails']) details[field] = stringField(body[field], field, { max: field === 'verifyDetails' ? 2000 : 200 });
    if (details.verified && !['yes','partial','no','unknown'].includes(details.verified)) throw new RequestError('Invalid verification status.');
    if (details.year && (!/^\d{4}$/.test(details.year) || Number(details.year) < 1900 || Number(details.year) > new Date().getFullYear())) throw new RequestError('Enter a valid experience year.');
    if (details.age && (!/^\d{1,3}$/.test(details.age) || Number(details.age) > 120)) throw new RequestError('Enter a valid age.');
    subject = `New Experience Submission — ${body.type} — ReincarnatedAI`;
    message = [`Experience type: ${body.type}`, ...Object.entries(details).filter(([,v])=>v).map(([k,v])=>`${k}: ${v}`), '', description, '', `Submitted by: ${name || 'Anonymous'}`, `Open to contact: ${body.openToContact ? 'Yes' : 'No'}`, `Consent: email processing through Web3Forms and private review; anonymized research reference; no public identifying details. Version ${CONSENT_VERSION}.`, `Received: ${new Date().toISOString()}`].join('\n');
  } else if (kind === 'digest') {
    if (body.consent !== true) throw new RequestError('Please request updates using the signup form.');
    subject = 'Research updates request — ReincarnatedAI';
    message = `Research updates requested by ${email}. This is an interest request, not confirmed mailing-list enrollment. Received: ${new Date().toISOString()}`;
  } else {
    subject = 'New contact message — ReincarnatedAI';
    message = stringField(body.message, 'Message', { min: 1, max: 6000 });
  }
  return { subject, from_name: 'ReincarnatedAI', name: name || 'Anonymous', email: email || 'noreply@reincarnatedai.com', ...(email ? { replyto: email } : {}), message };
}

export default async function handler(req, res) {
  if (!allowRequest(req, res)) return;
  try {
    const body = readBody(req, 60000);
    if (body.website) throw new RequestError('Unable to send this request.');
    const payload = contactPayload(body);
    if (!limit(req, res)) return;
    // Existing public form access key; this is not an account credential.
    const key = process.env.WEB3FORMS_KEY || 'bee91e89-fdb3-4ee9-aaaa-ce280162ddb8';
    const upstream = await fetch('https://api.web3forms.com/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ access_key: key, ...payload }), signal: AbortSignal.timeout(15000),
    });
    const data = await upstream.json();
    if (!upstream.ok || data.success !== true) return res.status(502).json({ error: 'The email service could not accept this request. Please try again later.' });
    return res.status(200).json({ success: true });
  } catch (error) {
    const expected = error instanceof RequestError;
    return res.status(expected ? error.status : 502).json({ error: expected ? error.message : 'Unable to reach the email service. Please try again later.' });
  }
}
