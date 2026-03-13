import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Find the pending message
    const message = await prisma.message.findUnique({
      where: { stripeSessionId: session.id },
    });

    if (message) {
      // Activate this message, deactivate all others
      await prisma.$transaction([
        prisma.message.updateMany({
          where: { active: true },
          data: { active: false },
        }),
        prisma.message.update({
          where: { id: message.id },
          data: { paid: true, active: true },
        }),
      ]);

      // Check if this is every 10th paid message → create free slot
      const paidCount = await prisma.message.count({
        where: { paid: true, free: false },
      });

      if (paidCount % 10 === 0) {
        await prisma.freeSlot.create({
          data: {
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
          },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
