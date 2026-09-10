# Createlume

Operations software for small and midsize nonprofits — funding discovery, grant
applications, compliance tracking, and fundraising, in one subscription.

## What's actually working in this build

- **Landing page + pricing page** — real, styled, responsive.
- **Free Funding Audit** (`/audit`) — submits to `/api/audit`, which calls the real,
  free **Grants.gov Search2 API** and scores results against the org's stated
  program areas and location using an explainable scoring engine
  (`src/lib/matching.ts`). This is live federal grant data, not placeholder content.
- **Stripe Checkout** (`/pricing` → `/api/checkout`) — creates a real subscription
  checkout session once you add your Stripe Price IDs.
- **Stripe webhook** (`/api/stripe/webhook`) — listens for `checkout.session.completed`
  and subscription status changes, and writes them to the database. This is what
  makes the site "dynamically update": a customer's plan and status in the database
  change automatically as Stripe events happen, with no manual intervention.
- **Database schema** (`prisma/schema.prisma`) — organizations, users, subscriptions,
  grant opportunities, matches, and applications.

## What's intentionally not built yet

- **Authentication.** There's no login system yet. The webhook currently creates a
  placeholder organization record keyed by email; it does not create a real user
  account or send login credentials. This is the single most important next step —
  see "Next build phase" below.
- **The in-app dashboard, Grant Workspace, Compliance Center, and donor CRM** are
  not built. `/dashboard` is a placeholder.
- **Foundation/corporate/local grants** aren't included — no free public API covers
  them. `GrantOpportunity` rows with `source = "CURATED"` are how you'll add these
  manually, or via a licensed data provider later.
- **AI-drafted narratives** aren't wired in. When you're ready, this is a
  straightforward Claude API integration (see Anthropic's docs) fed by the
  Organization Profile fields already in the schema.

I did not fabricate numbers the product can't yet back up — e.g., the audit doesn't
display a specific "$640,000 in potential funding" figure, because Grants.gov's
search endpoint doesn't return award amounts. That number should only appear once
it's a real calculation.

## Deployment steps

### 1. Database — Neon or Supabase (both have free Postgres tiers)
1. Create a project at neon.tech or supabase.com.
2. Copy the connection string into `DATABASE_URL` in a `.env` file (copy `.env.example` to `.env` first).
3. Run:
   ```
   npm install
   npm run db:push
   ```

### 2. Stripe
1. In the Stripe Dashboard, create one Product ("Createlume Subscription") with
   three recurring Prices: $499/mo, $1,499/mo, $2,499/mo.
2. Copy each Price ID into `.env` as `STRIPE_PRICE_FOUNDATION` / `_GROWTH` / `_MANAGED`.
3. Copy your Secret Key into `STRIPE_SECRET_KEY`.
4. After deploying (step 4), add a webhook endpoint in Stripe pointing to
   `https://createlume.com/api/stripe/webhook`, listening for
   `checkout.session.completed`, `customer.subscription.updated`, and
   `customer.subscription.deleted`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

### 3. Push to GitHub
```
git init
git add .
git commit -m "Initial Createlume build"
```
Push to a new GitHub repo (create one at github.com/new first).

### 4. Deploy to Vercel
1. Go to vercel.com → New Project → import your GitHub repo.
2. Add all the variables from `.env` in Vercel's Environment Variables settings.
3. Deploy.

### 5. Point createlume.com at Vercel (from GoDaddy)
1. In Vercel, go to your project → Settings → Domains → add `createlume.com`.
2. Vercel will show you DNS records to add.
3. In GoDaddy: My Products → DNS → add the A record and CNAME record Vercel gave you.
4. DNS propagation typically takes 10 minutes to a few hours.

## Next build phase (in priority order)

1. **Authentication** — email/password or magic-link login, tied properly to the
   `User` and `Organization` models (the webhook's placeholder org logic should be
   replaced once this exists).
2. **Organization Profile setup flow** — the onboarding form that populates
   mission, programs, EIN, budgets, etc.
3. **Real Grant Workspace UI** — the pipeline table, opportunity detail view, and
   "Start Application" flow, built on the `GrantMatch` and `GrantApplication` models
   that already exist in the schema.
4. **Compliance Center** — a calendar view over manually-entered deadlines to start
   (990, state filings, SAM.gov), automated reminders via email.
5. **Curated foundation/corporate grants dataset** — even 30–50 well-chosen local
   and regional funders, manually researched, meaningfully improves match quality
   for your first customers.

## A note on go-to-market

Software readiness isn't the constraint on hitting the revenue targets discussed
earlier — customer acquisition is. Before investing further engineering time, it's
worth validating with a small number of real nonprofit executive directors (10–20
conversations) that this pricing and feature set is something they'd actually pay
for, ideally landing a handful of paying pilot customers on the Foundation tier
before building out the Managed-tier human-service components, which are the
most operationally expensive part of the business to deliver.
