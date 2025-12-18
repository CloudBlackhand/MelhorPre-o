import { BuscaCobertura } from "@/components/public/BuscaCobertura";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 px-4 py-12">
      <div className="w-full max-w-6xl space-y-10">
        {/* Logo Melhorada */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            {/* Ícone do Foguete */}
            <div className="relative">
              <svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg"
              >
                {/* Círculo branco em formato C */}
                <path
                  d="M 40 5 A 35 35 0 0 1 75 40 A 35 35 0 0 1 40 75"
                  stroke="white"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Foguete */}
                <g transform="translate(40, 40) rotate(45)">
                  <path
                    d="M-15 -25 L-8 -30 L-8 -35 L8 -35 L8 -30 L15 -25 L8 -20 L8 -15 L-8 -15 L-8 -20 Z"
                    fill="#EF4444"
                    stroke="#DC2626"
                    strokeWidth="1.5"
                  />
                  {/* Janela do foguete */}
                  <circle cx="0" cy="-27" r="4" fill="#1F2937" />
                  {/* Chama do foguete */}
                  <path
                    d="M-8 0 L-5 5 L0 8 L5 5 L8 0 L5 -3 L0 -5 L-5 -3 Z"
                    fill="#F97316"
                    className="animate-pulse"
                  />
                  <path
                    d="M-5 2 L-3 5 L0 6 L3 5 L5 2 L3 0 L0 -1 L-3 0 Z"
                    fill="#FB923C"
                  />
                </g>
              </svg>
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold leading-tight">
            <span className="text-white drop-shadow-lg">Melhor</span>
            <span className="text-red-400 drop-shadow-lg">Preço</span>
            <span className="text-white drop-shadow-lg">.net</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-50 font-medium max-w-2xl mx-auto leading-relaxed">
            Compare e encontre o melhor plano de internet para você
          </p>
        </div>

        <BuscaCobertura />

        {/* Cards de Features Melhorados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center space-y-3 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 shadow-xl">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="font-bold text-lg text-white">Compare Planos</h3>
            <p className="text-sm text-blue-100 leading-relaxed">
              Veja todos os planos disponíveis na sua região
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center space-y-3 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 shadow-xl">
            <div className="text-5xl mb-3">💰</div>
            <h3 className="font-bold text-lg text-white">Melhor Preço</h3>
            <p className="text-sm text-blue-100 leading-relaxed">
              Encontre o melhor custo-benefício para você
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center space-y-3 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 shadow-xl">
            <div className="text-5xl mb-3">📍</div>
            <h3 className="font-bold text-lg text-white">Cobertura Precisa</h3>
            <p className="text-sm text-blue-100 leading-relaxed">
              Verificamos a cobertura exata na sua localização
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
