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
      content: "This is the beginning. You don't know me. I don't know you. But we're both here, at the same strange place on the internet, at the same strange time. Write something. Make it count. Once upon a time, oops, too cheesy. I'll let you start the book.",
      username: "Sara",
      paid: true,
      active: true,
      free: false,
      tier: 2,
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
