import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "dev";
  const password = "dev123";
  const senhaHash = await bcrypt.hash(password, 10);

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    await prisma.adminUser.update({
      where: { email },
      data: { senhaHash },
    });
    console.log("✅ Usuário admin 'dev' já existia; senha atualizada para dev123");
  } else {
    await prisma.adminUser.create({
      data: {
        email,
        senhaHash,
        role: "admin",
      },
    });
    console.log("✅ Usuário admin criado: dev / dev123");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
