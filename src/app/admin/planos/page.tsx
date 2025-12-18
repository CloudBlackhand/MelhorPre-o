import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlanosList } from "@/components/admin/PlanosList";

export default async function PlanosPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Planos</h1>
            <p className="text-muted-foreground">Gerencie os planos de internet</p>
          </div>
          <Link href="/admin/planos/novo">
            <Button>Novo Plano</Button>
          </Link>
        </div>

        <PlanosList />
      </div>
    </div>
  );
}

