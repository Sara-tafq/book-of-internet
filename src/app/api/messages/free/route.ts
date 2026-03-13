import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getIP } from "@/lib/rate-limit";
import { stripHtml } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const limit = rateLimit(`free:${ip}`, 3, 3600_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  try {
    const { content, username } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const sanitizedContent = stripHtml(content).slice(0, 200);
    const sanitizedUsername = username ? stripHtml(username).slice(0, 30) : null;

    if (sanitizedContent.length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
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
      await prisma.$transaction([
        prisma.freeSlot.update({
          where: { id: freeSlot.id },
          data: { used: true },
        }),
        prisma.message.create({
          data: {
            content: sanitizedContent,
            username: sanitizedUsername,
            paid: true,
            queued: true,
            free: true,
            tier: 1,
          },
        }),
      ]);
    } else {
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
            content: sanitizedContent,
            username: sanitizedUsername,
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
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
