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

    const message = await prisma.message.findUnique({
      where: { stripeSessionId: session.id },
    });

    if (message) {
      // Check if current active message is less than 30s old
      const activeMsg = await prisma.message.findFirst({
        where: { active: true },
        select: { activatedAt: true },
      });

      const isActiveRecent =
        activeMsg?.activatedAt &&
        Date.now() - activeMsg.activatedAt.getTime() < 30000;

      if (isActiveRecent) {
        // Queue the new message instead of activating it
        await prisma.message.update({
          where: { id: message.id },
          data: { paid: true, queued: true },
        });
      } else {
        // Activate immediately
        await prisma.$transaction([
          prisma.message.updateMany({
            where: { active: true },
            data: { active: false },
          }),
          prisma.message.update({
            where: { id: message.id },
            data: { paid: true, active: true, activatedAt: new Date() },
          }),
        ]);
      }

      // Free slot: triggered randomly between 30th and 50th paid message
      const paidCount = await prisma.message.count({
        where: { paid: true, free: false },
      });

      if (paidCount >= 30 && paidCount <= 50) {
        // Check if a free slot was already given in this range
        const existingSlotInRange = await prisma.freeSlot.count();
        const expectedSlots = Math.floor((paidCount - 30) / 1); // at most 1 slot per range

        // Random chance: ~5% per message in the 30-50 range, guaranteed by 50th
        const random = Math.random();
        const threshold = paidCount === 50 ? 1 : 0.05;

        if (existingSlotInRange === 0 || (random < threshold && paidCount > 30)) {
          // Only create if no unused slot exists
          const unusedSlot = await prisma.freeSlot.findFirst({
            where: { used: false, expiresAt: { gt: new Date() } },
          });
          if (!unusedSlot) {
            await prisma.freeSlot.create({
              data: {
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
              },
            });
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
