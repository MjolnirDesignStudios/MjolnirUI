// POST /api/asgardians/jobs/screen
// Firecrawl-searches job listings for an associate's credentials, then has
// Claude rank the top 10 with fit scores against the requested filters.
import { NextRequest, NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { requireWrite } from "@/lib/asgardians/auth";
import { asgardiansModel } from "@/lib/asgardians/ai";
import { supabaseAdmin } from "@/lib/asgardians/db";
import { jobMatchSchema } from "@/lib/asgardians/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 180;

type Filters = {
  query?: string;
  location?: string;
  radiusMiles?: number;
  remote?: boolean;
  minSalary?: number;
};

export async function POST(request: NextRequest) {
  const guard = await requireWrite();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "FIRECRAWL_API_KEY is not configured. Add it to .env.local to enable job screening." },
      { status: 503 },
    );
  }

  let body: { associateId?: string; filters?: Filters };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body.associateId) {
    return NextResponse.json({ error: "associateId is required" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data: associate, error: assocError } = await db
    .from("asgardians_associates")
    .select("id, full_name, location, credentials, asgardians_resumes(extracted, enhanced)")
    .eq("id", body.associateId)
    .single();
  if (assocError || !associate) {
    return NextResponse.json({ error: "associate not found" }, { status: 404 });
  }

  const filters = body.filters ?? {};
  const credentials = associate.credentials as { targetRoles?: string[]; skills?: string[] };
  const roleQuery =
    filters.query ?? credentials.targetRoles?.slice(0, 2).join(" OR ") ?? "administrative roles";
  const locationPart = filters.remote
    ? "remote"
    : (filters.location ?? associate.location ?? "");
  const searchQuery = `${roleQuery} jobs hiring now ${locationPart}`.trim();

  const searchResponse = await fetch("https://api.firecrawl.dev/v2/search", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: searchQuery, limit: 20 }),
  });
  if (!searchResponse.ok) {
    const detail = await searchResponse.text();
    return NextResponse.json(
      { error: `Firecrawl search failed (${searchResponse.status}): ${detail.slice(0, 300)}` },
      { status: 502 },
    );
  }
  const searchData = await searchResponse.json();
  const results: Array<{ title?: string; url?: string; description?: string }> =
    searchData?.data?.web ?? searchData?.data ?? [];
  if (!results.length) {
    return NextResponse.json({ matches: [], note: "No job listings found for this search." });
  }

  const resumes = associate.asgardians_resumes as Array<{ extracted?: unknown; enhanced?: unknown }>;
  const latestResume = resumes?.[resumes.length - 1];

  const { output } = await generateText({
    model: asgardiansModel(),
    output: Output.object({ schema: jobMatchSchema }),
    messages: [
      {
        role: "system",
        content: [
          "You are the job-screening engine for Mjolnir Design Studios' Asgardians HR system.",
          "From the raw job-search results, select and rank the TOP 10 roles for this candidate.",
          "Score 0-100 on credential fit and apply the hard filters: exclude roles that clearly",
          "violate remote/location/salary requirements. Only include real job listings (skip",
          "articles, aggregator landing pages without a specific role, and duplicates).",
        ].join(" "),
      },
      {
        role: "user",
        content: [
          `CANDIDATE CREDENTIALS:\n${JSON.stringify(latestResume?.enhanced ?? latestResume?.extracted ?? credentials)}`,
          `FILTERS:\n${JSON.stringify(filters)}`,
          `SEARCH RESULTS:\n${JSON.stringify(results)}`,
        ].join("\n\n"),
      },
    ],
  });

  const rows = output.matches.map((m) => ({
    associate_id: associate.id,
    title: m.title,
    company: m.company ?? null,
    url: m.url ?? null,
    location: m.location ?? null,
    salary_range: m.salaryRange ?? null,
    remote: m.remote ?? null,
    score: Math.round(m.score),
    rationale: m.rationale,
    filters,
  }));
  if (rows.length) {
    await db.from("asgardians_job_matches").delete().eq("associate_id", associate.id);
    await db.from("asgardians_job_matches").insert(rows);
  }

  return NextResponse.json({ matches: output.matches });
}
