import { NextRequest } from "next/server";

export function isAdminAuthed(req: NextRequest): boolean {
  const session = req.cookies.get("admin_session")?.value;
  return session === process.env.ADMIN_PASSWORD;
}
