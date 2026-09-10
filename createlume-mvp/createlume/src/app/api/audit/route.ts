import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { searchFederalGrants } from "@/lib/grants-gov";
import { scoreMatch } from "@/lib/matching";

const AuditRequestSchema = z.object({
  contactEmail: z.string().email(),
  orgName: z.string().min(2),
  ein: z.string().optional(),
  mission: z.string().min(10),
  city: z.string().optional(),
  state: z.string().optional(),
  programAreas: z.array(z.string()).min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = AuditRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  // Pull real federal opportunities for each program area and score them.
  const allHits = await Promise.all(
    input.programAreas.map((area) =>
      searchFederalGrants({ keyword: area, rows: 10 }).catch(() => [])
    )
  );

  const flatHits = allHits.flat();
  const seen = new Set<string>();
  const scored = flatHits
    .filter((hit) => {
      if (seen.has(hit.id)) return false;
      seen.add(hit.id);
      return true;
    })
    .map((hit) => {
      const result = scoreMatch(
        { programAreas: input.programAreas, city: input.city, state: input.state },
        {
          title: hit.title,
          geographyScope: "National", // Grants.gov federal opportunities are generally nationally open
          programTags: input.programAreas, // keyword search already filtered on these
        }
      );
      return {
        externalId: hit.id,
        title: hit.title,
        funder: hit.agencyName,
        deadline: hit.closeDate ?? null,
        ...result,
      };
    })
    .sort((a, b) => b.overallFitScore - a.overallFitScore)
    .slice(0, 20);

  const matchCount = scored.filter((s) => s.recommendation !== "NOT_RECOMMENDED").length;

  const audit = await prisma.fundingAudit.create({
    data: {
      contactEmail: input.contactEmail,
      orgName: input.orgName,
      ein: input.ein,
      mission: input.mission,
      city: input.city,
      state: input.state,
      programAreas: input.programAreas,
      resultsJson: scored,
      matchCount,
      // Real award amounts require per-opportunity award data, which Grants.gov's
      // search endpoint doesn't return — left null until the detail endpoint is wired in
      // rather than showing an invented dollar figure.
      estimatedTotal: null,
    },
  });

  return NextResponse.json({
    auditId: audit.id,
    matchCount,
    matches: scored,
  });
}
