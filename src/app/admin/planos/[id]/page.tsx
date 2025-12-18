import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { PlanoForm } from "@/components/admin/PlanoForm";

export default async function EditarPlanoPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Editar Plano</h1>
          <p className="text-muted-foreground">Edite os dados do plano</p>
        </div>

        <PlanoForm planoId={params.id} />
      </div>
    </div>
  );
}

