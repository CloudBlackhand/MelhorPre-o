import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analytics e Métricas</h1>
          <p className="text-muted-foreground">
            Acompanhe visitantes, origem dos cliques e áreas mais buscadas
          </p>
        </div>

        <AnalyticsDashboard />
      </div>
    </div>
  );
}
