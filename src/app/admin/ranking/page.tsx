import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { RankingManager } from "@/components/admin/RankingManager";

export default async function RankingPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Ranqueamento de Cobertura</h1>
          <p className="text-muted-foreground">
            Defina a ordem de prioridade e notas das áreas de cobertura
          </p>
        </div>

        <RankingManager />
      </div>
    </div>
  );
}
