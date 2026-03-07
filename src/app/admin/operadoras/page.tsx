import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { OperadorasList } from "@/components/admin/OperadorasList";

export default async function OperadorasPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Operadoras</h1>
          <p className="text-muted-foreground">Operadoras definidas no código. Ajuste a ordem em &quot;Ordem das operadoras&quot;.</p>
        </div>

        <OperadorasList />
      </div>
    </div>
  );
}


