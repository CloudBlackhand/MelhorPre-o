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
          <p className="text-muted-foreground">Gerencie operadoras, planos e cobertura</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Operadoras</CardTitle>
              <CardDescription>Gerencie operadoras de internet</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/operadoras">
                <Button className="w-full">Gerenciar Operadoras</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Planos</CardTitle>
              <CardDescription>Gerencie planos de internet</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/planos">
                <Button className="w-full">Gerenciar Planos</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cobertura (KMLs)</CardTitle>
              <CardDescription>Upload e gerenciamento de áreas de cobertura</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/kmls">
                <Button className="w-full">Gerenciar KMLs</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recomendações</CardTitle>
              <CardDescription>Configure recomendações e destaques</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/recomendacoes">
                <Button className="w-full">Gerenciar Recomendações</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ranqueamento</CardTitle>
              <CardDescription>Defina prioridade e notas das áreas de cobertura</CardDescription>
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
              <CardDescription>Visite visitantes, origem dos cliques e áreas mais buscadas</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/analytics">
                <Button className="w-full">Ver Analytics</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>Configure WhatsApp e outras opções do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/configuracoes">
                <Button className="w-full">Gerenciar Configurações</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


