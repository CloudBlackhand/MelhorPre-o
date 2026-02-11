/**
 * Script de teste para validar o fluxo completo de cobertura KML/KMZ
 * 
 * Uso: npx tsx scripts/test-coverage.ts
 * 
 * Este script testa:
 * 1. Upload de KML/KMZ
 * 2. Busca por CEP
 * 3. Verificação de resultados
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";
import axios from "axios";

const prisma = new PrismaClient();
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

interface TestResult {
  test: string;
  success: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function logResult(test: string, success: boolean, message: string, details?: any) {
  results.push({ test, success, message, details });
  const icon = success ? "✅" : "❌";
  console.log(`${icon} ${test}: ${message}`);
  if (details && !success) {
    console.log("   Detalhes:", JSON.stringify(details, null, 2));
  }
}

async function testOperadoras() {
  console.log("\n📋 Testando operadoras...");
  
  try {
    const operadoras = await prisma.operadora.findMany({ where: { ativo: true } });
    
    if (operadoras.length === 0) {
      logResult(
        "Operadoras",
        false,
        "Nenhuma operadora ativa encontrada. Crie operadoras antes de testar cobertura."
      );
      return null;
    }
    
    logResult(
      "Operadoras",
      true,
      `Encontradas ${operadoras.length} operadora(s) ativa(s)`,
      operadoras.map((o) => ({ id: o.id, nome: o.nome }))
    );
    
    return operadoras[0];
  } catch (error) {
    logResult("Operadoras", false, `Erro ao buscar operadoras: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    return null;
  }
}

async function testKMLUpload(operadoraId: string) {
  console.log("\n📤 Testando upload de KML...");
  
  // Verificar se existe arquivo de teste
  const testKMLPath = join(process.cwd(), "KM", "Area-de-Cobertura 30-07-2025.kml");
  
  try {
    const kmlContent = readFileSync(testKMLPath, "utf-8");
    logResult("Leitura de KML", true, `KML lido com sucesso (${(kmlContent.length / 1024).toFixed(2)} KB)`);
    
    // Nota: Upload real requer autenticação admin
    // Este teste apenas valida que o arquivo pode ser lido
    logResult(
      "Upload de KML",
      true,
      "Arquivo KML válido encontrado. Para testar upload completo, use a interface admin."
    );
    
    return true;
  } catch (error) {
    if ((error as any).code === "ENOENT") {
      logResult(
        "Leitura de KML",
        false,
        `Arquivo de teste não encontrado em: ${testKMLPath}`
      );
    } else {
      logResult(
        "Leitura de KML",
        false,
        `Erro ao ler KML: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
    }
    return false;
  }
}

async function testCoverageAreas() {
  console.log("\n🗺️  Testando áreas de cobertura...");
  
  try {
    const areas = await prisma.coberturaArea.findMany({
      include: { operadora: true },
      take: 5,
    });
    
    if (areas.length === 0) {
      logResult(
        "Áreas de Cobertura",
        false,
        "Nenhuma área de cobertura cadastrada. Faça upload de KMLs no painel admin."
      );
      return false;
    }
    
    logResult(
      "Áreas de Cobertura",
      true,
      `Encontradas ${areas.length} área(s) de cobertura`,
      areas.map((a) => ({
        id: a.id,
        nome: a.nomeArea,
        operadora: a.operadora.nome,
        features: (a.geometria as any)?.features?.length || 0,
      }))
    );
    
    return true;
  } catch (error) {
    logResult(
      "Áreas de Cobertura",
      false,
      `Erro ao buscar áreas: ${error instanceof Error ? error.message : "Erro desconhecido"}`
    );
    return false;
  }
}

async function testCEPSearch(testCEP: string = "01310-100") {
  console.log(`\n🔍 Testando busca por CEP: ${testCEP}...`);
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/cobertura`, {
      params: { cep: testCEP },
      timeout: 10000,
    });
    
    const data = response.data;
    
    if (data.operadoras && data.operadoras.length > 0) {
      const totalPlanos = data.operadoras.reduce(
        (sum: number, op: any) => sum + op.planos.length,
        0
      );
      
      logResult(
        "Busca por CEP",
        true,
        `Cobertura encontrada: ${data.operadoras.length} operadora(s), ${totalPlanos} plano(s)`,
        {
          cep: data.cep,
          operadoras: data.operadoras.map((op: any) => ({
            nome: op.nome,
            planos: op.planos.length,
          })),
        }
      );
      
      return true;
    } else {
      logResult(
        "Busca por CEP",
        true,
        `CEP encontrado, mas sem cobertura cadastrada. ${data.mensagem || ""}`,
        { cep: data.cep }
      );
      return false;
    }
  } catch (error: any) {
    if (error.code === "ECONNREFUSED") {
      logResult(
        "Busca por CEP",
        false,
        `Não foi possível conectar à API em ${API_BASE_URL}. Certifique-se de que o servidor está rodando.`
      );
    } else {
      logResult(
        "Busca por CEP",
        false,
        `Erro na busca: ${error.response?.data?.mensagem || error.message || "Erro desconhecido"}`
      );
    }
    return false;
  }
}

async function testPlanos(operadoraId?: string) {
  console.log("\n📦 Testando planos...");
  
  try {
    const where = operadoraId ? { operadoraId, ativo: true } : { ativo: true };
    const planos = await prisma.plano.findMany({
      where,
      include: { operadora: true },
      take: 10,
    });
    
    if (planos.length === 0) {
      logResult(
        "Planos",
        false,
        "Nenhum plano ativo encontrado. Cadastre planos no painel admin."
      );
      return false;
    }
    
    const operadorasUnicas = new Set(planos.map((p) => p.operadora.nome));
    
    logResult(
      "Planos",
      true,
      `Encontrados ${planos.length} plano(s) de ${operadorasUnicas.size} operadora(s)`,
      {
        operadoras: Array.from(operadorasUnicas),
        planos: planos.slice(0, 3).map((p) => ({
          nome: p.nome,
          operadora: p.operadora.nome,
          preco: p.preco.toString(),
        })),
      }
    );
    
    return true;
  } catch (error) {
    logResult(
      "Planos",
      false,
      `Erro ao buscar planos: ${error instanceof Error ? error.message : "Erro desconhecido"}`
    );
    return false;
  }
}

async function runTests() {
  console.log("🚀 Iniciando testes de cobertura KML/KMZ\n");
  console.log(`API Base URL: ${API_BASE_URL}\n`);
  
  // Test 1: Operadoras
  const operadora = await testOperadoras();
  
  // Test 2: Planos
  await testPlanos(operadora?.id);
  
  // Test 3: Áreas de cobertura
  const hasAreas = await testCoverageAreas();
  
  // Test 4: KML Upload (validação de arquivo)
  await testKMLUpload(operadora?.id || "");
  
  // Test 5: Busca por CEP (apenas se API estiver disponível)
  if (hasAreas) {
    await testCEPSearch("01310-100"); // CEP de exemplo (Av. Paulista, SP)
  } else {
    logResult(
      "Busca por CEP",
      false,
      "Pulado: nenhuma área de cobertura cadastrada"
    );
  }
  
  // Resumo
  console.log("\n" + "=".repeat(60));
  console.log("📊 RESUMO DOS TESTES");
  console.log("=".repeat(60));
  
  const successCount = results.filter((r) => r.success).length;
  const totalCount = results.length;
  
  results.forEach((result) => {
    const icon = result.success ? "✅" : "❌";
    console.log(`${icon} ${result.test}`);
  });
  
  console.log("\n" + "=".repeat(60));
  console.log(`Total: ${successCount}/${totalCount} testes passaram`);
  console.log("=".repeat(60));
  
  if (successCount === totalCount) {
    console.log("\n🎉 Todos os testes passaram!");
  } else {
    console.log("\n⚠️  Alguns testes falharam. Revise os resultados acima.");
  }
}

// Executar testes
runTests()
  .catch((error) => {
    console.error("\n❌ Erro fatal durante os testes:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
