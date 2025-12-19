import { BuscaCobertura } from "@/components/public/BuscaCobertura";
import { PlanosDestaque } from "@/components/public/PlanosDestaque";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Banner com cor da logo e gradiente sutil */}
      <div className="relative bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#1e3a8a] py-20 md:py-32 px-4 overflow-hidden">
        {/* Elementos decorativos sutis */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-red-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto space-y-8">
          {/* Título principal com destaque */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight">
              Encontre o melhor plano{" "}
              <span className="text-red-400 drop-shadow-lg">para você!</span>
            </h1>
          </div>
          
          {/* Subtítulo estilizado */}
          <div className="text-center">
            <p className="text-xl md:text-2xl lg:text-3xl text-blue-100 font-medium">
              Encontre os melhores planos de internet na sua região
            </p>
          </div>
          
          {/* Componente de busca */}
          <div className="pt-4">
            <BuscaCobertura hideTitle={true} />
          </div>
        </div>
      </div>

      {/* Conteúdo - Planos em Destaque */}
      <div className="flex-1 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <PlanosDestaque />
        </div>
      </div>
    </main>
  );
}
