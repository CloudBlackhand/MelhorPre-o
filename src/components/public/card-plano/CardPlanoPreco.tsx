/**
 * Componente modular para exibição do preço do plano.
 * Formata automaticamente o valor em R$ com decimais.
 */

interface CardPlanoPrecoProps {
  preco: number | string;
  className?: string;
}

export function CardPlanoPreco({ preco, className = "" }: CardPlanoPrecoProps) {
  const precoNum = typeof preco === 'string' ? parseFloat(preco) : Number(preco);
  const precoInteiro = Math.floor(precoNum);
  const precoDecimal = Math.round((precoNum - precoInteiro) * 100).toString().padStart(2, '0');

  return (
    <div className={`mb-6 pb-6 border-b border-gray-200 ${className}`}>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-gray-500">R$</span>
        <span className="text-5xl font-extrabold text-[#1e3a8a]">{precoInteiro}</span>
        <span className="text-xl font-semibold text-gray-500">,{precoDecimal}</span>
        <span className="text-sm text-gray-500 ml-2">/mês</span>
      </div>
    </div>
  );
}
