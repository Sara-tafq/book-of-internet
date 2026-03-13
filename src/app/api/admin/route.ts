import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getIP } from "@/lib/rate-limit";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (input.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(input, "utf8"),
      Buffer.from(expected, "utf8")
    );
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const ip = getIP(req);
  const limit = rateLimit(`admin:${ip}`, 5, 3600_000);
  const password = req.headers.get("x-admin-password") || "";

  if (!checkPassword(password)) {
    if (!limit.ok) {
      return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    }
    await new Promise((r) => setTimeout(r, 1000));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    return NextResponse.json({ messages, totalRevenue, totalFree, contactMessages });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const password = req.headers.get("x-admin-password") || "";
  if (!checkPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, field } = await req.json();
    if (!id || !["saraPick", "hallOfFame", "highlight"].includes(field)) {
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
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
