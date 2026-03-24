import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email et code requis" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ success: true, message: "Email déjà vérifié" });
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      return NextResponse.json({ error: "Aucun code en attente" }, { status: 400 });
    }

    if (new Date() > user.otpExpiresAt) {
      return NextResponse.json({ error: "Code expiré, demandez-en un nouveau" }, { status: 400 });
    }

    if (user.otpCode !== otp) {
      return NextResponse.json({ error: "Code incorrect" }, { status: 400 });
    }

    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    return NextResponse.json({ success: true, message: "Email vérifié avec succès" });
  } catch (error) {
    console.error("[VERIFY_OTP]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
