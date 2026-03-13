import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Message ID required" }, { status: 400 });
    }

    await prisma.message.update({
      where: { id },
      data: { likes: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error liking message:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
