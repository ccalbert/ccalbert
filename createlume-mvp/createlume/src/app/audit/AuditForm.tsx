"use client";

import { useState } from "react";
import Link from "next/link";

interface MatchRow {
  title: string;
  funder: string;
  deadline: string | null;
  overallFitScore: number;
  recommendation: string;
}

export default function AuditForm() {
  const [form, setForm] = useState({
    contactEmail: "",
    orgName: "",
    ein: "",
    mission: "",
    city: "",
    state: "",
    programAreasRaw: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<MatchRow[] | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactEmail: form.contactEmail,
          orgName: form.orgName,
          ein: form.ein || undefined,
          mission: form.mission,
          city: form.city || undefined,
          state: form.state || undefined,
          programAreas: form.programAreasRaw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.formErrors?.join(", ") ?? "Something went wrong");
      setResults(data.matches);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  if (status === "done" && results) {
    return (
      <div>
        <p className="text-sm text-ink/70">
          We found <strong>{results.length}</strong> federal opportunities to review.
          Here are your top matches:
        </p>
        <ul className="mt-6 space-y-4">
          {results.slice(0, 8).map((r) => (
            <li key={r.title} className="rounded-md border border-ink/10 bg-white/50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-ink/50">{r.funder}</p>
                  {r.deadline && (
                    <p className="mt-1 text-xs text-ink/50">Closes {new Date(r.deadline).toLocaleDateString()}</p>
                  )}
                </div>
                <span className="whitespace-nowrap rounded-sm bg-moss/10 px-2 py-1 font-mono text-xs text-moss">
                  {r.overallFitScore}% fit
                </span>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-8 rounded-md border border-moss bg-white/70 p-6">
          <p className="font-serif text-lg">Want help pursuing these?</p>
          <p className="mt-2 text-sm text-ink/70">
            Createlume can prepare first drafts of applications, track every deadline, and
            manage the compliance work that goes with each award.
          </p>
          <Link
            href="/pricing"
            className="mt-4 inline-block rounded-sm bg-moss px-5 py-2 text-sm text-paper hover:bg-ink"
          >
            See plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Organization name" required>
          <input required className={inputClass} value={form.orgName}
            onChange={(e) => setForm({ ...form, orgName: e.target.value })} />
        </Field>
        <Field label="Work email" required>
          <input required type="email" className={inputClass} value={form.contactEmail}
            onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
        </Field>
        <Field label="EIN (optional)">
          <input className={inputClass} value={form.ein}
            onChange={(e) => setForm({ ...form, ein: e.target.value })} />
        </Field>
        <Field label="State">
          <input className={inputClass} placeholder="e.g. IL" value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })} />
        </Field>
        <Field label="City">
          <input className={inputClass} value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </Field>
        <Field label="Program areas" required>
          <input required className={inputClass} placeholder="housing, youth, food security"
            value={form.programAreasRaw}
            onChange={(e) => setForm({ ...form, programAreasRaw: e.target.value })} />
        </Field>
      </div>
      <Field label="Mission" required>
        <textarea required rows={3} className={inputClass} value={form.mission}
          onChange={(e) => setForm({ ...form, mission: e.target.value })} />
      </Field>

      {error && <p className="text-sm text-rust">{error}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-sm bg-moss px-6 py-3 text-sm text-paper hover:bg-ink disabled:opacity-50"
      >
        {status === "loading" ? "Searching live grant listings…" : "Run my Funding Audit"}
      </button>
    </form>
  );
}

const inputClass = "w-full rounded-sm border border-ink/20 bg-white px-3 py-2 text-sm";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="text-ink/70">
        {label}
        {required && <span className="text-rust"> *</span>}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
