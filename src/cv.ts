import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fetchProfile } from "./github.js";
import { summarizeTimeline } from "./llm.js";
import {
  renderActivityMarkdown,
  renderActivitySummaryMarkdown,
  renderCharts,
  renderTimelineMarkdown,
} from "./render.js";
import { renderCVPdf } from "./pdf.js";

const login = process.env.USERNAME || process.env.GITHUB_USER;
if (!login) throw new Error("USERNAME env var is required");

console.log(`fetching profile data for ${login}…`);
const profile = await fetchProfile(login, 20, 730);
console.log(`fetched ${profile.repos.length} repos`);

console.log("calling LLM to summarise timeline…");
const timeline = await summarizeTimeline(profile);
console.log(`got ${timeline.periods.length} periods`);

const fullMd = renderActivityMarkdown(timeline, profile.login);
const summaryMd = renderActivitySummaryMarkdown(timeline);
const timelineMd = renderTimelineMarkdown(timeline, profile.login);

await mkdir(resolve("cards"), { recursive: true });
await writeFile(resolve("cards/cv.json"), JSON.stringify(timeline, null, 2), "utf8");
await writeFile(resolve("CV.md"), fullMd, "utf8");
await writeFile(resolve("cards/charts.svg"), renderCharts(profile), "utf8");
console.log("wrote cards/cv.json, CV.md, cards/charts.svg");

await renderCVPdf(profile, timeline, resolve("cards/cv.pdf"));
console.log("wrote cards/cv.pdf");

// Inject summary + timeline into README between markers, if present.
const readmePath = resolve("README.md");
try {
  let readme = await readFile(readmePath, "utf8");
  readme = injectBetween(readme, "ACTIVITY-SUMMARY", summaryMd.trim());
  readme = injectBetween(readme, "ACTIVITY-TIMELINE", timelineMd.trim());
  await writeFile(readmePath, readme, "utf8");
  console.log("Updated README between activity markers");
} catch {
  // No README — skip silently.
}

function injectBetween(source: string, name: string, body: string): string {
  const start = `<!-- ${name}-START -->`;
  const end = `<!-- ${name}-END -->`;
  if (!source.includes(start) || !source.includes(end)) return source;
  const escapedStart = start.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedEnd = end.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return source.replace(
    new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}`),
    `${start}\n${body}\n${end}`,
  );
}
