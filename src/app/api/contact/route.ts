import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getIP } from "@/lib/rate-limit";
import { stripHtml } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const limit = rateLimit(`contact:${ip}`, 5, 3600_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  try {
    const { name, email, message } = await req.json();

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const sanitizedMessage = stripHtml(message).slice(0, 1000);
    const sanitizedName = name ? stripHtml(name).slice(0, 50) : null;
    const sanitizedEmail = email ? stripHtml(email).slice(0, 100) : null;

    if (sanitizedMessage.length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    await prisma.contactMessage.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        message: sanitizedMessage,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
