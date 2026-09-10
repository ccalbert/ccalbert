-- Createlume database setup — paste this entire file into Neon's SQL Editor
-- and click "Run" once. This creates every table the app needs.
-- (This is the SQL equivalent of prisma/schema.prisma, for people who'd
-- rather not run terminal commands.)

CREATE TYPE "PlanTier" AS ENUM ('FOUNDATION', 'GROWTH', 'MANAGED');
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'INCOMPLETE');
CREATE TYPE "ApplicationStatus" AS ENUM ('RESEARCH', 'DRAFTING', 'IN_REVIEW', 'SUBMITTED', 'AWARDED', 'DECLINED');

CREATE TABLE "Organization" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "ein" TEXT,
  "mission" TEXT,
  "website" TEXT,
  "city" TEXT,
  "state" TEXT,
  "annualRevenueBand" TEXT,
  "populationServed" TEXT,
  "programAreas" TEXT[] NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT,
  "role" TEXT NOT NULL DEFAULT 'ADMIN',
  "organizationId" TEXT NOT NULL REFERENCES "Organization"("id"),
  "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "Subscription" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL UNIQUE REFERENCES "Organization"("id"),
  "plan" "PlanTier" NOT NULL,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'INCOMPLETE',
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT UNIQUE,
  "currentPeriodEnd" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "FundingAudit" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT REFERENCES "Organization"("id"),
  "contactEmail" TEXT NOT NULL,
  "orgName" TEXT NOT NULL,
  "ein" TEXT,
  "mission" TEXT NOT NULL,
  "city" TEXT,
  "state" TEXT,
  "programAreas" TEXT[] NOT NULL DEFAULT '{}',
  "resultsJson" JSONB,
  "estimatedTotal" INTEGER,
  "matchCount" INTEGER,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "GrantOpportunity" (
  "id" TEXT PRIMARY KEY,
  "source" TEXT NOT NULL,
  "externalId" TEXT UNIQUE,
  "title" TEXT NOT NULL,
  "funder" TEXT NOT NULL,
  "description" TEXT,
  "eligibilityText" TEXT,
  "geographyScope" TEXT,
  "programTags" TEXT[] NOT NULL DEFAULT '{}',
  "minAward" INTEGER,
  "maxAward" INTEGER,
  "deadline" TIMESTAMP,
  "applyUrl" TEXT,
  "postedAt" TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "GrantMatch" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL REFERENCES "Organization"("id"),
  "opportunityId" TEXT NOT NULL REFERENCES "GrantOpportunity"("id"),
  "missionFitScore" INTEGER NOT NULL,
  "programFitScore" INTEGER NOT NULL,
  "geographyFitScore" INTEGER NOT NULL,
  "overallFitScore" INTEGER NOT NULL,
  "eligibilityPass" BOOLEAN NOT NULL,
  "recommendation" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE ("organizationId", "opportunityId")
);

CREATE TABLE "GrantApplication" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL REFERENCES "Organization"("id"),
  "opportunityId" TEXT NOT NULL REFERENCES "GrantOpportunity"("id"),
  "status" "ApplicationStatus" NOT NULL DEFAULT 'RESEARCH',
  "narrativeDraft" TEXT,
  "budgetDraft" JSONB,
  "assignedTo" TEXT,
  "dueDate" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
