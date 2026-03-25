import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

const WAVE_BASE = "https://pay.wave.com/m/M_sn_OrBEDgUMGWxY/c/sn/?amount=";
const ADMIN_EMAIL = process.env.SMTP_USER!;

const PACKS: Record<string, { label: string; montant: number; credits: number; sadaqa: boolean }> = {
  decouverte: { label: "Pack Découverte",  montant: 500,  credits: 1,  sadaqa: false },
  essentiel:  { label: "Pack Essentiel",   montant: 1500, credits: 4,  sadaqa: false },
  complet:    { label: "Pack Complet",     montant: 2500, credits: 10, sadaqa: true  },
};

export async function POST(req: NextRequest) {
  try {
    const { userId, pack } = await req.json();

    if (!userId || !PACKS[pack]) {
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    const p = PACKS[pack];
    const waveLink = `${WAVE_BASE}${p.montant}`;

    const payment = await prisma.payment.create({
      data: {
        userId,
        pack,
        montant: p.montant,
        credits: p.credits,
        waveLink,
        statut: "pending",
      },
    });

    // Email admin — envoi en arrière-plan sans bloquer la réponse
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: parseInt(process.env.SMTP_PORT || "465") === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      tls: { rejectUnauthorized: false },
    });

    transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: ADMIN_EMAIL,
        subject: `💰 Nouveau paiement en attente — ${p.label} (${p.montant} FCFA)`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#F4C842">🌙 SetalSaBOP — Nouveau Paiement</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px;color:#666">Utilisateur</td><td style="padding:8px;font-weight:bold">${user.prenom} ${user.nom}</td></tr>
              <tr><td style="padding:8px;color:#666">Email</td><td style="padding:8px">${user.email}</td></tr>
              <tr><td style="padding:8px;color:#666">Pack</td><td style="padding:8px;font-weight:bold">${p.label}</td></tr>
              <tr><td style="padding:8px;color:#666">Montant</td><td style="padding:8px;color:#F4C842;font-weight:bold">${p.montant} FCFA</td></tr>
              <tr><td style="padding:8px;color:#666">Crédits</td><td style="padding:8px">${p.credits} crédits</td></tr>
              <tr><td style="padding:8px;color:#666">ID Paiement</td><td style="padding:8px;font-size:12px;color:#999">${payment.id}</td></tr>
            </table>
            <p style="color:#666;margin-top:20px">⏳ En attente de la référence Wave de l'utilisateur.</p>
            <p style="color:#999;font-size:12px">Connectez-vous à l'espace admin pour valider.</p>
          </div>
        `,
      });
    }).catch((emailErr) => console.error("Email admin failed:", emailErr));

    return NextResponse.json({ paymentId: payment.id, waveLink, montant: p.montant, pack: p.label });

  } catch (e) {
    console.error("Erreur create payment:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
