import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { KMLManager } from "@/components/admin/KMLManager";

export default async function KMLsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Gerenciar Cobertura (KMLs)</h1>
          <p className="text-muted-foreground">Upload e gerenciamento de arquivos KML de cobertura</p>
        </div>

        <KMLManager />
      </div>
    </div>
  );
}

