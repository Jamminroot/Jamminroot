import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fetchProfile } from "./github.js";
import { loadDescriptions } from "./descriptions.js";
import { renderCharts, renderProjectsCards, TimelineSchema, type Timeline } from "./render.js";

const login = process.env.USERNAME || process.env.GITHUB_USER;
if (!login) throw new Error("USERNAME env var is required");

const profile = await fetchProfile(login);
await mkdir(resolve("cards"), { recursive: true });
const charts = renderCharts(profile);
await writeFile(resolve("cards/charts.svg"), charts, "utf8");
console.log(`wrote cards/charts.svg (${charts.length} bytes)`);

// Re-render projects.svg if cv.json exists — keeps the pulse / weekly stats fresh
// daily without calling the LLM.
let timeline: Timeline | null = null;
try {
  const raw = await readFile(resolve("cards/cv.json"), "utf8");
  timeline = TimelineSchema.parse(JSON.parse(raw));
} catch {
  // ignore — no timeline yet
}
if (timeline) {
  const descriptions = await loadDescriptions();
  const projects = renderProjectsCards(profile, timeline, descriptions);
  await writeFile(resolve("cards/projects.svg"), projects, "utf8");
  console.log(`wrote cards/projects.svg (${projects.length} bytes)`);
}
