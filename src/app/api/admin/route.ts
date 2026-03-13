import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password");

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [messages, contactMessages] = await Promise.all([
    prisma.message.findMany({
      where: { paid: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalRevenue = messages
    .filter((m) => !m.free)
    .reduce((sum, m) => sum + (m.tier === 2 ? 5 : 1), 0);
  const totalFree = messages.filter((m) => m.free).length;

  return NextResponse.json({
    messages,
    totalRevenue,
    totalFree,
    contactMessages,
  });
}

export async function PATCH(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, field } = await req.json();
  if (!id || !["saraPick", "hallOfFame"].includes(field)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const message = await prisma.message.findUnique({ where: { id } });
  if (!message) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.message.update({
    where: { id },
    data: { [field]: !message[field as keyof typeof message] },
  });

  return NextResponse.json(updated);
}
