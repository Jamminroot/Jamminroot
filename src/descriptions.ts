// Evergreen project descriptions: cached JSON file at repo root, auto-extended via LLM
// only for repos missing an entry. Edit manually anytime.
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import type { ProfileData, RepoData } from "./github.js";

const CACHE_PATH = resolve("project-descriptions.json");

const apiKey = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.LLM_MODEL || "deepseek/deepseek-v4-pro";
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

export type DescriptionCache = Record<string, string>;

const SYSTEM =
  process.env.LLM_PROJECT_GUIDANCE?.trim() ||
  `You write short, evergreen one-sentence descriptions for software projects.

Rules:
- Describe WHAT THE PROJECT IS, not what was changed recently.
- One sentence, plain prose, max 18 words.
- No marketing language, no "powerful", no "modern".
- Use the repo name + language + GitHub description + commit samples as context, but do not invent features.
- If signal is thin, write a generic but accurate description (e.g. "Personal C++ experiment.").

Output a single JSON object mapping nameWithOwner -> description. No markdown fences, no commentary.`;

export async function loadDescriptions(): Promise<DescriptionCache> {
  try {
    const raw = await readFile(CACHE_PATH, "utf8");
    return z.record(z.string(), z.string()).parse(JSON.parse(raw));
  } catch {
    return {};
  }
}

export async function saveDescriptions(cache: DescriptionCache): Promise<void> {
  // Keep keys sorted so the diff is stable.
  const sorted: DescriptionCache = {};
  for (const k of Object.keys(cache).sort()) sorted[k] = cache[k];
  await writeFile(CACHE_PATH, JSON.stringify(sorted, null, 2) + "\n", "utf8");
}

function formatRepoForPrompt(r: RepoData): string {
  const lines: string[] = [];
  const lang = r.language?.name ?? "—";
  lines.push(`### ${r.nameWithOwner} (${lang})`);
  if (r.description) lines.push(`GitHub description: ${r.description}`);
  if (r.recentCommits.length > 0) {
    const sample = r.recentCommits
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10);
    lines.push("Recent commit headlines:");
    for (const c of sample) lines.push(`- ${c.headline}`);
  }
  return lines.join("\n");
}

export async function fillMissingDescriptions(
  p: ProfileData,
  cache: DescriptionCache,
): Promise<DescriptionCache> {
  const candidates = p.repos.filter((r) => !r.hidden && !cache[r.nameWithOwner]);
  if (candidates.length === 0) return cache;
  if (!apiKey) {
    console.warn(
      `descriptions: ${candidates.length} repos missing entries but OPENROUTER_API_KEY not set — leaving them blank`,
    );
    return cache;
  }
  console.log(`describing ${candidates.length} new project(s) via LLM…`);
  const payload = ["Generate descriptions for these repositories:", "", ...candidates.map(formatRepoForPrompt)].join(
    "\n\n",
  );

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://github.com/Jamminroot/Jamminroot",
      "X-Title": "Jamminroot Profile Cards",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: payload },
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000,
      temperature: 0.2,
    }),
  });
  if (!response.ok) {
    console.warn(`describeProjects: OpenRouter ${response.status}, leaving cache unchanged`);
    return cache;
  }
  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string };
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    console.warn("describeProjects: empty response, leaving cache unchanged");
    return cache;
  }
  const fenced = content.match(/```(?:json)?\s*([\s\S]+?)```/);
  const raw = fenced ? fenced[1].trim() : content.trim();
  let parsed: Record<string, string>;
  try {
    parsed = z.record(z.string(), z.string()).parse(JSON.parse(raw));
  } catch (e) {
    console.warn(`describeProjects: parse failed: ${e}`);
    return cache;
  }
  const merged = { ...cache };
  for (const r of candidates) {
    const value = parsed[r.nameWithOwner];
    if (value) merged[r.nameWithOwner] = value;
  }
  return merged;
}
