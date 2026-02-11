/**
 * Componente modular para exibição das velocidades do plano.
 * Mostra download em destaque e upload como informação secundária.
 */

interface CardPlanoVelocidadeProps {
  velocidadeDownload: number;
  velocidadeUpload: number;
  className?: string;
}

export function CardPlanoVelocidade({
  velocidadeDownload,
  velocidadeUpload,
  className = "",
}: CardPlanoVelocidadeProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-100">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="w-6 h-6 text-[#1e3a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div className="text-3xl font-extrabold text-[#1e3a8a]">
              {velocidadeDownload} <span className="text-lg font-semibold text-gray-600">Mbps</span>
            </div>
          </div>
          <div className="text-sm font-medium text-gray-700">Velocidade de Download</div>
        </div>
      </div>

      {velocidadeUpload > 0 && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg py-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <span className="font-semibold">Upload:</span>
          <span className="font-bold text-[#1e3a8a]">{velocidadeUpload} Mbps</span>
        </div>
      )}
    </div>
  );
}
