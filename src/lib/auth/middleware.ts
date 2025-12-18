import { getServerSession } from "next-auth";
import { authOptions } from "./config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  return null; // No error, user is authenticated
}

export async function requireAdmin(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const role = (session.user as any)?.role;
  if (role !== "admin" && role !== "super_admin") {
    return NextResponse.json({ error: "Acesso negado. Apenas administradores." }, { status: 403 });
  }

  return null; // No error, user is admin
}

