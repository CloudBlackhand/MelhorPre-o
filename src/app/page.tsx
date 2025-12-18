import { BuscaCobertura } from "@/components/public/BuscaCobertura";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* Banner com cor da logo */}
      <div className="bg-[#1e3a8a] py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Encontre o melhor plano para você!
          </h1>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <BuscaCobertura />
        </div>
      </div>
    </main>
  );
}
