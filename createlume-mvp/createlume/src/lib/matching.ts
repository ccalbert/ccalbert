/**
 * GrantMatch scoring engine.
 *
 * Deliberately simple and explainable (keyword/tag overlap + geography
 * string matching) rather than a black-box model. Nonprofit EDs are shown
 * *why* something scored the way it did, which is the actual product promise
 * ("Mission Fit: 94%") — a score no one can explain isn't trustworthy, so
 * this should stay inspectable even as it gets more sophisticated.
 */

export interface OrgProfileForMatching {
  programAreas: string[]; // e.g. ["housing", "youth development"]
  city?: string | null;
  state?: string | null;
}

export interface OpportunityForMatching {
  title: string;
  description?: string | null;
  eligibilityText?: string | null;
  geographyScope?: string | null;
  programTags: string[];
  minAward?: number | null;
  maxAward?: number | null;
}

export interface MatchResult {
  missionFitScore: number;
  programFitScore: number;
  geographyFitScore: number;
  overallFitScore: number;
  eligibilityPass: boolean;
  recommendation: "STRONGLY_RECOMMENDED" | "RECOMMENDED" | "POSSIBLE" | "NOT_RECOMMENDED";
  reasons: string[];
}

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function overlapScore(orgTags: string[], oppTags: string[]): number {
  if (orgTags.length === 0 || oppTags.length === 0) return 40; // neutral default, not zero
  const orgSet = new Set(orgTags.map(normalize));
  const oppSet = oppTags.map(normalize);
  const matches = oppSet.filter((t) => orgSet.has(t)).length;
  const ratio = matches / Math.max(orgSet.size, oppSet.length);
  return Math.round(30 + ratio * 70); // floor of 30 so partial text overlap isn't a hard zero
}

function geographyScore(org: OrgProfileForMatching, scope?: string | null): number {
  if (!scope) return 60;
  const s = normalize(scope);
  if (s.includes("national") || s.includes("nationwide") || s.includes("all states")) return 100;
  if (org.state && s.includes(normalize(org.state))) return 100;
  if (org.city && s.includes(normalize(org.city))) return 100;
  return 35;
}

export function scoreMatch(
  org: OrgProfileForMatching,
  opp: OpportunityForMatching
): MatchResult {
  const missionFitScore = overlapScore(org.programAreas, opp.programTags);
  const programFitScore = overlapScore(org.programAreas, opp.programTags);
  const geographyFitScore = geographyScore(org, opp.geographyScope);

  const overallFitScore = Math.round(
    missionFitScore * 0.4 + programFitScore * 0.35 + geographyFitScore * 0.25
  );

  // Conservative default: without a parsed eligibility rules engine, flag
  // low-geography-fit opportunities for human review rather than asserting PASS.
  const eligibilityPass = geographyFitScore >= 60;

  let recommendation: MatchResult["recommendation"];
  if (overallFitScore >= 90 && eligibilityPass) recommendation = "STRONGLY_RECOMMENDED";
  else if (overallFitScore >= 75 && eligibilityPass) recommendation = "RECOMMENDED";
  else if (overallFitScore >= 55) recommendation = "POSSIBLE";
  else recommendation = "NOT_RECOMMENDED";

  const reasons: string[] = [];
  reasons.push(`Program tag overlap drove a ${programFitScore}% program fit.`);
  reasons.push(
    geographyFitScore >= 90
      ? "Opportunity is open nationally or explicitly matches your location."
      : geographyFitScore >= 60
      ? "Geographic scope is broad enough to likely include you — verify before applying."
      : "Geographic scope doesn't clearly include your location — confirm eligibility before investing time."
  );

  return {
    missionFitScore,
    programFitScore,
    geographyFitScore,
    overallFitScore,
    eligibilityPass,
    recommendation,
    reasons,
  };
}
