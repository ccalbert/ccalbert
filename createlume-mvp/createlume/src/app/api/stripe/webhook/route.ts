import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Stripe requires the raw request body to verify the webhook signature —
// do not let Next.js parse this as JSON before we verify it.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const plan = session.metadata?.plan as "FOUNDATION" | "GROWTH" | "MANAGED" | undefined;
      const orgName = session.metadata?.orgName;
      const email = session.metadata?.email ?? session.customer_email;

      if (plan && orgName && email && session.subscription && session.customer) {
        // Find-or-create the organization by name, then upsert its subscription.
        // In production you'd tie this to an authenticated user session instead
        // of trusting client-supplied metadata for anything beyond convenience.
        const org = await prisma.organization.upsert({
          where: { id: `pending-${email}` }, // placeholder key until real auth wires org creation
          create: { id: `pending-${email}`, name: orgName },
          update: { name: orgName },
        });

        await prisma.subscription.upsert({
          where: { organizationId: org.id },
          create: {
            organizationId: org.id,
            plan,
            status: "ACTIVE",
            stripeCustomerId: String(session.customer),
            stripeSubscriptionId: String(session.subscription),
          },
          update: {
            plan,
            status: "ACTIVE",
            stripeCustomerId: String(session.customer),
            stripeSubscriptionId: String(session.subscription),
          },
        });
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const status = mapStripeStatus(sub.status);
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          status,
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
      });
      break;
    }

    default:
      // Unhandled event types are fine to ignore — Stripe sends many more than we act on.
      break;
  }

  return NextResponse.json({ received: true });
}

function mapStripeStatus(
  s: Stripe.Subscription.Status
): "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE" {
  switch (s) {
    case "trialing":
      return "TRIALING";
    case "active":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
    case "unpaid":
      return "CANCELED";
    default:
      return "INCOMPLETE";
  }
}
