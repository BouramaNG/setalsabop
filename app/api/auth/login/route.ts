import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
    }

    if (!user.emailVerified) {
      return NextResponse.json({ error: "Email non vérifié. Vérifie ta boîte mail." }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        prenom: user.prenom,
        nom: user.nom,
        prenomMere: user.prenomMere,
        nomMere: user.nomMere,
        tradition: user.tradition,
        genre: user.genre,
        age: user.age,
      },
    });
  } catch (error) {
    console.error("[LOGIN]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
