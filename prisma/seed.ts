import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function randomDate(daysAgo: number) {
  const now = Date.now();
  const offset = Math.random() * daysAgo * 24 * 60 * 60 * 1000;
  return new Date(now - offset);
}

async function main() {
  const existing = await prisma.message.findFirst({ where: { active: true } });
  if (existing) {
    console.log("Active message already exists, skipping seed.");
    return;
  }

  const messages = [
    {
      content: "I've been thinking about the last thing my father said to me. I wasn't listening. I was looking at my phone. I would give anything to go back to that exact second.",
      username: "anonymous",
      active: false,
      saraPick: false,
      highlight: true,
    },
    {
      content: "she left and took the smell of her perfume with her. the apartment still remembers her. I'm trying to forget.",
      username: "clara",
      active: false,
      saraPick: false,
      highlight: false,
    },
    {
      content: "it's 3am. the city is quiet for once. I feel like the last person alive and somehow that's the most peaceful I've felt in months.",
      username: "nightowl",
      active: false,
      saraPick: false,
      highlight: false,
    },
    {
      content: "I smiled at a stranger today. he looked confused. then he smiled back. that was the whole interaction. it was enough.",
      username: "anonymous",
      active: true,
      saraPick: false,
      highlight: false,
    },
    {
      content: "I keep writing letters I never send. one day I'll be gone and someone will find them. I hope they understand.",
      username: "m.",
      active: false,
      saraPick: false,
      highlight: true,
    },
    {
      content: "my grandmother used to say the sky looks different depending on what you carry inside. today it looked very heavy.",
      username: "anonymous",
      active: false,
      saraPick: false,
      highlight: false,
    },
    {
      content: "I don't know who reads this. I don't know why I'm writing it. but something about knowing a stranger will see it makes it feel less lonely.",
      username: "echo",
      active: false,
      saraPick: true,
      highlight: false,
    },
    {
      content: "we are all just passing through. pay your dollar. say your thing. disappear. that's life, honestly.",
      username: "anonymous",
      active: false,
      saraPick: false,
      highlight: true,
    },
  ];

  for (const m of messages) {
    await prisma.message.create({
      data: {
        content: m.content,
        username: m.username,
        paid: true,
        active: m.active,
        free: false,
        tier: 2,
        saraPick: m.saraPick,
        highlight: m.highlight,
        activatedAt: m.active ? new Date() : null,
        createdAt: randomDate(30),
      },
    });
  }

  console.log("Seed messages created successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
