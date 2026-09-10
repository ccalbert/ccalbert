export default function DashboardPage({
  searchParams,
}: {
  searchParams: { checkout?: string };
}) {
  return (
    <main className="min-h-screen bg-paper px-6 py-16 text-ink">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-serif text-3xl">Welcome to Createlume</h1>
        {searchParams.checkout === "success" && (
          <p className="mt-3 rounded-sm bg-moss/10 px-4 py-3 text-sm text-moss">
            Your subscription is active. A confirmation email is on its way.
          </p>
        )}
        <p className="mt-6 text-ink/70">
          This is a placeholder dashboard. The next build phase is account login (email +
          password, or a magic link), an organization-profile setup flow, and the live
          Grant Workspace pipeline — see the README&apos;s &quot;Next build phase&quot;
          section for the plan.
        </p>
      </div>
    </main>
  );
}
