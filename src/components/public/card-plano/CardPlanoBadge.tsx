/**
 * Componente modular para badge de destaque do plano.
 * Configurável via props para fácil customização.
 */

interface CardPlanoBadgeProps {
  texto: string;
  cor: string;
  className?: string;
}

export function CardPlanoBadge({ texto, cor, className = "" }: CardPlanoBadgeProps) {
  return (
    <div className={`absolute top-4 right-4 z-10 ${className}`}>
      <span
        className={`${cor} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg opacity-90 group-hover:opacity-100 transition-opacity`}
      >
        {texto}
      </span>
    </div>
  );
}
