import { PlanosDestaque } from "@/components/public/PlanosDestaque";
import { RocketBanner } from "@/components/public/RocketBanner";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-white" style={{ margin: 0, padding: 0 }}>
      {/* Banner com foguete e efeito zipper (spacer 100vh + overlay fixo); uma única barra de rolagem */}
      <RocketBanner />

      {/* Conteúdo no fluxo do documento - revelado pelo zipper ao rolar */}
      {/* pt grande evita que os cards (badges "Mais Popular" etc.) apareçam no recorte do banner */}
      <div className="flex-1 pt-[70vh] pb-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <PlanosDestaque />
        </div>
      </div>

      {/* Seção de Informações */}
      <div className="bg-white py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-[#1e3a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Compare Preços</h3>
                <p className="text-gray-600">
                  Compare planos de diferentes operadoras e encontre o melhor preço para você
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Verifique Cobertura</h3>
                <p className="text-gray-600">
                  Veja quais operadoras têm cobertura na sua região antes de contratar
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Alta Velocidade</h3>
                <p className="text-gray-600">
                  Encontre planos de fibra óptica com velocidades de até 1 Gbps
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Estatísticas */}
        <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">100+</div>
                <div className="text-blue-200 font-medium">Planos Disponíveis</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">50+</div>
                <div className="text-blue-200 font-medium">Cidades Cobertas</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">10+</div>
                <div className="text-blue-200 font-medium">Operadoras</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">24/7</div>
                <div className="text-blue-200 font-medium">Suporte</div>
              </div>
            </div>
          </div>
        </div>
    </main>
  );
}
