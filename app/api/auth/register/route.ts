import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateOTP, sendOTPEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Mot de passe trop court (6 caractères minimum)" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        prenom: "",
        nom: "",
        prenomMere: "",
        nomMere: "",
        tradition: "",
        genre: "",
        age: "",
        emailVerified: false,
        otpCode: otp,
        otpExpiresAt,
      },
    });

    await sendOTPEmail(email, otp);

    return NextResponse.json({ success: true, message: "Code envoyé sur votre email" });
  } catch (error) {
    console.error("[REGISTER]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
