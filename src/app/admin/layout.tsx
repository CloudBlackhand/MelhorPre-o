import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Allow access to login page without authentication
  if (!session) {
    // This will be handled by individual pages that need auth
    return <>{children}</>;
  }

  return <>{children}</>;
}


