import Link from "next/link";
import AuditForm from "./AuditForm";

export default function AuditPage() {
  return (
    <main className="min-h-screen bg-paper px-6 py-16 text-ink">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm text-ink/60 hover:text-moss">← Createlume</Link>
        <h1 className="mt-4 font-serif text-3xl">Free Funding Audit</h1>
        <p className="mt-3 text-ink/70">
          Tell us about your organization. We&apos;ll search live federal grant listings and
          score them against your mission — free, no account required.
        </p>
        <div className="mt-10">
          <AuditForm />
        </div>
      </div>
    </main>
  );
}
