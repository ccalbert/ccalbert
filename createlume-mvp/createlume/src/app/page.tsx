import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-ink/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="font-serif text-xl font-semibold tracking-tight">Createlume</span>
          <nav className="flex items-center gap-8 text-sm">
            <Link href="/pricing" className="hover:text-moss">Pricing</Link>
            <Link href="/audit" className="hover:text-moss">Free Funding Audit</Link>
            <Link
              href="/pricing"
              className="rounded-sm bg-ink px-4 py-2 text-paper hover:bg-moss"
            >
              Start free audit
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero: the product's own dashboard is the most characteristic thing in its world */}
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <h1 className="font-serif text-4xl leading-tight text-ink sm:text-5xl">
            Run funding, compliance, and fundraising from one place.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/80">
            Createlume is operations software built for nonprofits that can&apos;t yet afford a
            full development department. Find grants you actually qualify for, prepare
            applications, track compliance deadlines, and run donor campaigns — without
            hiring five people.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/audit"
              className="rounded-sm bg-moss px-6 py-3 text-paper hover:bg-ink"
            >
              Get your free Funding Audit
            </Link>
            <Link href="/pricing" className="text-sm underline decoration-ink/30 underline-offset-4 hover:text-moss">
              See plans and pricing
            </Link>
          </div>
          <p className="mt-4 text-xs text-ink/50">
            No credit card required. Takes about three minutes.
          </p>
        </div>

        {/* Mock dashboard panel — this is what a customer actually sees on day one */}
        <div className="rounded-md border border-ink/10 bg-white/60 p-6 shadow-sm">
          <p className="font-mono text-xs uppercase tracking-wide text-ink/50">Funding pipeline</p>
          <div className="mt-3 grid grid-cols-3 gap-4 border-b border-ink/10 pb-6">
            <div>
              <p className="font-serif text-3xl">23</p>
              <p className="text-xs text-ink/60">matched opportunities</p>
            </div>
            <div>
              <p className="font-serif text-3xl">6</p>
              <p className="text-xs text-ink/60">high priority</p>
            </div>
            <div>
              <p className="font-serif text-3xl">3</p>
              <p className="text-xs text-ink/60">applications in progress</p>
            </div>
          </div>
          <ul className="mt-6 space-y-4">
            {[
              { name: "Community Housing Fund", fit: 96, deadline: "Oct 18", amount: "$25K–$75K" },
              { name: "Youth Pathways Initiative", fit: 91, deadline: "Oct 5", amount: "$10K–$40K" },
              { name: "State Reentry Services Grant", fit: 88, deadline: "Nov 1", amount: "$50K–$100K" },
            ].map((g) => (
              <li key={g.name} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{g.name}</p>
                  <p className="text-ink/50">Deadline {g.deadline} · {g.amount}</p>
                </div>
                <span className="rounded-sm bg-moss/10 px-2 py-1 font-mono text-xs text-moss">
                  {g.fit}% fit
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What it replaces */}
      <section className="border-t border-ink/10 bg-paperDim">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-serif text-2xl">Less than the cost of one employee.</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Funding", body: "Grants matched to your mission, scored and ranked, with deadlines tracked automatically." },
              { title: "Applications", body: "First drafts of narratives and budgets, prepared from your organization profile. You review before anything is submitted." },
              { title: "Compliance", body: "990 filings, state registrations, SAM.gov renewal, and grant reporting deadlines in one calendar." },
              { title: "Fundraising", body: "A donation page, donor records, and campaign follow-ups, connected to Stripe." },
            ].map((f) => (
              <div key={f.title}>
                <h3 className="font-serif text-lg text-moss">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="font-serif text-3xl">See what you qualify for.</h2>
        <p className="mx-auto mt-3 max-w-md text-ink/70">
          The Funding Audit searches live federal grant data against your mission and location,
          free, in about three minutes.
        </p>
        <Link
          href="/audit"
          className="mt-8 inline-block rounded-sm bg-ink px-8 py-3 text-paper hover:bg-moss"
        >
          Start your Funding Audit
        </Link>
      </section>

      <footer className="border-t border-ink/10 px-6 py-8 text-center text-xs text-ink/50">
        Createlume is a DBA of Calbert Foundation Co. · {new Date().getFullYear()}
      </footer>
    </main>
  );
}
