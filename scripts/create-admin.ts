import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || "admin@melhorpreco.net";
  const password = process.argv[3] || "admin123";
  const role = process.argv[4] || "admin";

  if (!email || !password) {
    console.error("Usage: npx tsx scripts/create-admin.ts <email> <password> [role]");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.adminUser.create({
      data: {
        email,
        senhaHash: hashedPassword,
        role: role as "admin" | "super_admin",
      },
    });

    console.log(`✅ Usuário admin criado com sucesso!`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
  } catch (error: any) {
    if (error.code === "P2002") {
      console.error("❌ Erro: Email já existe");
    } else {
      console.error("❌ Erro ao criar usuário:", error.message);
    }
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

