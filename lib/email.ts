import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // STARTTLS sur 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: false,
  },
});

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTPEmail(email: string, otp: string, name?: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Votre code de vérification DreamInsight",
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; background: #06041A; color: #F0EDF8; padding: 40px; border-radius: 16px; max-width: 480px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 28px; color: #F4C842; margin: 0;">✨ SamaDream</h1>
          <p style="color: #9B8FC2; margin-top: 8px;">Plateforme d'interprétation de rêves</p>
        </div>

        <p style="font-size: 16px; margin-bottom: 8px;">
          Bonjour ${name ?? ""}
        </p>
        <p style="color: #9B8FC2; font-size: 15px; margin-bottom: 32px;">
          Voici votre code de vérification pour confirmer votre adresse email :
        </p>

        <div style="background: rgba(244,200,66,0.1); border: 2px solid rgba(244,200,66,0.4); border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 32px;">
          <span style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #F4C842;">
            ${otp}
          </span>
        </div>

        <p style="color: #6B5F8A; font-size: 13px; text-align: center;">
          Ce code expire dans <strong style="color: #9B8FC2;">10 minutes</strong>.<br/>
          Si vous n'avez pas demandé ce code, ignorez cet email.
        </p>
      </div>
    `,
  });
}
