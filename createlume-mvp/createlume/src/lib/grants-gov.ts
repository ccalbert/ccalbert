/**
 * Client for the Grants.gov Search2 API — a free, public, unauthenticated
 * REST API for actively posted U.S. federal grant opportunities.
 * Docs: https://www.grants.gov/api/basic-search
 *
 * This is the "real data, no cost" source referenced in the build plan.
 * Foundation, corporate, and local grants aren't covered by any free public
 * API and should live in GrantOpportunity rows with source = "CURATED",
 * maintained manually or via a licensed data provider (e.g. Instrumentl,
 * Candid/Foundation Directory) once revenue supports it.
 */

const GRANTS_GOV_SEARCH_URL = "https://api.grants.gov/v1/api/search2";

export interface GrantsGovOpportunity {
  id: string;
  number: string;
  title: string;
  agencyName: string;
  openDate?: string;
  closeDate?: string;
  oppStatus: string;
  docType?: string;
  cfdaList?: string[];
}

interface GrantsGovSearchResponse {
  errorcode: number;
  msg: string;
  data?: {
    hitCount: number;
    oppHits: GrantsGovOpportunity[];
  };
}

/**
 * Search live federal opportunities by free-text keyword(s).
 * Keep queries short — this mirrors what the matching engine will feed it
 * (a nonprofit's program-area tags, e.g. "housing", "youth", "food security").
 */
export async function searchFederalGrants(params: {
  keyword: string;
  rows?: number;
}): Promise<GrantsGovOpportunity[]> {
  const res = await fetch(GRANTS_GOV_SEARCH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      keyword: params.keyword,
      oppStatuses: "forecasted|posted",
      rows: params.rows ?? 25,
    }),
    // Grants.gov data changes daily at most — cache for an hour server-side.
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Grants.gov search failed: ${res.status} ${res.statusText}`);
  }

  const json: GrantsGovSearchResponse = await res.json();
  if (json.errorcode !== 0 || !json.data) {
    throw new Error(`Grants.gov error: ${json.msg}`);
  }

  return json.data.oppHits;
}
