import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { rateLimit, getIP } from "@/lib/rate-limit";
import { stripHtml } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const limit = rateLimit(`messages:${ip}`, 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  try {
    const { content, tier, username } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const selectedTier = tier === 2 ? 2 : 1;
    const maxChars = selectedTier === 1 ? 200 : 1200;
    const priceId =
      selectedTier === 1
        ? process.env.STRIPE_PRICE_ID_TIER1!
        : process.env.STRIPE_PRICE_ID_TIER2 || process.env.STRIPE_PRICE_ID_TIER1!;

    const sanitizedContent = stripHtml(content).slice(0, maxChars);
    const sanitizedUsername = username ? stripHtml(username).slice(0, 30) : null;

    if (sanitizedContent.length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: baseUrl,
    });

    await prisma.message.create({
      data: {
        content: sanitizedContent,
        username: sanitizedUsername,
        paid: false,
        active: false,
        free: false,
        tier: selectedTier,
        stripeSessionId: session.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
