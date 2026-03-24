import { NextRequest, NextResponse } from "next/server";
import { uploadToStorage } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const type = formData.get("type") as string; // "selfie" | "cin"
    const file = formData.get("file") as File;

    if (!file || !type) {
      return NextResponse.json({ error: "Fichier ou type manquant" }, { status: 400 });
    }

    if (!["selfie", "cin"].includes(type)) {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 5MB)" }, { status: 400 });
    }

    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedMimes.includes(file.type)) {
      return NextResponse.json({ error: "Format non accepté (JPG, PNG, WEBP)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${type}_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
    const url = await uploadToStorage(buffer, "kyc", filename);

    return NextResponse.json({ path: url });

  } catch (e) {
    console.error("Upload KYC error:", e);
    return NextResponse.json({ error: "Erreur upload" }, { status: 500 });
  }
}
