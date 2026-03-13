import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { content, tier, username } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const selectedTier = tier === 2 ? 2 : 1;
    const maxChars = selectedTier === 1 ? 200 : 600;
    const priceId =
      selectedTier === 1
        ? process.env.STRIPE_PRICE_ID_TIER1!
        : process.env.STRIPE_PRICE_ID_TIER2 || process.env.STRIPE_PRICE_ID_TIER1!;

    if (content.length > maxChars) {
      return NextResponse.json(
        { error: `Message too long (max ${maxChars} chars)` },
        { status: 400 }
      );
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
        content: content.trim(),
        username: username?.trim() || null,
        paid: false,
        active: false,
        free: false,
        tier: selectedTier,
        stripeSessionId: session.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
