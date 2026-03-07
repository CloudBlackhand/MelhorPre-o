import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground">Ordem das operadoras e analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ordem das operadoras</CardTitle>
              <CardDescription>Defina qual operadora aparece primeiro na busca por CEP</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/ordem">
                <Button className="w-full">Definir ordem</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operadoras</CardTitle>
              <CardDescription>Lista de operadoras (definidas no código)</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/operadoras">
                <Button className="w-full" variant="outline">Ver operadoras</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cobertura</CardTitle>
              <CardDescription>Áreas de cobertura (carregadas pelo seed)</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/kmls">
                <Button className="w-full" variant="outline">Ver áreas</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ranqueamento</CardTitle>
              <CardDescription>Prioridade e notas das áreas de cobertura por região</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/ranking">
                <Button className="w-full">Gerenciar Ranqueamento</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Visitantes, buscas e áreas mais buscadas</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/analytics">
                <Button className="w-full">Ver Analytics</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


