import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface CardPlanoProps {
  plano: {
    id: string;
    nome: string;
    velocidadeDownload: number;
    velocidadeUpload: number;
    preco: number;
    descricao?: string | null;
    beneficios?: string[] | null;
    operadora: {
      id: string;
      nome: string;
      slug: string;
      logoUrl?: string | null;
    };
  };
}

export function CardPlano({ plano }: CardPlanoProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        {plano.operadora.logoUrl && (
          <div className="mb-4">
            <Image
              src={plano.operadora.logoUrl}
              alt={plano.operadora.nome}
              width={120}
              height={40}
              className="object-contain"
            />
          </div>
        )}
        <CardTitle>{plano.nome}</CardTitle>
        <p className="text-sm text-muted-foreground">{plano.operadora.nome}</p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-2 mb-4">
          <div>
            <p className="text-2xl font-bold text-primary">
              R$ {plano.preco.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground">/mês</span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm">
              <strong>Download:</strong> {plano.velocidadeDownload} Mbps
            </p>
            <p className="text-sm">
              <strong>Upload:</strong> {plano.velocidadeUpload} Mbps
            </p>
          </div>
          {plano.descricao && (
            <p className="text-sm text-muted-foreground">{plano.descricao}</p>
          )}
          {plano.beneficios && plano.beneficios.length > 0 && (
            <ul className="text-sm space-y-1">
              {plano.beneficios.map((beneficio, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>{beneficio}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button className="w-full mt-auto">Ver Detalhes</Button>
      </CardContent>
    </Card>
  );
}


