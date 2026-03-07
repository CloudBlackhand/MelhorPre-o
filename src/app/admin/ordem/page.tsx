import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OrdemOperadoras } from "@/components/admin/OrdemOperadoras";

export default async function OrdemPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Ordem das operadoras</h1>
            <p className="text-muted-foreground">
              Defina qual operadora deve aparecer primeiro quando várias cobrirem o mesmo CEP
            </p>
          </div>
          <Link href="/admin">
            <Button variant="outline">Voltar ao painel</Button>
          </Link>
        </div>

        <OrdemOperadoras />
      </div>
    </div>
  );
}
