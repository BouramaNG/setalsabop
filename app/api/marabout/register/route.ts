import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

const WAVE_LINK = `https://pay.wave.com/m/M_sn_OrBEDgUMGWxY/c/sn/?amount=2500`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prenom, nom, email, telephone, ville, tradition, specialites, tarif, whatsapp, selfie, cin } = body;

    // Validation
    if (!prenom || !nom || !email || !telephone || !ville || !tradition || !specialites?.length || !tarif || !whatsapp) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }
    if (tarif > 3000) {
      return NextResponse.json({ error: "Le tarif ne peut pas dépasser 3 000 FCFA" }, { status: 400 });
    }
    if (!selfie || !cin) {
      return NextResponse.json({ error: "Selfie et carte d'identité obligatoires" }, { status: 400 });
    }

    // Vérifier email unique
    const existing = await prisma.marabout.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Un dossier existe déjà avec cet email" }, { status: 409 });
    }

    // Créer le marabout en statut pending
    const marabout = await prisma.marabout.create({
      data: {
        prenom,
        nom,
        email,
        telephone,
        ville,
        tradition,
        specialites: JSON.stringify(specialites),
        tarif: parseInt(tarif),
        whatsapp,
        selfie,
        cin,
        statut: "pending",
        paymentStatut: "pending",
      },
    });

    // Email admin — nouveau dossier
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        tls: { rejectUnauthorized: false },
      });

      const BASE = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.SMTP_USER,
        subject: `🧿 Nouvelle candidature Marabout — ${prenom} ${nom} (${ville})`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#F4C842">🧿 SetalSaBOP — Nouvelle Candidature Marabout</h2>
            <table style="width:100%;border-collapse:collapse;margin-top:16px">
              <tr style="background:#f9f9f9"><td style="padding:10px;color:#666">Nom</td><td style="padding:10px;font-weight:bold">${prenom} ${nom}</td></tr>
              <tr><td style="padding:10px;color:#666">Email</td><td style="padding:10px">${email}</td></tr>
              <tr style="background:#f9f9f9"><td style="padding:10px;color:#666">Téléphone</td><td style="padding:10px">${telephone}</td></tr>
              <tr><td style="padding:10px;color:#666">WhatsApp</td><td style="padding:10px">${whatsapp}</td></tr>
              <tr style="background:#f9f9f9"><td style="padding:10px;color:#666">Ville</td><td style="padding:10px">${ville}</td></tr>
              <tr><td style="padding:10px;color:#666">Tradition</td><td style="padding:10px">${tradition}</td></tr>
              <tr style="background:#f9f9f9"><td style="padding:10px;color:#666">Spécialités</td><td style="padding:10px">${specialites.join(", ")}</td></tr>
              <tr><td style="padding:10px;color:#666">Tarif</td><td style="padding:10px;font-weight:bold">${tarif} FCFA</td></tr>
            </table>
            <div style="margin-top:16px;padding:12px;background:#fff8e1;border-radius:8px;border-left:4px solid #F4C842">
              <p style="margin:0;color:#333">⚠️ Paiement 2 500 FCFA non encore confirmé. Attendez la référence Wave.</p>
            </div>
            <div style="margin-top:12px;padding:12px;background:#f0f4ff;border-radius:8px">
              <p style="margin:0;color:#333">📎 KYC : <a href="${BASE}${selfie}">Selfie</a> · <a href="${BASE}${cin}">Carte d'identité</a></p>
            </div>
            <p style="margin-top:16px;color:#999;font-size:12px">ID : ${marabout.id}</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Email admin marabout failed:", emailErr);
    }

    return NextResponse.json({
      success: true,
      maraboutId: marabout.id,
      waveLink: WAVE_LINK,
    });
  } catch (e) {
    console.error("Marabout register error:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
