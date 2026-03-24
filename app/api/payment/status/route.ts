import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get("paymentId");
  if (!paymentId) return NextResponse.json({ error: "paymentId requis" }, { status: 400 });

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: { statut: true, credits: true },
  });

  if (!payment) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  return NextResponse.json({ statut: payment.statut, credits: payment.credits });
}
