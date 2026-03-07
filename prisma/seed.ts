import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { execSync } from "child_process";
import * as path from "path";
import { OPERADORAS_PLANOS } from "../src/config/operadoras-planos";

const prisma = new PrismaClient();

async function main() {
  // 1. Admin user
  const email = "dev";
  const password = "dev123";
  const senhaHash = await bcrypt.hash(password, 10);

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    await prisma.adminUser.update({
      where: { email },
      data: { senhaHash },
    });
    console.log("Admin 'dev' já existia; senha atualizada para dev123");
  } else {
    await prisma.adminUser.create({
      data: { email, senhaHash, role: "admin" },
    });
    console.log("Admin criado: dev / dev123");
  }

  // 2. Operadoras e planos a partir do config (fonte única no código)
  console.log("\nSincronizando operadoras e planos do config...");
  for (const op of OPERADORAS_PLANOS) {
    const existingOp = await prisma.operadora.findUnique({ where: { slug: op.slug } });
    const data = {
      nome: op.nome,
      slug: op.slug,
      logoUrl: op.logoUrl ?? null,
      siteUrl: op.siteUrl ?? null,
      telefone: op.telefone ?? null,
      email: op.email ?? null,
      ativo: true,
      ordemRecomendacao: op.ordemRecomendacao ?? null,
    };
    let operadoraId: string;
    if (existingOp) {
      await prisma.operadora.update({ where: { slug: op.slug }, data });
      operadoraId = existingOp.id;
      console.log(`  Operadora atualizada: ${op.nome} (${op.slug})`);
    } else {
      const created = await prisma.operadora.create({ data });
      operadoraId = created.id;
      console.log(`  Operadora criada: ${op.nome} (${op.slug})`);
    }
    // Planos: upsert por nome dentro da operadora (evitar duplicar)
    for (const pl of op.planos) {
      const existingPl = await prisma.plano.findFirst({
        where: { operadoraId, nome: pl.nome },
      });
      const plData = {
        nome: pl.nome,
        velocidadeDownload: pl.velocidadeDownload,
        velocidadeUpload: pl.velocidadeUpload,
        preco: pl.preco,
        descricao: pl.descricao ?? null,
        beneficios: pl.beneficios ?? null,
        ativo: true,
      };
      if (existingPl) {
        await prisma.plano.update({ where: { id: existingPl.id }, data: plData });
      } else {
        await prisma.plano.create({ data: { operadoraId, ...plData } });
      }
    }
    console.log(`  Planos: ${op.planos.length} para ${op.nome}`);
  }

  // 3. KML seed (áreas de cobertura a partir da pasta KM/; operadoras já existem)
  const seedKmlPath = path.resolve(__dirname, "seed-kml.ts");
  try {
    console.log("\nExecutando seed de KMLs...");
    execSync(`npx tsx "${seedKmlPath}"`, { stdio: "inherit", cwd: path.resolve(__dirname, "..") });
  } catch (err) {
    console.warn("Aviso: seed-kml falhou (pode não haver pasta KM/ no servidor):", err instanceof Error ? err.message : err);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
