/**
 * Componente modular para botão de ação do plano.
 * Gerencia WhatsApp e pode ser facilmente customizado.
 */

"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import axios from "axios";

interface CardPlanoButtonProps {
  plano: {
    nome: string;
    velocidadeDownload: number;
    velocidadeUpload: number;
    preco: number | string;
    operadora: {
      nome: string;
    };
  };
  texto?: string;
  className?: string;
}

export function CardPlanoButton({
  plano,
  texto = "Contratar",
  className = "",
}: CardPlanoButtonProps) {
  const [whatsappNumber, setWhatsappNumber] = useState<string>("5511999999999");

  useEffect(() => {
    const fetchWhatsappNumber = async () => {
      try {
        const response = await axios.get("/api/configs?chave=whatsapp_number");
        if (response.data?.valor) {
          setWhatsappNumber(response.data.valor);
        }
      } catch (error) {
        console.log("Usando número padrão do WhatsApp");
      }
    };

    fetchWhatsappNumber();
  }, []);

  const handleContratar = () => {
    const precoNum = typeof plano.preco === 'string' ? parseFloat(plano.preco) : Number(plano.preco);
    const precoInteiro = Math.floor(precoNum);
    const precoDecimal = Math.round((precoNum - precoInteiro) * 100).toString().padStart(2, '0');

    const mensagem = encodeURIComponent(
      `Olá! Gostaria de contratar o plano:\n\n` +
      `📦 *${plano.nome}*\n` +
      `🏢 Operadora: ${plano.operadora.nome}\n` +
      `⚡ Velocidade: ${plano.velocidadeDownload} Mbps (Download) / ${plano.velocidadeUpload} Mbps (Upload)\n` +
      `💰 Preço: R$ ${precoInteiro},${precoDecimal}/mês\n\n` +
      `Podem me ajudar com mais informações?`
    );
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${mensagem}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      onClick={handleContratar}
      className={`w-full h-12 text-lg font-semibold bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] hover:from-[#1e40af] hover:to-[#1e3a8a] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 mt-auto ${className}`}
    >
      {texto}
    </Button>
  );
}
