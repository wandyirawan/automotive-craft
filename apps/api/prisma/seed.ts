import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const users = [
    { email: "admin@mail.com", name: "Admin", password: "admin123" },
    { email: "budi@mail.com", name: "Budi", password: "budi123" },
    { email: "dani@mail.com", name: "Dani", password: "dani123" },
    { email: "rudi@mail.com", name: "Rudi", password: "rudi123" },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        passwordHash,
      },
    });

    console.log(`Seeded user: ${user.email} (password: ${u.password})`);
  }
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
