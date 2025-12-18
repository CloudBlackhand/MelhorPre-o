import { getServerSession } from "next-auth";
import { authOptions } from "./config";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function isAuthenticated() {
  const session = await getServerSession(authOptions);
  return !!session;
}

export async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return false;
  const role = (session.user as any)?.role;
  return role === "admin" || role === "super_admin";
}

