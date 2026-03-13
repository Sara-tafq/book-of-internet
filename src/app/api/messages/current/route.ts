import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [currentMessage, totalCount, freeSlot, hallOfFame] = await Promise.all([
      prisma.message.findFirst({
        where: { active: true },
        select: { id: true, content: true, username: true, free: true, tier: true, likes: true, createdAt: true },
      }),
      prisma.message.count({
        where: { paid: true },
      }),
      prisma.freeSlot.findFirst({
        where: { used: false, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.message.findMany({
        where: { paid: true, active: false },
        orderBy: { likes: "desc" },
        take: 3,
        select: { id: true, content: true, username: true, free: true, tier: true, likes: true, createdAt: true },
      }),
    ]);

    let freeSlotInfo = null;
    if (freeSlot) {
      const minutesLeft = Math.max(
        0,
        Math.ceil((freeSlot.expiresAt.getTime() - Date.now()) / 60000)
      );
      freeSlotInfo = { active: true, minutesLeft };
    }

    return NextResponse.json({
      message: currentMessage,
      totalCount,
      freeSlot: freeSlotInfo,
      hallOfFame,
    });
  } catch (error) {
    console.error("Error fetching current message:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
