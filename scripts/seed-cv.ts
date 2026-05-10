import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { renderActivityMarkdown, type Timeline } from "../src/render.js";

// Hand-crafted timeline used as a fallback / first iteration.
// The LLM workflow regenerates this in the same shape.
//
// Format rules: high-level only, project domain, no implementation details.
// Period order: 3-6 most recent months (newest first), then last two years.
const timeline: Timeline = {
  generatedAt: new Date().toISOString().slice(0, 10),
  summary:
    "Active across personal Windows productivity tooling, Telegram automation for n8n, and a new Android LLM chat assistant. Long-running themes: developer tooling, side projects, and personal infrastructure.",
  periods: [
    {
      period: "2026 May",
      items: [
        {
          title: "Custom GitHub profile cards generator",
          repo: "Jamminroot/Jamminroot",
          description: "Built a profile-card generator for the GitHub README, replacing a third-party action.",
        },
      ],
    },
    {
      period: "2026 Apr",
      items: [
        {
          title: "Mihomo proxy fork upkeep",
          repo: "Jamminroot/Clash.Meta",
          description: "Maintained the Mihomo fork used by FlClash.",
        },
      ],
    },
    {
      period: "2026 Mar",
      items: [
        {
          title: "Ozwil Android chat assistant",
          repo: "Jamminroot/ozwil-api",
          description: "Started a new Android app paired with an ASP.NET Core backend for an LLM chat assistant.",
        },
      ],
    },
    {
      period: "2026 Feb",
      items: [
        {
          title: "Telegram-automation node release",
          repo: "Jamminroot/n8n-nodes-telepilot-2",
          description: "Iterated on the Telegram automation node for n8n.",
        },
        {
          title: "Windows Explorer file-tagging utility",
          repo: "Jamminroot/intag",
          description: "Polished the file-tagging utility through to a Microsoft Store release.",
        },
        {
          title: "Quick image-labeling utility",
          repo: "Jamminroot/yolo-labeler",
          description: "Built a small on-host image labeling tool for personal projects.",
        },
        {
          title: "Personal Neovim setup",
          repo: "Jamminroot/.dotfiles",
          description: "Stood up a personal IDE configuration.",
        },
      ],
    },
    {
      period: "2026 Jan",
      items: [
        {
          title: "Telegram-automation node stability",
          repo: "Jamminroot/n8n-nodes-telepilot-2",
          description: "Stability work on the Telegram automation node for n8n.",
        },
      ],
    },
    {
      period: "2025",
      items: [
        {
          title: "Telegram automation foundations",
          repo: "Jamminroot/n8n-nodes-telepilot-2",
          description: "Bootstrapped the Telegram-via-n8n integration as a maintained fork.",
        },
        {
          title: "Windows file-tagging utility",
          repo: "Jamminroot/intag",
          description: "Continued development of the Windows file-tagging utility.",
        },
      ],
    },
    {
      period: "2024",
      items: [
        {
          title: "Personal projects and exploration",
          description: "General exploration and incremental work across personal repositories.",
        },
      ],
    },
  ],
};

await mkdir(resolve("cards"), { recursive: true });
await writeFile(resolve("cards/cv.json"), JSON.stringify(timeline, null, 2), "utf8");
await writeFile(resolve("CV.md"), renderActivityMarkdown(timeline), "utf8");
console.log("seeded cards/cv.json + CV.md");
console.log("now run `npm run cards` to render cards/profile.svg");
