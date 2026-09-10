import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe, PLAN_PRICE_IDS } from "@/lib/stripe";

const CheckoutSchema = z.object({
  plan: z.enum(["FOUNDATION", "GROWTH", "MANAGED"]),
  email: z.string().email(),
  orgName: z.string().min(2),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { plan, email, orgName } = parsed.data;

  const priceId = PLAN_PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json(
      { error: `No Stripe price configured for plan ${plan}. Set STRIPE_PRICE_${plan} in env.` },
      { status: 500 }
    );
  }

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://createlume.com";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=canceled`,
    subscription_data: {
      metadata: { plan, orgName },
    },
    metadata: { plan, orgName, email },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
