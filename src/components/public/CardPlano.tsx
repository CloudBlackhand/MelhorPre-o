"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  CardPlanoBadge,
  CardPlanoLogo,
  CardPlanoPreco,
  CardPlanoVelocidade,
  CardPlanoBeneficios,
  CardPlanoButton,
  getBadgePorPreco,
} from "./card-plano";

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

/**
 * CardPlano - Componente principal que compõe os sub-componentes modulares.
 * 
 * Estrutura modular:
 * - CardPlanoBadge: Badge de destaque (Mais Popular, etc)
 * - CardPlanoLogo: Logo da operadora
 * - CardPlanoPreco: Exibição do preço formatado
 * - CardPlanoVelocidade: Velocidades download/upload
 * - CardPlanoBeneficios: Lista de benefícios
 * - CardPlanoButton: Botão de ação (WhatsApp)
 * 
 * Para customizar, edite os componentes individuais em ./card-plano/
 */
export function CardPlano({ plano }: CardPlanoProps) {
  const badge = getBadgePorPreco(plano.preco);

  return (
    <Card className="h-full flex flex-col border-2 border-gray-200 hover:border-[#1e3a8a] hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
      <CardPlanoBadge texto={badge.text} cor={badge.color} />

      <CardContent className="flex-1 flex flex-col p-6">
        <CardPlanoLogo operadora={plano.operadora} />

        <h3 className="text-xl font-bold text-gray-900 mb-2">{plano.nome}</h3>

        {plano.descricao && (
          <p className="text-sm text-gray-600 mb-4">{plano.descricao}</p>
        )}

        <CardPlanoPreco preco={plano.preco} />

        <div className="mb-6 flex-1">
          <CardPlanoVelocidade
            velocidadeDownload={plano.velocidadeDownload}
            velocidadeUpload={plano.velocidadeUpload}
          />

          {plano.beneficios && plano.beneficios.length > 0 && (
            <CardPlanoBeneficios beneficios={plano.beneficios} />
          )}
        </div>

        <CardPlanoButton plano={plano} />
      </CardContent>
    </Card>
  );
}
