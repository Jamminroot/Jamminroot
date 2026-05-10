import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fetchProfile } from "./github.js";
import { summarizeTimeline } from "./llm.js";
import { renderActivityMarkdown, renderCharts, renderTimeline } from "./render.js";

const login = process.env.USERNAME || process.env.GITHUB_USER;
if (!login) throw new Error("USERNAME env var is required");

console.log(`fetching profile data for ${login}…`);
const profile = await fetchProfile(login, 20, 730);
console.log(`fetched ${profile.repos.length} repos`);

console.log("calling LLM to summarise timeline…");
const timeline = await summarizeTimeline(profile);
console.log(`got ${timeline.periods.length} periods`);

const activityMd = renderActivityMarkdown(timeline);

await mkdir(resolve("cards"), { recursive: true });
await writeFile(resolve("cards/cv.json"), JSON.stringify(timeline, null, 2), "utf8");
await writeFile(resolve("CV.md"), activityMd, "utf8");
await writeFile(resolve("cards/charts.svg"), renderCharts(profile), "utf8");
await writeFile(resolve("cards/timeline.svg"), renderTimeline(timeline, profile.login), "utf8");
console.log("wrote cards/cv.json, CV.md, cards/charts.svg, cards/timeline.svg");

// Inject activity markdown into README between markers, if present.
const readmePath = resolve("README.md");
try {
  const readme = await readFile(readmePath, "utf8");
  const startMarker = "<!-- ACTIVITY-START -->";
  const endMarker = "<!-- ACTIVITY-END -->";
  if (readme.includes(startMarker) && readme.includes(endMarker)) {
    const escapedStart = startMarker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedEnd = endMarker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const updated = readme.replace(
      new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}`),
      `${startMarker}\n${activityMd.trim()}\n${endMarker}`,
    );
    if (updated !== readme) {
      await writeFile(readmePath, updated, "utf8");
      console.log("Updated README between activity markers");
    }
  }
} catch {
  // No README — skip silently.
}
