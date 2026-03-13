import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let currentMessage = await prisma.message.findFirst({
      where: { active: true },
      select: { id: true, content: true, username: true, free: true, tier: true, likes: true, createdAt: true, activatedAt: true },
    });

    // Queue promotion: if active message is > 30s old and queued messages exist, promote next
    if (currentMessage?.activatedAt) {
      const elapsed = Date.now() - currentMessage.activatedAt.getTime();
      if (elapsed > 30000) {
        const nextQueued = await prisma.message.findFirst({
          where: { queued: true },
          orderBy: { createdAt: "asc" },
        });
        if (nextQueued) {
          await prisma.$transaction([
            prisma.message.update({
              where: { id: currentMessage.id },
              data: { active: false },
            }),
            prisma.message.update({
              where: { id: nextQueued.id },
              data: { queued: false, active: true, activatedAt: new Date() },
            }),
          ]);
          currentMessage = await prisma.message.findFirst({
            where: { active: true },
            select: { id: true, content: true, username: true, free: true, tier: true, likes: true, createdAt: true, activatedAt: true },
          });
        }
      }
    }

    const [totalCount, freeSlot, hallOfFame, queueCount] = await Promise.all([
      prisma.message.count({
        where: { paid: true },
      }),
      prisma.freeSlot.findFirst({
        where: { used: false, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.message.findMany({
        where: { hallOfFame: true },
        orderBy: { createdAt: "desc" },
        select: { id: true, content: true, username: true, free: true, tier: true, likes: true, createdAt: true },
      }),
      prisma.message.count({
        where: { queued: true },
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

    // Calculate seconds left for the active message
    let secondsLeft: number | null = null;
    if (currentMessage?.activatedAt) {
      secondsLeft = Math.max(0, 30 - Math.floor((Date.now() - currentMessage.activatedAt.getTime()) / 1000));
    }

    return NextResponse.json({
      message: currentMessage ? {
        id: currentMessage.id,
        content: currentMessage.content,
        username: currentMessage.username,
        free: currentMessage.free,
        tier: currentMessage.tier,
        likes: currentMessage.likes,
        createdAt: currentMessage.createdAt,
      } : null,
      totalCount,
      freeSlot: freeSlotInfo,
      hallOfFame,
      queueCount,
      secondsLeft,
    });
  } catch (error) {
    console.error("Error fetching current message:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
