import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId manquant" }, { status: 400 });

  const [dreams, numerologies, compatibilites] = await Promise.all([
    prisma.dream.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { interpretation: true },
    }),
    prisma.numerologie.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, nomComplet: true, dateNaissance: true,
        cheminDeVie: true, nombreExpression: true, nombreAme: true,
        anneePersonnelle: true, rapport: true, createdAt: true,
      },
    }),
    prisma.compatibilite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, nomPersonne1: true, nomPersonne2: true,
        scoreTotal: true, rapport: true, createdAt: true,
      },
    }),
  ]);

  return NextResponse.json({ dreams, numerologies, compatibilites });
}
