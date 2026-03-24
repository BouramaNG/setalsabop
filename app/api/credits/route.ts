import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId manquant" }, { status: 400 });

  const uc = await prisma.userCredits.findUnique({ where: { userId } });
  return NextResponse.json({ credits: uc?.credits ?? 0, sadaqa: uc?.sadaqa ?? false });
}
