import { Card, CardContent } from "@/components/ui/card";
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
  const precoNum = typeof plano.preco === 'string' ? parseFloat(plano.preco) : Number(plano.preco);
  const precoInteiro = Math.floor(precoNum);
  const precoDecimal = Math.round((precoNum - precoInteiro) * 100).toString().padStart(2, '0');

  // Determinar badge baseado no preço
  const getBadge = () => {
    if (precoNum < 100) return { text: "Mais Popular", color: "bg-green-500" };
    if (precoNum < 150) return { text: "Melhor Custo-Benefício", color: "bg-blue-500" };
    if (precoNum < 250) return { text: "Alta Performance", color: "bg-purple-500" };
    return { text: "Premium", color: "bg-amber-500" };
  };

  const badge = getBadge();

  return (
    <Card className="h-full flex flex-col border-2 border-gray-200 hover:border-[#1e3a8a] hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
      {/* Badge de destaque */}
      <div className="absolute top-4 right-4 z-10">
        <span className={`${badge.color} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg opacity-90 group-hover:opacity-100 transition-opacity`}>
          {badge.text}
        </span>
      </div>
      
      <CardContent className="flex-1 flex flex-col p-6">
        {/* Logo da Operadora ou Nome */}
        <div className="mb-6 flex items-center justify-center h-16">
          {plano.operadora.logoUrl ? (
            <Image
              src={plano.operadora.logoUrl}
              alt={plano.operadora.nome}
              width={140}
              height={50}
              className="object-contain max-h-12"
            />
          ) : (
            <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] text-white px-6 py-2 rounded-lg font-bold text-lg">
              {plano.operadora.nome}
            </div>
          )}
        </div>
        
        {/* Nome do Plano */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{plano.nome}</h3>
        
        {/* Descrição se disponível */}
        {plano.descricao && (
          <p className="text-sm text-gray-600 mb-4">{plano.descricao}</p>
        )}
        
        {/* Preço em destaque */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-gray-500">R$</span>
            <span className="text-5xl font-extrabold text-[#1e3a8a]">{precoInteiro}</span>
            <span className="text-xl font-semibold text-gray-500">,{precoDecimal}</span>
            <span className="text-sm text-gray-500 ml-2">/mês</span>
          </div>
        </div>
        
        {/* Velocidades */}
        <div className="space-y-4 mb-6 flex-1">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-6 h-6 text-[#1e3a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div className="text-3xl font-extrabold text-[#1e3a8a]">
                  {plano.velocidadeDownload} <span className="text-lg font-semibold text-gray-600">Mbps</span>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-700">Velocidade de Download</div>
            </div>
          </div>
          
          {plano.velocidadeUpload > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg py-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span className="font-semibold">Upload:</span> 
              <span className="font-bold text-[#1e3a8a]">{plano.velocidadeUpload} Mbps</span>
            </div>
          )}
          
          {/* Benefícios */}
          {plano.beneficios && plano.beneficios.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Benefícios Inclusos:</h4>
              <ul className="space-y-2.5">
                {plano.beneficios.slice(0, 4).map((beneficio, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700 group/item">
                    <svg className="w-5 h-5 text-green-500 mr-2.5 flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{beneficio}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Botão de ação */}
        <Button 
          className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] hover:from-[#1e40af] hover:to-[#1e3a8a] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 mt-auto"
        >
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
}


