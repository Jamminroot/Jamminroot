import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fetchProfile } from "./github.js";
import { renderCharts } from "./render.js";

const login = process.env.USERNAME || process.env.GITHUB_USER;
if (!login) throw new Error("USERNAME env var is required");

const profile = await fetchProfile(login);
await mkdir(resolve("cards"), { recursive: true });
const svg = renderCharts(profile);
await writeFile(resolve("cards/charts.svg"), svg, "utf8");
console.log(`wrote cards/charts.svg (${svg.length} bytes)`);
