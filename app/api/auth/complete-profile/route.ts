import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, prenom, nom, prenomMere, nomMere, tradition, genre, age } = await req.json();

    if (!email || !prenom || !nom || !tradition || !genre || !age) {
      return NextResponse.json({ error: "Tous les champs obligatoires sont requis" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    if (!user.emailVerified) {
      return NextResponse.json({ error: "Email non vérifié" }, { status: 403 });
    }

    const updated = await prisma.user.update({
      where: { email },
      data: { prenom, nom, prenomMere: prenomMere ?? "", nomMere: nomMere ?? "", tradition, genre, age },
      select: {
        id: true, email: true, prenom: true, nom: true,
        prenomMere: true, nomMere: true, tradition: true, genre: true, age: true, role: true,
      },
    });

    // Crédits gratuits à la création du profil (une seule fois)
    await prisma.userCredits.upsert({
      where: { userId: updated.id },
      update: {},
      create: { userId: updated.id, credits: 3, sadaqa: false },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("[COMPLETE_PROFILE]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
