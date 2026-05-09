import type { ProfileData } from "./github.js";
import { TimelineSchema, type Timeline } from "./render.js";

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) throw new Error("OPENROUTER_API_KEY is required");

const MODEL = process.env.LLM_MODEL || "deepseek/deepseek-v4-pro";
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM = `You produce a CV-style activity timeline for a software engineer based on their public GitHub commits and repository descriptions. Your output is consumed by a templated SVG renderer, so adherence to the schema and to the rules below is critical.

# Period structure (strict)

The user's payload includes "today's date" — use it to derive the period labels. NEVER produce older calendar months as standalone period entries.

1. ONLY the 3-6 most recent calendar months relative to today's date, as individual periods labelled "YYYY MMM". For today = 2026 May, valid month labels are exactly: "2026 May", "2026 Apr", "2026 Mar", "2026 Feb", "2026 Jan", "2025 Dec". Anything older folds into the year, never into a month entry like "2025 Sep".
2. After the recent months, the previous TWO full years as additional period entries, labelled just "YYYY" (e.g., "2025", "2024"). Activity from any month not in (1) belongs to its corresponding year.

Skip a month or year entirely if there is no meaningful commit activity for it. Months always come before years in the output. Example output sequence for today = 2026 May: ["2026 May", "2026 Apr", "2026 Mar", "2026 Feb", "2025", "2024"].

# Coverage rule (strict)

Repos in the user's payload are sorted by importance, with a "weight" shown for each. You MUST cover the top 10 most-weighted repos that have commits in the window. Skipping a high-weight repo because it has no description, no recognisable theme, or uninformative commit messages is FORBIDDEN. For such repos, write a generic project-level description from the repo name + language alone (e.g., "Worked on the personal C++ project named MEMU3" — acceptable). Repos with weight 0 are NOT in the payload (already excluded).

# Detail level (strict — HIGH-LEVEL ONLY, no implementation details)

Each item describes WHAT THE USER WORKED ON at a project / domain level. The reader of this CV should learn the *areas* the engineer touched, not the technical changes.

DO include:
- Project domain or theme ("Telegram automation tooling", "Windows Explorer file-tagging utility", "Android chat assistant", "personal Neovim setup")
- Repo nameWithOwner in the \`repo\` field
- General activity verb ("built", "iterated on", "polished", "started", "maintained")

DO NOT include:
- Specific feature names, function names, file names, library names, version numbers
- Commit-level changes ("added X", "fixed Y bug", "refactored Z")
- CI/build/dependency details ("upgraded n8n 1.89 → 2.8.3", "moved session storage", "fixed CSRF middleware")
- "How" — just "what (project area)"

Field rules:
- title (3-7 words): noun-phrase naming the project / area
- description (1-2 sentences, max ~25 words): rough sentence about what was being worked on at the project level
- For yearly periods, descriptions can be even more high-level (which projects got attention overall)

# Grouping rules

- Cluster all commits within a calendar month for the same repo into ONE item.
- A second item in the same period for the same repo is allowed ONLY for a clearly distinct workstream (e.g., a fork foundation vs a release push).
- Each period has 1-4 items.

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
  "summary": "string, 2 sentences max, big-picture themes across all periods (high-level only, no specifics)",
  "periods": [
    {
      "period": "string (YYYY MMM for months, YYYY for years)",
      "items": [
        { "title": "string", "repo": "string (optional)", "description": "string" }
      ]
    }
  ]
}`;

function formatPayload(p: ProfileData): string {
  const lines: string[] = [];
  lines.push(`Today's date: ${new Date().toISOString().slice(0, 10)}`);
  lines.push(`User: @${p.login}`);
  lines.push(
    `Last 12 months: ${p.totals.contributions} total contributions, ${p.totals.commits} commits attributed to public repos, across ${p.repos.length} repositories.`,
  );
  lines.push("");
  lines.push("Repositories with recent commits (sorted by importance weight — see Coverage rule):");
  lines.push("");

  const reposWithCommits = p.repos.filter((r) => r.recentCommits.length > 0);
  for (const repo of reposWithCommits) {
    const lang = repo.language?.name ?? "—";
    lines.push(
      `### ${repo.nameWithOwner} (${lang}) — ${repo.totalCommits} commits, weight ${repo.weight.toFixed(2)}`,
    );
    if (repo.description) lines.push(`Description: ${repo.description}`);
    const sorted = [...repo.recentCommits].sort((a, b) => b.date.localeCompare(a.date));
    const sample = sorted.slice(0, 40);
    lines.push(`Commit messages (most recent first, ${sample.length} of ${repo.recentCommits.length}):`);
    for (const c of sample) {
      lines.push(`- ${c.date.slice(0, 10)}: ${c.headline}`);
    }
    lines.push("");
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
    max_tokens: 4000,
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
    error?: { message?: string };
  };
  if (json.error) throw new Error(`OpenRouter error: ${json.error.message}`);
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error(`OpenRouter returned no content: ${JSON.stringify(json).slice(0, 500)}`);
  const raw = JSON.parse(extractJson(content));
  return TimelineSchema.parse({
    generatedAt: new Date().toISOString().slice(0, 10),
    ...raw,
  });
}
