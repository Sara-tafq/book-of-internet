import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.message.findFirst({ where: { active: true } });
  if (existing) {
    console.log("Active message already exists, skipping seed.");
    return;
  }

  await prisma.message.create({
    data: {
      content: "One dollar. One message. One second of fame. Then you're gone — but never forgotten.",
      paid: true,
      active: true,
      free: false,
      tier: 1,
    },
  });

  console.log("First message seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
