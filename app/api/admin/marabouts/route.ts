import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import { isAdminAuthed } from "@/lib/adminAuth";

const prisma = new PrismaClient();

// GET — liste des candidatures marabout
export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const statut = searchParams.get("statut") || "pending";

  const marabouts = await prisma.marabout.findMany({
    where: { statut },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ marabouts });
}

// POST — valider ou rejeter
export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { maraboutId, action, motif } = await req.json();
  if (!maraboutId || !["validate", "reject"].includes(action)) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const marabout = await prisma.marabout.findUnique({ where: { id: maraboutId } });
  if (!marabout) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  if (action === "validate") {
    await prisma.marabout.update({
      where: { id: maraboutId },
      data: { statut: "verified", paymentStatut: "paid", motifRejet: null },
    });

    // Email confirmation au marabout
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        tls: { rejectUnauthorized: false },
      });

      const specs = (() => { try { return JSON.parse(marabout.specialites).join(", "); } catch { return marabout.specialites; } })();
      const BASE = process.env.NEXT_PUBLIC_URL || "https://setalsabop.com";

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: marabout.email,
        subject: `🎉 Félicitations ${marabout.prenom} — Votre profil SetalSaBOP est activé !`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0D0B2B;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#0D0B2B;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1A0533,#0D1B4B);padding:40px 32px;text-align:center;border-bottom:1px solid rgba(244,200,66,0.2);">
      <div style="font-size:40px;margin-bottom:12px;">🌙</div>
      <h1 style="margin:0;color:#F4C842;font-size:26px;letter-spacing:1px;">SetalSaBOP</h1>
      <p style="margin:8px 0 0;color:#9B8FC2;font-size:13px;">Plateforme spirituelle de confiance</p>
    </div>

    <!-- Succès -->
    <div style="padding:40px 32px;text-align:center;">
      <div style="width:80px;height:80px;background:linear-gradient(135deg,rgba(0,229,160,0.2),rgba(244,200,66,0.2));border:2px solid #00E5A0;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:36px;">✅</div>
      <h2 style="color:#00E5A0;font-size:24px;margin:0 0 8px;">Félicitations, ${marabout.prenom} !</h2>
      <p style="color:#9B8FC2;font-size:15px;margin:0;">Votre profil est maintenant <strong style="color:#F0EDF8;">actif et visible</strong> sur SetalSaBOP.</p>
    </div>

    <!-- Profil résumé -->
    <div style="margin:0 32px 24px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
      <div style="padding:16px 20px;background:rgba(244,200,66,0.06);border-bottom:1px solid rgba(255,255,255,0.06);">
        <p style="margin:0;color:#F4C842;font-weight:bold;font-size:14px;">🧿 Votre profil public</p>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
          <td style="padding:12px 20px;color:#6B5F8A;font-size:13px;width:40%;">Nom</td>
          <td style="padding:12px 20px;color:#F0EDF8;font-weight:bold;font-size:13px;">${marabout.prenom} ${marabout.nom}</td>
        </tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);background:rgba(255,255,255,0.02);">
          <td style="padding:12px 20px;color:#6B5F8A;font-size:13px;">Ville</td>
          <td style="padding:12px 20px;color:#F0EDF8;font-size:13px;">📍 ${marabout.ville}</td>
        </tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
          <td style="padding:12px 20px;color:#6B5F8A;font-size:13px;">Spécialités</td>
          <td style="padding:12px 20px;color:#F0EDF8;font-size:13px;">${specs}</td>
        </tr>
        <tr style="background:rgba(255,255,255,0.02);">
          <td style="padding:12px 20px;color:#6B5F8A;font-size:13px;">Tarif</td>
          <td style="padding:12px 20px;color:#F4C842;font-weight:bold;font-size:13px;">${marabout.tarif.toLocaleString()} FCFA / consultation</td>
        </tr>
      </table>
    </div>

    <!-- Ce qui se passe maintenant -->
    <div style="margin:0 32px 24px;">
      <p style="color:#9B8FC2;font-size:13px;font-weight:bold;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px;">Ce qui se passe maintenant</p>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:rgba(0,229,160,0.06);border:1px solid rgba(0,229,160,0.15);border-radius:12px;">
          <span style="font-size:18px;">👥</span>
          <p style="margin:0;color:#9B8FC2;font-size:13px;">Les utilisateurs de SetalSaBOP peuvent <strong style="color:#F0EDF8;">voir votre profil</strong> dans l'annuaire des marabouts</p>
        </div>
        <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:rgba(37,211,102,0.06);border:1px solid rgba(37,211,102,0.15);border-radius:12px;">
          <span style="font-size:18px;">📱</span>
          <p style="margin:0;color:#9B8FC2;font-size:13px;">Ils vous contacteront directement sur <strong style="color:#25D366;">WhatsApp</strong> au <strong style="color:#F0EDF8;">${marabout.whatsapp}</strong></p>
        </div>
        <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:rgba(244,200,66,0.06);border:1px solid rgba(244,200,66,0.15);border-radius:12px;">
          <span style="font-size:18px;">🛡️</span>
          <p style="margin:0;color:#9B8FC2;font-size:13px;">Votre badge <strong style="color:#F4C842;">✅ Identité Vérifiée</strong> rassure les utilisateurs et vous distingue des non-vérifiés</p>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div style="margin:0 32px 32px;text-align:center;">
      <a href="${BASE}" style="display:inline-block;background:linear-gradient(135deg,#F4C842,#E8A020);color:#0D0B2B;font-weight:bold;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;">
        Voir mon profil sur SetalSaBOP →
      </a>
    </div>

    <!-- Footer -->
    <div style="padding:24px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
      <p style="margin:0;color:#6B5F8A;font-size:12px;">
        Merci de faire confiance à SetalSaBOP 🙏<br/>
        Pour toute question, répondez à cet email.
      </p>
    </div>

  </div>
</body>
</html>
        `,
      });
    } catch (e) {
      console.error("Email validate marabout failed:", e);
    }

    return NextResponse.json({ success: true, message: "Marabout validé et notifié." });

  } else {
    await prisma.marabout.update({
      where: { id: maraboutId },
      data: { statut: "rejected", motifRejet: motif || "Dossier incomplet ou non conforme." },
    });

    // Email rejet
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        tls: { rejectUnauthorized: false },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: marabout.email,
        subject: `❌ Candidature SetalSaBOP — Dossier non retenu`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#F87171">Candidature non retenue</h2>
            <p>Bonjour ${marabout.prenom},</p>
            <p>Après vérification, votre dossier n'a pas pu être validé.</p>
            <div style="margin:16px 0;padding:12px;background:#fff0f0;border-radius:8px;border-left:4px solid #F87171">
              <p style="margin:0;color:#333"><strong>Motif :</strong> ${motif || "Dossier incomplet ou non conforme."}</p>
            </div>
            <p>Vous pouvez soumettre une nouvelle candidature avec les corrections nécessaires.</p>
            <p style="color:#999;font-size:12px">L'équipe SetalSaBOP</p>
          </div>
        `,
      });
    } catch (e) {
      console.error("Email reject marabout failed:", e);
    }

    return NextResponse.json({ success: true, message: "Marabout rejeté et notifié." });
  }
}
