import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password");

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messages = await prisma.message.findMany({
    where: { paid: true },
    orderBy: { createdAt: "desc" },
  });

  const totalRevenue = messages
    .filter((m) => !m.free)
    .reduce((sum, m) => sum + (m.tier === 2 ? 5 : 1), 0);
  const totalFree = messages.filter((m) => m.free).length;

  return NextResponse.json({
    messages,
    totalRevenue,
    totalFree,
  });
}
