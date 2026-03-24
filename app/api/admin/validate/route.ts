import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import { isAdminAuthed } from "@/lib/adminAuth";

const prisma = new PrismaClient();

const PACKS: Record<string, { label: string; sadaqa: boolean }> = {
  decouverte: { label: "Pack Découverte",  sadaqa: false },
  essentiel:  { label: "Pack Essentiel",   sadaqa: false },
  complet:    { label: "Pack Complet",     sadaqa: true  },
};

export async function POST(req: NextRequest) {
  try {
    if (!isAdminAuthed(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { paymentId, action } = await req.json();
    if (!["validate", "reject"].includes(action)) return NextResponse.json({ error: "Action invalide" }, { status: 400 });

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true },
    });

    if (!payment) return NextResponse.json({ error: "Paiement introuvable" }, { status: 404 });
    if (payment.statut !== "pending") return NextResponse.json({ error: "Déjà traité" }, { status: 400 });

    if (action === "validate") {
      // Mettre à jour le paiement
      await prisma.payment.update({
        where: { id: paymentId },
        data: { statut: "validated", validatedAt: new Date() },
      });

      // Ajouter les crédits à l'utilisateur
      const packInfo = PACKS[payment.pack];
      await prisma.userCredits.upsert({
        where: { userId: payment.userId },
        create: {
          userId: payment.userId,
          credits: payment.credits,
          sadaqa: packInfo?.sadaqa || false,
        },
        update: {
          credits: { increment: payment.credits },
          sadaqa: packInfo?.sadaqa ? true : undefined,
        },
      });

      // Email de confirmation à l'utilisateur
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
          to: payment.user.email,
          subject: "✅ Paiement confirmé — SetalSaBOP",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0D0B2B;color:#F0EDF8;padding:32px;border-radius:16px">
              <h2 style="color:#F4C842;text-align:center">🌙 SetalSaBOP</h2>
              <h3 style="color:#00E5A0;text-align:center">✅ Paiement confirmé !</h3>
              <p>Bonjour <strong>${payment.user.prenom}</strong>,</p>
              <p>Votre paiement de <strong style="color:#F4C842">${payment.montant} FCFA</strong> a été validé.</p>
              <div style="background:rgba(244,200,66,0.1);border:1px solid rgba(244,200,66,0.3);border-radius:12px;padding:16px;margin:20px 0;text-align:center">
                <p style="margin:0;font-size:24px;font-weight:bold;color:#F4C842">+${payment.credits} crédits</p>
                <p style="margin:4px 0 0;color:#9B8FC2">${PACKS[payment.pack]?.label || payment.pack}</p>
              </div>
              ${packInfo?.sadaqa ? `<p style="color:#00E5A0">🎁 Vous avez maintenant accès à la <strong>Sadaqa Guidée</strong> — des recommandations spirituelles personnalisées.</p>` : ""}
              <p>Connectez-vous sur SetalSaBOP pour utiliser vos crédits.</p>
              <p style="color:#6B5F8A;font-size:12px;margin-top:24px">Merci de votre confiance — Équipe SetalSaBOP</p>
            </div>
          `,
        });
      } catch (e) {
        console.error("Email user failed:", e);
      }

      return NextResponse.json({ success: true, message: "Paiement validé, crédits ajoutés" });

    } else {
      // Rejeter
      await prisma.payment.update({
        where: { id: paymentId },
        data: { statut: "rejected" },
      });

      // Email rejet à l'utilisateur
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
          to: payment.user.email,
          subject: "❌ Paiement non confirmé — SetalSaBOP",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
              <h2>SetalSaBOP — Paiement non confirmé</h2>
              <p>Bonjour ${payment.user.prenom},</p>
              <p>Nous n'avons pas pu confirmer votre paiement de ${payment.montant} FCFA.</p>
              <p>Si vous avez bien effectué le paiement, contactez-nous avec votre référence Wave.</p>
              <p style="color:#999">Email : ${process.env.SMTP_USER}</p>
            </div>
          `,
        });
      } catch (e) {
        console.error("Email rejet failed:", e);
      }

      return NextResponse.json({ success: true, message: "Paiement rejeté" });
    }

  } catch (e) {
    console.error("Erreur validate:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
