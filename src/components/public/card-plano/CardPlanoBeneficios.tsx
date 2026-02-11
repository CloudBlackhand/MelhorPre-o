/**
 * Componente modular para exibição dos benefícios do plano.
 * Limita a exibição a 4 itens por padrão (configurável).
 */

interface CardPlanoBeneficiosProps {
  beneficios: string[];
  limite?: number;
  className?: string;
}

export function CardPlanoBeneficios({
  beneficios,
  limite = 4,
  className = "",
}: CardPlanoBeneficiosProps) {
  if (!beneficios || beneficios.length === 0) {
    return null;
  }

  const beneficiosExibir = beneficios.slice(0, limite);

  return (
    <div className={`pt-4 border-t border-gray-200 ${className}`}>
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Benefícios Inclusos:</h4>
      <ul className="space-y-2.5">
        {beneficiosExibir.map((beneficio, index) => (
          <li key={index} className="flex items-start text-sm text-gray-700 group/item">
            <svg
              className="w-5 h-5 text-green-500 mr-2.5 flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">{beneficio}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
