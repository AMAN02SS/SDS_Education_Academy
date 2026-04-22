import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import admin from "firebase-admin";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const db = admin.firestore();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Blocked email domains (Temporary/Fake Emails)
  const BLOCKED_DOMAINS = [
    "tempmail.com", "throwawaymail.com", "mailinator.com", "10minutemail.com",
    "guerrillamail.com", "sharklasers.com", "dispostable.com", "yopmail.com"
  ];

  // API Route: Send OTP
  app.post("/api/send-otp", async (req, res) => {
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

    try {
      // Store OTP in Firestore
      await db.collection("otps").doc(email).set({
        otp,
        expiresAt,
      });

      // Send Email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "s.d.s.educationacademy@gmail.com",
          pass: process.env.GMAIL_APP_PASSWORD, // Must be set in Secrets
        },
      });

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

      res.json({ success: true, message: "OTP sent successfully" });
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ error: "Failed to send OTP. Please ensure GMAIL_APP_PASSWORD is set correctly." });
    }
  });

  // API Route: Verify OTP
  app.post("/api/verify-otp", async (req, res) => {
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
      if (data?.otp !== otp) {
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
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
