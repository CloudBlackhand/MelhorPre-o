import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { OperadoraForm } from "@/components/admin/OperadoraForm";

export default async function NovaOperadoraPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Nova Operadora</h1>
          <p className="text-muted-foreground">Cadastre uma nova operadora de internet</p>
        </div>

        <OperadoraForm />
      </div>
    </div>
  );
}


