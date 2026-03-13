import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { content, username } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (content.length > 110) {
      return NextResponse.json({ error: "Free messages are limited to 110 characters" }, { status: 400 });
    }

    const freeSlot = await prisma.freeSlot.findFirst({
      where: { used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (!freeSlot) {
      return NextResponse.json({ error: "No free slot available" }, { status: 400 });
    }

    // Check if current active message is less than 30s old
    const activeMsg = await prisma.message.findFirst({
      where: { active: true },
      select: { activatedAt: true },
    });

    const isActiveRecent =
      activeMsg?.activatedAt &&
      Date.now() - activeMsg.activatedAt.getTime() < 30000;

    if (isActiveRecent) {
      // Queue the free message
      await prisma.$transaction([
        prisma.freeSlot.update({
          where: { id: freeSlot.id },
          data: { used: true },
        }),
        prisma.message.create({
          data: {
            content: content.trim(),
            username: username?.trim() || null,
            paid: true,
            queued: true,
            free: true,
            tier: 1,
          },
        }),
      ]);
    } else {
      // Activate immediately
      await prisma.$transaction([
        prisma.freeSlot.update({
          where: { id: freeSlot.id },
          data: { used: true },
        }),
        prisma.message.updateMany({
          where: { active: true },
          data: { active: false },
        }),
        prisma.message.create({
          data: {
            content: content.trim(),
            username: username?.trim() || null,
            paid: true,
            active: true,
            free: true,
            tier: 1,
            activatedAt: new Date(),
          },
        }),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating free message:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
