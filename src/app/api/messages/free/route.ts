import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (content.length > 280) {
      return NextResponse.json({ error: "Message too long (max 280 chars)" }, { status: 400 });
    }

    // Check for active free slot
    const freeSlot = await prisma.freeSlot.findFirst({
      where: {
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!freeSlot) {
      return NextResponse.json({ error: "No free slot available" }, { status: 400 });
    }

    // Use transaction to prevent race conditions
    await prisma.$transaction([
      // Mark free slot as used
      prisma.freeSlot.update({
        where: { id: freeSlot.id },
        data: { used: true },
      }),
      // Deactivate all current messages
      prisma.message.updateMany({
        where: { active: true },
        data: { active: false },
      }),
      // Create new free message
      prisma.message.create({
        data: {
          content: content.trim(),
          paid: true,
          active: true,
          free: true,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating free message:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
