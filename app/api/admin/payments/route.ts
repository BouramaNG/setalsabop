import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { isAdminAuthed } from "@/lib/adminAuth";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const statut = req.nextUrl.searchParams.get("statut") || "pending";

  const payments = await prisma.payment.findMany({
    where: statut === "all" ? {} : { statut },
    include: { user: { select: { prenom: true, nom: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ payments });
}
