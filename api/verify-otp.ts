import admin from "firebase-admin";

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

  if (!admin.apps.length) {
    try {
      const firebaseConfig = require("../firebase-applet-config.json");
      admin.initializeApp({
        projectId: firebaseConfig.projectId,
      });
    } catch (e) {
      console.error("Failed to init Firebase Admin:", e);
    }
  }

  const db = admin.firestore();
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  try {
    const otpDoc = await db.collection("otps").doc(email).get();
    if (!otpDoc.exists) {
      return res.status(400).json({ error: "No OTP found for this email." });
    }

    const data = otpDoc.data();
    if (data?.otp !== String(otp).trim()) {
      return res.status(400).json({ error: "Invalid OTP code." });
    }

    if (Date.now() > data?.expiresAt) {
      return res.status(400).json({ error: "OTP has expired." });
    }

    // Clear OTP after successful verification
    await db.collection("otps").doc(email).delete();

    res.json({ success: true });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
