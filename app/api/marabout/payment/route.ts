import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { maraboutId, operateur, premierChiffre, deuxDerniers } = await req.json();

    if (!maraboutId || !operateur || !premierChiffre || !deuxDerniers) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }
    if (!/^\d$/.test(premierChiffre) || !/^\d{2}$/.test(deuxDerniers)) {
      return NextResponse.json({ error: "Format invalide" }, { status: 400 });
    }

    const ref = `${operateur} ${premierChiffre}XX XXX XX ${deuxDerniers}`;

    const marabout = await prisma.marabout.findUnique({ where: { id: maraboutId } });
    if (!marabout) return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
    if (marabout.paymentStatut !== "pending") {
      return NextResponse.json({ error: "Paiement déjà soumis" }, { status: 400 });
    }

    await prisma.marabout.update({
      where: { id: maraboutId },
      data: { paymentRef: ref },
    });

    // Email admin
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
        to: process.env.SMTP_USER,
        subject: `💳 Paiement Marabout reçu — ${marabout.prenom} ${marabout.nom} — 2 500 FCFA`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#F4C842">💳 SetalSaBOP — Paiement Marabout</h2>
            <p>Le marabout a soumis sa référence Wave. <strong>Vérifiez et validez le dossier.</strong></p>
            <table style="width:100%;border-collapse:collapse;margin-top:16px">
              <tr style="background:#f9f9f9"><td style="padding:10px;color:#666">Nom</td><td style="padding:10px;font-weight:bold">${marabout.prenom} ${marabout.nom}</td></tr>
              <tr><td style="padding:10px;color:#666">Email</td><td style="padding:10px">${marabout.email}</td></tr>
              <tr style="background:#fffbe6"><td style="padding:10px;color:#666">📱 Numéro Wave</td><td style="padding:10px;font-weight:bold;font-size:18px;color:#E8A020">${ref}</td></tr>
              <tr><td style="padding:10px;color:#666">Montant</td><td style="padding:10px;font-weight:bold;color:#F4C842">2 500 FCFA</td></tr>
            </table>
            <p style="margin-top:16px;color:#999;font-size:12px">ID : ${marabout.id}</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Email payment marabout failed:", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Marabout payment error:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
