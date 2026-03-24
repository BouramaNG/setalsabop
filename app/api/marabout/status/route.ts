import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const marabout = await prisma.marabout.findUnique({
    where: { id },
    select: { statut: true },
  });

  if (!marabout) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  return NextResponse.json({ statut: marabout.statut });
}
