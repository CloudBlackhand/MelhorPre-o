import { BuscaCobertura } from "@/components/public/BuscaCobertura";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-6xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">
            MelhorPreço.net
          </h1>
          <p className="text-xl text-gray-600">
            Compare e encontre o melhor plano de internet para você
          </p>
        </div>

        <BuscaCobertura />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center space-y-2">
            <div className="text-4xl mb-2">🔍</div>
            <h3 className="font-semibold">Compare Planos</h3>
            <p className="text-sm text-muted-foreground">
              Veja todos os planos disponíveis na sua região
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl mb-2">💰</div>
            <h3 className="font-semibold">Melhor Preço</h3>
            <p className="text-sm text-muted-foreground">
              Encontre o melhor custo-benefício para você
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl mb-2">📍</div>
            <h3 className="font-semibold">Cobertura Precisa</h3>
            <p className="text-sm text-muted-foreground">
              Verificamos a cobertura exata na sua localização
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
