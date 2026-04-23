import crypto from "crypto";

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, otp, hash, expiresAt } = req.body;

  if (!email || !otp || !hash || !expiresAt) {
    return res.status(400).json({ error: "Missing required verification data." });
  }

  try {
    if (Date.now() > Number(expiresAt)) {
      return res.status(400).json({ error: "OTP has expired." });
    }

    const secret = process.env.GMAIL_APP_PASSWORD || 'fallback-secret-if-missing';
    const dataToHash = `${email}.${String(otp).trim()}.${expiresAt}`;
    const expectedHash = crypto.createHmac('sha256', secret).update(dataToHash).digest('hex');

    if (hash !== expectedHash) {
      return res.status(400).json({ error: "Invalid OTP code." });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
