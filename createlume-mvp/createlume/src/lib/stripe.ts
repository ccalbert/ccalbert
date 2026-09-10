import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  // Thrown at build/runtime, not at import time in edge cases — keeps errors legible.
  console.warn("STRIPE_SECRET_KEY is not set. Billing routes will fail until it is.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-06-20",
});

// Map our internal plan tiers to Stripe Price IDs.
// Create these Products/Prices in the Stripe Dashboard (or via `stripe products create`)
// and paste the resulting price_... ids into your environment variables.
export const PLAN_PRICE_IDS: Record<"FOUNDATION" | "GROWTH" | "MANAGED", string | undefined> = {
  FOUNDATION: process.env.STRIPE_PRICE_FOUNDATION,
  GROWTH: process.env.STRIPE_PRICE_GROWTH,
  MANAGED: process.env.STRIPE_PRICE_MANAGED,
};

export const PLAN_DETAILS = {
  FOUNDATION: { name: "Foundation", monthly: 499 },
  GROWTH: { name: "Growth", monthly: 1499 },
  MANAGED: { name: "Managed", monthly: 2499 },
} as const;
