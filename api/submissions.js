// Retired public archive endpoint. Existing stored records are untouched.
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(410).json({ error: 'This archive endpoint has been retired. Please use /submit.' });
}
