"use client";

import { useState } from "react";
import Link from "next/link";

const PLANS = [
  {
    id: "FOUNDATION" as const,
    name: "Foundation",
    price: 499,
    description: "For organizations just starting to formalize their funding search.",
    features: [
      "Grant discovery matched to your mission",
      "Compliance deadline calendar",
      "Organization profile & document storage",
    ],
  },
  {
    id: "GROWTH" as const,
    name: "Growth",
    price: 1499,
    description: "The full operating system — funding, compliance, and fundraising together.",
    features: [
      "Everything in Foundation",
      "AI-drafted grant narratives and budgets (you review before submission)",
      "Donor CRM and campaign automation",
      "Monthly funding pipeline report",
    ],
    featured: true,
  },
  {
    id: "MANAGED" as const,
    name: "Managed",
    price: 2499,
    description: "For organizations that want hands-on help, not just software.",
    features: [
      "Everything in Growth",
      "Human review on applications before submission",
      "Monthly strategy call with your account team",
      "Compliance filing assistance",
    ],
  },
];

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [orgName, setOrgName] = useState("");
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(planId: string) {
    if (!email || !orgName) {
      setActivePlan(planId);
      return;
    }
    setLoadingPlan(planId);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, email, orgName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoadingPlan(null);
    }
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-16 text-ink">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-ink/60 hover:text-moss">← Createlume</Link>
        <h1 className="mt-4 font-serif text-4xl">Plans built around one goal: fewer hires, more funding.</h1>
        <p className="mt-3 max-w-lg text-ink/70">
          Every plan includes the same underlying platform. Higher tiers add more of the work
          done for you.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-md border p-6 ${
                plan.featured ? "border-moss bg-white/70 shadow-sm" : "border-ink/10 bg-white/40"
              }`}
            >
              <h2 className="font-serif text-xl">{plan.name}</h2>
              <p className="mt-1 text-sm text-ink/60">{plan.description}</p>
              <p className="mt-4">
                <span className="font-serif text-3xl">${plan.price.toLocaleString()}</span>
                <span className="text-sm text-ink/50"> / month</span>
              </p>
              <ul className="mt-6 space-y-2 text-sm text-ink/80">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-moss">·</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {activePlan === plan.id ? (
                <div className="mt-6 space-y-2">
                  <input
                    type="text"
                    placeholder="Organization name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full rounded-sm border border-ink/20 bg-white px-3 py-2 text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Work email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-sm border border-ink/20 bg-white px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => startCheckout(plan.id)}
                    disabled={loadingPlan === plan.id}
                    className="w-full rounded-sm bg-moss px-4 py-2 text-sm text-paper hover:bg-ink disabled:opacity-50"
                  >
                    {loadingPlan === plan.id ? "Redirecting to checkout…" : "Continue to payment"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startCheckout(plan.id)}
                  className="mt-6 w-full rounded-sm bg-ink px-4 py-2 text-sm text-paper hover:bg-moss"
                >
                  Choose {plan.name}
                </button>
              )}
            </div>
          ))}
        </div>
        {error && <p className="mt-4 text-sm text-rust">{error}</p>}
      </div>
    </main>
  );
}
