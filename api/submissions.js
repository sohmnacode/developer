import { list, head } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { secret } = req.query;
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { blobs } = await list({ prefix: 'submissions/', limit: 500 });

  const submissions = await Promise.all(
    blobs.map(async (blob) => {
      const resp = await fetch(blob.url);
      return resp.json();
    })
  );

  submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  return res.status(200).json({ count: submissions.length, submissions });
}
