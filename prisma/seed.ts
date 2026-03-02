import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { execSync } from "child_process";
import * as path from "path";

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

  // 2. KML seed (cria operadoras + areas de cobertura a partir da pasta KM/)
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
