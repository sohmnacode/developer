export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, year, age, location, background, description, verified, verifyDetails, name, email, openToContact, submittedAt } = req.body;

  if (!type || !description || description.length < 40) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Log the submission (in production, persist to a database or email service)
  console.log('[Experience Submission]', {
    type,
    year,
    age,
    location,
    background,
    verified,
    openToContact,
    submittedAt,
    descriptionLength: description?.length,
    hasEmail: !!email,
    hasVerifyDetails: !!verifyDetails,
  });

  return res.status(200).json({ success: true, message: 'Submission received.' });
}
