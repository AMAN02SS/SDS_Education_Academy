import nodemailer from "nodemailer";
import crypto from "crypto";

const BLOCKED_DOMAINS = [
  "tempmail.com", "throwawaymail.com", "mailinator.com", "10minutemail.com",
  "guerrillamail.com", "sharklasers.com", "dispostable.com", "yopmail.com"
];

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

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const domain = email.split("@")[1];
  if (BLOCKED_DOMAINS.includes(domain)) {
    return res.status(403).json({ error: "Temporary or fake email addresses are not allowed." });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  // Generate a hash so we can verify statelessly without a database
  const secret = process.env.GMAIL_APP_PASSWORD || 'fallback-secret-if-missing';
  const dataToHash = `${email}.${otp}.${expiresAt}`;
  const hash = crypto.createHmac('sha256', secret).update(dataToHash).digest('hex');

  try {
    // Send Email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "s.d.s.educationacademy@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    try {
      await transporter.verify();
    } catch (verifyError: any) {
      console.error("Transporter Verify Error:", verifyError);
      return res.status(500).json({ 
        error: "SMTP Authentication Failed.", 
        details: verifyError.message 
      });
    }

    await transporter.sendMail({
      from: '"SDS Education Academy" <s.d.s.educationacademy@gmail.com>',
      to: email,
      subject: `Your OTP for SDS Academy: ${otp}`,
      text: `Welcome to SDS Education Academy! Your OTP for signup is: ${otp}. It expires in 5 minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #6366f1;">Welcome to SDS Education Academy!</h2>
          <p>Use the code below to verify your email address:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; margin: 20px 0;">${otp}</div>
          <p style="font-size: 12px; color: #64748b;">This code will expire in 5 minutes. If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    res.json({ success: true, message: "OTP sent successfully", hash, expiresAt });
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ 
      error: "Failed to send OTP.", 
      details: error?.message || "Unknown error occurred" 
    });
  }
}
