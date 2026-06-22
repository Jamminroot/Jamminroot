import type { ProfileData } from "./github.js";
import { TimelineSchema, type Timeline } from "./render.js";

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) throw new Error("OPENROUTER_API_KEY is required");

const MODEL = process.env.LLM_MODEL || "deepseek/deepseek-v4-pro";
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

// Per-place guidance, each overridable via env var so the prose can be retuned without
// a code change. Defaults below are the baked-in instructions.
const SUMMARY_GUIDANCE =
  process.env.LLM_SUMMARY_GUIDANCE?.trim() ||
  `Write a few paragraphs, 3-4 sentences each — what I have actually been doing across the whole window, split into meaningful groups. Convey:
- the KINDS of work (building from scratch, large refactors, infrastructure/CI, debugging campaigns, research/experimentation, UX/polish, ops tooling)
- the problem areas being solved (what was hard or needed doing, at a domain level)
- the technologies and domains involved
Go deep on PRIMARY repos; weave in notable SECONDARY themes briefly. Plain, concrete language — no corporate puffery.`;

const TIMELINE_GUIDANCE =
  process.env.LLM_TIMELINE_GUIDANCE?.trim() ||
  `Each item describes WHAT THE USER WORKED ON and WHAT KIND OF WORK it was — enough that a reader understands the nature and substance of the effort, without commit-level noise.

DO include:
- Project domain or theme ("Telegram automation tooling", "Windows Explorer file-tagging utility")
- The TYPE of work (new feature build, rework/refactor, bugfixing, infra/CI, research, performance, UX) and the problem area it addressed ("reworked the sync layer", "stabilised the build pipeline", "researched model architectures")
- Repo nameWithOwner in the \`repo\` field
- An activity verb ("built", "reworked", "stabilised", "investigated", "polished", "maintained")

DO NOT include:
- Specific function names, file names, library names, version numbers
- Single-commit granularity ("fixed README typo", "bumped version 0.3.2")
- CI/dependency minutiae ("upgraded n8n 1.89 → 2.8.3", "fixed CSRF middleware ordering")
Characterise the work; don't transcribe the commits.

Field rules:
- title (3-7 words): noun-phrase naming the project / area
- description (1-2 sentences, max ~35 words): what was worked on AND what kind of work it was
- For yearly periods, stay higher-level: which projects got attention and the broad thrust of the work.`;

const SYSTEM = `You produce a CV-style activity timeline for a software engineer based on their public GitHub commits and repository descriptions. Your output is consumed by a templated SVG renderer, so adherence to the schema and to the rules below is critical.

# Period structure (strict)

The user's payload includes "today's date" — use it to derive the period labels. NEVER produce older calendar months as standalone period entries.

1. ONLY the 3-6 most recent calendar months relative to today's date, as individual periods labelled "YYYY MMM". For today = 2026 May, valid month labels are exactly: "2026 May", "2026 Apr", "2026 Mar", "2026 Feb", "2026 Jan", "2025 Dec". Anything older folds into the year, never into a month entry like "2025 Sep".
2. After the recent months, the previous TWO full years as additional period entries, labelled just "YYYY" (e.g., "2025", "2024"). Activity from any month not in (1) belongs to its corresponding year.

Skip a month or year entirely if there is no meaningful commit activity for it. Months always come before years in the output. Example output sequence for today = 2026 May: ["2026 May", "2026 Apr", "2026 Mar", "2026 Feb", "2025", "2024"].

# Importance levels (STRICT)

Each repo is tagged with an importance level (PRIMARY / SECONDARY / MINOR) derived from the user's own configuration. This is the emphasis signal — commit volume does NOT override it. A MINOR repo with hundreds of commits is still MINOR.

- PRIMARY: the projects this CV is built around. The \`summary\` field MUST be about these and only these.
- SECONDARY: include as timeline items; may get a brief nod in the summary only if it reads naturally.
- MINOR: cover in timeline items where the Coverage rule requires it, keep descriptions short, and NEVER mention in the summary.

# Coverage rule (STRICT, NON-NEGOTIABLE)

The user payload ends with a "MANDATORY COVERAGE" section listing specific repos. Your output JSON MUST contain at least one item with a matching \`repo\` field for EACH listed repo. Repos with no description, no recognisable theme, or uninformative commit messages STILL must be covered — write a generic project-level description from the repo name + language alone (e.g., "Worked on the personal C++ project named MEMU3" is acceptable). Skipping a mandatory repo is a failure of the task.

Non-mandatory repos may be included or omitted at your discretion based on activity level.

# Timeline item detail

${TIMELINE_GUIDANCE}

# Summary detail

The \`summary\` field is governed by these rules:

${SUMMARY_GUIDANCE}

# Grouping rules

- Cluster all commits within a calendar month for the same repo into ONE item.
- A second item in the same period for the same repo is allowed ONLY for a clearly distinct workstream (e.g., a fork foundation vs a release push).
- Each period has 1-4 items.

# Voice (STRICT — applies everywhere, summary and items)

NEVER write in the third person. Do not refer to "the engineer", "the user", "the developer", or "they". Write either in the first person ("I built…", "I reworked…") or impersonally with no subject ("Built…", "Reworked…"). Pick one and stay consistent across the whole output.

# Grounding rules

- Stay grounded. Use repo nameWithOwner verbatim. Don't invent projects.
- Plain language. No corporate puffery ("delivered impactful results", "enterprise-grade").

# Worked example

Input:
\`\`\`
### myorg/billing-app (TypeScript) — 12 commits
Description: Internal admin dashboard for billing operations.
Commit messages (most recent first):
- 2026-04-15: feat: add OAuth login flow with Auth0
- 2026-04-14: fix: CSRF middleware ordering
- 2026-04-12: feat: cache JWT validation result
- 2026-04-10: chore: bump version 0.3.2
- 2026-04-09: docs: README typo
- 2026-04-08: feat: add /admin/users page with search
- 2026-04-05: refactor: extract auth middleware
\`\`\`

Good output:
\`\`\`json
{
  "period": "2026 Apr",
  "items": [
    {
      "title": "Auth and admin work on billing dashboard",
      "repo": "myorg/billing-app",
      "description": "Iterated on user authentication and the admin section of the internal billing operations dashboard."
    }
  ]
}
\`\`\`

Bad outputs (DO NOT produce these):
- "Added OAuth login with Auth0, JWT validation caching, CSRF middleware fix, /admin/users search page" — too detailed, lists specific changes/libraries
- "Bumped version 0.3.2; fixed README typo" — commit-level granularity
- "Did stuff on billing-app" — too vague (missing project domain)
- "Delivered enterprise-grade authentication infrastructure" — corporate puffery

# Output format

Output a SINGLE JSON object. No markdown fences. No commentary. Schema:

{
  "summary": "string, 3-5 sentences per the Summary detail rules above",
  "periods": [
    {
      "period": "string (YYYY MMM for months, YYYY for years)",
      "items": [
        { "title": "string", "repo": "string (optional)", "description": "string" }
      ]
    }
  ]
}`;

// Band repos by the user's REPO_WEIGHTS multiplier — the editorial signal — rather than
// the volume-mixed weight, so a boosted repo with few commits still reads as PRIMARY and
// a downweighted busy repo can't dominate the summary.
function importanceTag(multiplier: number): "PRIMARY" | "SECONDARY" | "MINOR" {
  if (multiplier > 1) return "PRIMARY";
  if (multiplier < 1) return "MINOR";
  return "SECONDARY";
}

function formatPayload(p: ProfileData): string {
  const lines: string[] = [];
  lines.push(`Today's date: ${new Date().toISOString().slice(0, 10)}`);
  lines.push(`User: @${p.login}`);
  lines.push(
    `Last 12 months: ${p.totals.contributions} total contributions, ${p.totals.commits} commits attributed to public repos, across ${p.repos.length} repositories.`,
  );
  lines.push("");
  lines.push("Repositories with activity in the window (sorted by importance — see Importance levels and Coverage rule):");
  lines.push("");

  for (const repo of p.repos) {
    if (repo.hidden) continue;
    const lang = repo.language?.name ?? "—";
    lines.push(
      `### ${repo.nameWithOwner} (${lang}) — ${repo.totalCommits} commits, importance: ${importanceTag(repo.multiplier)}`,
    );
    if (repo.description) lines.push(`Description: ${repo.description}`);
    if (repo.recentCommits.length > 0) {
      const sorted = [...repo.recentCommits].sort((a, b) => b.date.localeCompare(a.date));
      const sample = sorted.slice(0, 40);
      lines.push(
        `Commit messages (most recent first, ${sample.length} of ${repo.recentCommits.length}):`,
      );
      for (const c of sample) {
        lines.push(`- ${c.date.slice(0, 10)}: ${c.headline}`);
      }
    } else {
      lines.push(
        `Commit details: not accessible (private repo, token lacks contents:read for it). Use the repo name + language to infer a generic project description.`,
      );
    }
    lines.push("");
  }

  // Mandatory coverage section — explicit list the LLM must mention.
  const mandatory = p.repos.filter((r) => !r.hidden).slice(0, 10);
  if (mandatory.length > 0) {
    lines.push("========================================");
    lines.push("MANDATORY COVERAGE — output JSON MUST include at least one item with a matching `repo` field for EACH of these:");
    for (const r of mandatory) {
      lines.push(`- ${r.nameWithOwner} (${r.language?.name ?? "—"}, importance: ${importanceTag(r.multiplier)})`);
    }
    lines.push("If a repo has no description and uninformative or absent commit messages, infer the project type from its name + language and write a brief generic item like 'Worked on the personal C++ project named X.' Do not omit any of these from the output.");
    lines.push("========================================");
  }

  return lines.join("\n");
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]+?)```/);
  if (fenced) return fenced[1].trim();
  return text.trim();
}

export async function summarizeTimeline(p: ProfileData): Promise<Timeline> {
  const payload = formatPayload(p);
  const body = {
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: payload },
    ],
    response_format: { type: "json_object" },
    max_tokens: 16000,
    temperature: 0.3,
  };
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://github.com/Jamminroot/jamminroot_profile_cards",
      "X-Title": "Jamminroot Profile Cards",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`OpenRouter ${response.status}: ${await response.text()}`);
  }
  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
    model?: string;
    error?: { message?: string };
  };
  if (json.error) throw new Error(`OpenRouter error: ${json.error.message}`);
  if (json.model) console.log(`OpenRouter served by model: ${json.model}`);
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error(`OpenRouter returned no content: ${JSON.stringify(json).slice(0, 500)}`);
  const raw = JSON.parse(extractJson(content));
  const result = TimelineSchema.parse({
    generatedAt: new Date().toISOString().slice(0, 10),
    ...raw,
  });
  // Audit: warn if the model skipped any mandatory repos.
  const mentioned = new Set(
    result.periods.flatMap((per) => per.items.map((i) => i.repo).filter((r): r is string => !!r)),
  );
  const mandatory = p.repos.filter((r) => !r.hidden).slice(0, 10);
  const missing = mandatory.filter((r) => !mentioned.has(r.nameWithOwner));
  if (missing.length > 0) {
    console.warn(`WARN: model skipped ${missing.length} of ${mandatory.length} mandatory repos:`);
    for (const r of missing) console.warn(`  - ${r.nameWithOwner} (weight ${r.weight.toFixed(2)})`);
  } else {
    console.log("All mandatory repos covered.");
  }
  return result;
}
