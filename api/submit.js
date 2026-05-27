import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, year, age, location, background, description, verified, verifyDetails, name, email, openToContact, submittedAt } = req.body;

  if (!type || !description || description.length < 40) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const timestamp = Date.now();
  const id = `${timestamp}-${Math.random().toString(36).slice(2, 8)}`;

  const submission = {
    id,
    submittedAt: submittedAt || new Date().toISOString(),
    type,
    year,
    age,
    location,
    background,
    description,
    verified,
    verifyDetails: verifyDetails || null,
    name: name || null,
    email: email || null,
    openToContact: openToContact || false,
  };

  await put(`submissions/${id}.json`, JSON.stringify(submission, null, 2), {
    access: 'public',
    contentType: 'application/json',
  });

  return res.status(200).json({ success: true, message: 'Submission received.', id });
}
