import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { paymentId, reference, userId } = await req.json();

    if (!paymentId || !reference?.trim()) {
      return NextResponse.json({ error: "Référence manquante" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true },
    });

    if (!payment) return NextResponse.json({ error: "Paiement introuvable" }, { status: 404 });
    if (payment.userId !== userId) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    if (payment.statut !== "pending") return NextResponse.json({ error: "Paiement déjà traité" }, { status: 400 });

    await prisma.payment.update({
      where: { id: paymentId },
      data: { reference: reference.trim() },
    });

    // Email admin avec la référence
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        tls: { rejectUnauthorized: false },
      });

      const PACKS: Record<string, string> = {
        decouverte: "Pack Découverte",
        essentiel: "Pack Essentiel",
        complet: "Pack Complet",
      };

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.SMTP_USER,
        subject: `✅ Numéro Wave reçu — ${payment.user.prenom} ${payment.user.nom} — ${payment.montant} FCFA`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#00E5A0">✅ SetalSaBOP — Référence Wave Reçue</h2>
            <p style="color:#333">L'utilisateur a soumis sa référence de paiement. <strong>Vérifiez sur Wave et validez.</strong></p>
            <table style="width:100%;border-collapse:collapse;margin-top:16px">
              <tr style="background:#f9f9f9"><td style="padding:10px;color:#666">Utilisateur</td><td style="padding:10px;font-weight:bold">${payment.user.prenom} ${payment.user.nom}</td></tr>
              <tr><td style="padding:10px;color:#666">Email</td><td style="padding:10px">${payment.user.email}</td></tr>
              <tr style="background:#f9f9f9"><td style="padding:10px;color:#666">Pack</td><td style="padding:10px">${PACKS[payment.pack] || payment.pack}</td></tr>
              <tr><td style="padding:10px;color:#666">Montant attendu</td><td style="padding:10px;font-weight:bold;color:#F4C842">${payment.montant} FCFA</td></tr>
              <tr style="background:#fffbe6"><td style="padding:10px;color:#666">📱 Numéro Wave</td><td style="padding:10px;font-weight:bold;font-size:20px;color:#E8A020">${reference.trim()}</td></tr>
              <tr><td style="padding:10px;color:#666">ID Paiement</td><td style="padding:10px;font-size:11px;color:#999">${payment.id}</td></tr>
            </table>
            <div style="margin-top:24px;padding:16px;background:#f0fff4;border-radius:8px;border-left:4px solid #00E5A0">
              <p style="margin:0;color:#333">👉 Connectez-vous à l'espace admin pour valider ou rejeter ce paiement.</p>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Email admin failed:", emailErr);
    }

    return NextResponse.json({ success: true, message: "Référence soumise. En attente de validation." });

  } catch (e) {
    console.error("Erreur submit payment:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
