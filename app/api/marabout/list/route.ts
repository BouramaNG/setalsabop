import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const marabouts = await prisma.marabout.findMany({
      where: { statut: "verified" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        prenom: true,
        nom: true,
        ville: true,
        tradition: true,
        specialites: true,
        tarif: true,
        whatsapp: true,
        selfie: true,
        rating: true,
        totalAvis: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ marabouts });
  } catch (e) {
    console.error("Marabout list error:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
