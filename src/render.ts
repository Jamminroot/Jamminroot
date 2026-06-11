import { z } from "zod";
import type { CommitInfo, ContributionDay, ProfileData, RepoData } from "./github.js";

const STYLE = `
  text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif; }
  .bg { fill: #ffffff; }
  .panel { fill: #f6f8fa; }
  .border { stroke: #d0d7de; }
  .fg { fill: #1f2328; }
  .muted { fill: #656d76; }
  .accent { fill: #0969da; }
  .accent2 { fill: #1f883d; }
  .work { fill: #6b21a8; }
  @media (prefers-color-scheme: dark) {
    .bg { fill: #0d1117; }
    .panel { fill: #161b22; }
    .border { stroke: #30363d; }
    .fg { fill: #e6edf3; }
    .muted { fill: #7d8590; }
    .accent { fill: #58a6ff; }
    .accent2 { fill: #3fb950; }
    .work { fill: #a855f7; }
  }
`;

// ---------- Timeline schema (shared between renderer + LLM) ----------

export const TimelineSchema = z.object({
  generatedAt: z.string(),
  summary: z.string(),
  periods: z.array(
    z.object({
      period: z.string(),
      items: z.array(
        z.object({
          title: z.string(),
          repo: z.string().optional(),
          description: z.string(),
        }),
      ),
    }),
  ),
});
export type Timeline = z.infer<typeof TimelineSchema>;

// ---------- Helpers ----------

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function trunc(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function wrapText(text: string, maxChars: number, maxLines = 99): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur.length === 0) {
      cur = w;
      continue;
    }
    if (cur.length + 1 + w.length <= maxChars) {
      cur += " " + w;
    } else {
      lines.push(cur);
      cur = w;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  if (lines.length === maxLines) {
    const used = lines.join(" ").length;
    if (text.length > used) lines[lines.length - 1] = trunc(lines[lines.length - 1], maxChars);
  }
  return lines;
}

function displayRepo(nameWithOwner: string, login: string): string {
  const slash = nameWithOwner.indexOf("/");
  if (slash < 0) return nameWithOwner;
  const owner = nameWithOwner.slice(0, slash);
  return owner.toLowerCase() === login.toLowerCase() ? nameWithOwner.slice(slash + 1) : nameWithOwner;
}

function buildWorkRegex(): RegExp {
  const raw = process.env.WORK_REPO_REGEX?.trim();
  if (!raw) return /hint-|deeplay-io|zaxe-|-zaxe/i;
  try {
    return new RegExp(raw, "i");
  } catch (e) {
    console.warn(`WORK_REPO_REGEX is not valid; using default: ${e}`);
    return /hint-|deeplay-io|zaxe-|-zaxe/i;
  }
}
const WORK_REGEX = buildWorkRegex();
function isWorkRepo(name: string): boolean {
  return WORK_REGEX.test(name);
}

function fallbackColor(name: string): string {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `hsl(${h % 360}, 55%, 50%)`;
}

type Block = { content: string; width: number; height: number };

function sectionTitle(text: string): string {
  return `<text class="muted" x="0" y="14" font-size="11" letter-spacing="0.1em">${esc(text.toUpperCase())}</text>`;
}

const SIDEBAR_W = 280;

// ---------- Project activity heatmap ----------

const NUM_WEEKS = 52;

type ActivityRow = {
  key: string;
  fillAttr: string; // either fill="#hex" or class="work"
  counts: number[];
  fetchedTotal: number; // sum of weekly counts (from per-commit history)
  reportedTotal: number; // sum of repo.totalCommits (covers private repos with no fetched timestamps)
};

function buildActivityRows(p: ProfileData): ActivityRow[] {
  const work: ActivityRow = {
    key: "Work",
    fillAttr: 'class="work"',
    counts: new Array(NUM_WEEKS).fill(0),
    fetchedTotal: 0,
    reportedTotal: 0,
  };
  const personalMap = new Map<string, ActivityRow>();
  const now = Date.now();
  const sinceMs = now - NUM_WEEKS * 7 * 24 * 3600 * 1000;

  for (const r of p.repos) {
    const isWork = isWorkRepo(r.nameWithOwner);
    // Hidden repos contribute only to Work; never to individual rows.
    if (r.hidden && !isWork) continue;
    let row: ActivityRow;
    if (isWork) {
      row = work;
    } else {
      const display = displayRepo(r.nameWithOwner, p.login);
      let existing = personalMap.get(display);
      if (!existing) {
        const color = r.language?.color ?? fallbackColor(r.nameWithOwner);
        existing = {
          key: display,
          fillAttr: `fill="${color}"`,
          counts: new Array(NUM_WEEKS).fill(0),
          fetchedTotal: 0,
          reportedTotal: 0,
        };
        personalMap.set(display, existing);
      }
      row = existing;
    }

    row.reportedTotal += r.totalCommits;
    for (const c of r.recentCommits) {
      const t = new Date(c.date).getTime();
      if (Number.isNaN(t) || t < sinceMs) continue;
      const weeksAgo = Math.floor((now - t) / (7 * 24 * 3600 * 1000));
      const idx = NUM_WEEKS - 1 - weeksAgo;
      if (idx >= 0 && idx < NUM_WEEKS) {
        row.counts[idx]++;
        row.fetchedTotal++;
      }
    }
  }

  // Sort: rows with actual weekly data first (so the heatmap shows real variation),
  // then no-weekly-data rows by reported total. Within each group, by activity desc.
  const personal = [...personalMap.values()].filter((r) => r.reportedTotal > 0);
  personal.sort((a, b) => {
    const aHas = a.fetchedTotal > 0 ? 1 : 0;
    const bHas = b.fetchedTotal > 0 ? 1 : 0;
    if (aHas !== bHas) return bHas - aHas;
    if (aHas) return b.fetchedTotal - a.fetchedTotal;
    return b.reportedTotal - a.reportedTotal;
  });
  const all = work.reportedTotal > 0 ? [work, ...personal] : personal;
  return all.slice(0, 12);
}

function projectHeatmapBlock(p: ProfileData, fullWidth: number): Block {
  const rows = buildActivityRows(p);
  const labelW = 110;
  const cellGap = 1;
  const headerH = 30;
  const footerH = 22;
  const rowH = 22;
  const cellW = (fullWidth - labelW - (NUM_WEEKS - 1) * cellGap) / NUM_WEEKS;
  const cellH = rowH - 6;

  const out: string[] = [sectionTitle("project activity · last 12 months")];

  if (rows.length === 0) {
    out.push(
      `<text class="muted" x="${fullWidth / 2}" y="${headerH + 30}" font-size="11" text-anchor="middle">No commit history available.</text>`,
    );
    return { content: out.join(""), width: fullWidth, height: headerH + 60 };
  }

  rows.forEach((row, i) => {
    const y = headerH + i * rowH;
    const max = Math.max(1, ...row.counts);
    const noWeeklyData = row.fetchedTotal === 0 && row.reportedTotal > 0;
    out.push(
      `<text class="fg" x="0" y="${y + cellH / 2 + 5}" font-size="11">${esc(trunc(row.key, 16))}</text>`,
    );
    if (noWeeklyData) {
      // No per-week data — draw a single faint bar across the row plus a count label.
      out.push(
        `<text class="muted" x="0" y="${y + cellH / 2 + 16}" font-size="8">${row.reportedTotal} commits</text>`,
      );
      const fullW = NUM_WEEKS * cellW + (NUM_WEEKS - 1) * cellGap;
      out.push(
        `<rect ${row.fillAttr} x="${labelW.toFixed(2)}" y="${y}" width="${fullW.toFixed(2)}" height="${cellH}" rx="3" ry="3" opacity="0.18"/>`,
      );
      return;
    }
    // Normal row — paint empty weeks with a faint panel slot so they read as
    // "empty" rather than "missing"; active weeks use the repo color, with
    // minimum opacity bumped so even a single commit clearly stands out.
    row.counts.forEach((count, w) => {
      const x = labelW + w * (cellW + cellGap);
      if (count === 0) {
        out.push(
          `<rect class="panel" x="${x.toFixed(2)}" y="${y}" width="${cellW.toFixed(2)}" height="${cellH}" rx="1.5" ry="1.5"/>`,
        );
        return;
      }
      const opacity = 0.5 + (count / max) * 0.5;
      out.push(
        `<rect ${row.fillAttr} x="${x.toFixed(2)}" y="${y}" width="${cellW.toFixed(2)}" height="${cellH}" rx="1.5" ry="1.5" opacity="${opacity.toFixed(2)}"/>`,
      );
    });
  });

  // Month labels at bottom — show first week of each calendar month.
  const labelsY = headerH + rows.length * rowH + footerH / 2 + 6;
  const now = new Date();
  const monthMarkers: { weekIdx: number; label: string }[] = [];
  let lastMonthShown = -1;
  for (let i = 0; i < NUM_WEEKS; i++) {
    const date = new Date(now.getTime() - (NUM_WEEKS - 1 - i) * 7 * 24 * 3600 * 1000);
    if (date.getUTCMonth() !== lastMonthShown) {
      lastMonthShown = date.getUTCMonth();
      monthMarkers.push({
        weekIdx: i,
        label: date.toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
      });
    }
  }
  const stride = Math.max(1, Math.ceil(monthMarkers.length / 6));
  monthMarkers
    .filter((_, idx) => idx % stride === 0)
    .forEach((m) => {
      const x = labelW + m.weekIdx * (cellW + cellGap) + cellW / 2;
      out.push(
        `<text class="muted" x="${x.toFixed(2)}" y="${labelsY}" font-size="9" text-anchor="middle">${esc(m.label)}</text>`,
      );
    });

  const totalH = headerH + rows.length * rowH + footerH;
  return { content: out.join(""), width: fullWidth, height: totalH };
}

// ---------- Languages block ----------

function aggregateLanguages(
  repos: RepoData[],
): { name: string; color: string; weight: number; commits: number }[] {
  const map = new Map<string, { color: string; weight: number; commits: number }>();
  for (const r of repos) {
    if (!r.language) continue;
    const cur =
      map.get(r.language.name) ?? { color: r.language.color || "#0969da", weight: 0, commits: 0 };
    cur.weight += r.weight;
    cur.commits += r.totalCommits;
    map.set(r.language.name, cur);
  }
  return [...map.entries()]
    .map(([name, v]) => ({ name, color: v.color, weight: v.weight, commits: v.commits }))
    .sort((a, b) => b.weight - a.weight);
}

function pieSlice(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  color: string,
): string {
  // Avoid degenerate slices and the M..L..Z artifact when a single slice is the whole pie.
  if (endAngle - startAngle >= Math.PI * 2 - 0.001) {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>`;
  }
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `<path d="M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z" fill="${color}"/>`;
}

function languagesBlock(p: ProfileData, height: number): Block {
  const langs = aggregateLanguages(p.repos).slice(0, 6);
  const totalWeight = langs.reduce((s, l) => s + l.weight, 0) || 1;
  const headerH = 24;

  const out: string[] = [sectionTitle("languages by commit")];

  if (langs.length === 0) {
    out.push(
      `<text class="muted" x="${SIDEBAR_W / 2}" y="${headerH + 30}" font-size="11" text-anchor="middle">no language data</text>`,
    );
    return { content: out.join(""), width: SIDEBAR_W, height };
  }

  const pieR = 56;
  const pieCx = pieR + 6;
  const pieCy = headerH + pieR + 6;

  // Pie slices, going clockwise from -π/2 (12 o'clock).
  let angle = -Math.PI / 2;
  for (const l of langs) {
    const sweep = (l.weight / totalWeight) * Math.PI * 2;
    out.push(pieSlice(pieCx, pieCy, pieR, angle, angle + sweep, l.color));
    angle += sweep;
  }

  // Legend on the right.
  const legendX = pieCx + pieR + 16;
  const legendW = SIDEBAR_W - legendX;
  const legendStartY = headerH + 8;
  const legendRowH = 18;
  langs.forEach((l, i) => {
    const ly = legendStartY + i * legendRowH;
    const pct = ((l.weight / totalWeight) * 100).toFixed(0);
    out.push(
      `<rect x="${legendX}" y="${ly + 2}" width="9" height="9" rx="1.5" ry="1.5" fill="${l.color}"/>`,
      `<text class="fg" x="${legendX + 14}" y="${ly + 11}" font-size="11">${esc(trunc(l.name, 9))}</text>`,
      `<text class="muted" x="${legendX + legendW}" y="${ly + 11}" font-size="10" text-anchor="end">${pct}%</text>`,
    );
  });

  return { content: out.join(""), width: SIDEBAR_W, height };
}

// ---------- Hours block ----------

function buildHourCounts(repos: RepoData[]): { hours: number[]; total: number; peak: number } {
  const hours = new Array(24).fill(0);
  let total = 0;
  for (const r of repos) {
    for (const c of r.recentCommits) {
      const d = new Date(c.date);
      if (Number.isNaN(d.getTime())) continue;
      hours[d.getUTCHours()]++;
      total++;
    }
  }
  let peak = 0;
  for (let h = 0; h < 24; h++) if (hours[h] > hours[peak]) peak = h;
  return { hours, total, peak };
}

function hoursBlock(p: ProfileData, height: number): Block {
  const { hours, total, peak } = buildHourCounts(p.repos);
  const max = Math.max(1, ...hours);
  const headerH = 24;
  const labelH = 14;
  const footerH = 28;
  const barAreaH = height - headerH - labelH - footerH;

  const out: string[] = [sectionTitle("commits by hour (utc)")];
  out.push(
    `<text class="muted" x="${SIDEBAR_W}" y="14" font-size="9" text-anchor="end">${total} commits</text>`,
  );

  const baseY = headerH + barAreaH;
  const gap = 1;
  const bw = (SIDEBAR_W - gap * 23) / 24;
  for (let h = 0; h < 24; h++) {
    const ratio = hours[h] / max;
    const bh = ratio * (barAreaH - 4);
    const by = baseY - bh;
    const bx = h * (bw + gap);
    const isPeak = h === peak && hours[h] > 0;
    const cls = isPeak ? "accent2" : "accent";
    out.push(
      `<rect class="${cls}" x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="1.5" ry="1.5" opacity="${(0.55 + ratio * 0.45).toFixed(2)}"/>`,
    );
  }
  for (const h of [0, 6, 12, 18]) {
    const lx = h * (bw + gap) + bw / 2;
    out.push(
      `<text class="muted" x="${lx}" y="${baseY + 12}" font-size="9" text-anchor="middle">${h.toString().padStart(2, "0")}</text>`,
    );
  }
  if (total > 0) {
    out.push(
      `<text class="muted" x="0" y="${headerH + barAreaH + labelH + 14}" font-size="11">peak hour</text>`,
      `<text class="fg" x="${SIDEBAR_W}" y="${headerH + barAreaH + labelH + 14}" font-size="12" text-anchor="end" font-weight="600">${peak.toString().padStart(2, "0")}:00 UTC</text>`,
    );
  }

  return { content: out.join(""), width: SIDEBAR_W, height };
}

// ---------- Monthly block ----------

function monthlyBuckets(days: ContributionDay[]): { label: string; count: number }[] {
  const now = new Date();
  const buckets: { label: string; count: number; key: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = `${d.getUTCFullYear()}-${(d.getUTCMonth() + 1).toString().padStart(2, "0")}`;
    const label = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
    buckets.push({ label, count: 0, key });
  }
  const map = new Map(buckets.map((b) => [b.key, b]));
  for (const d of days) {
    const key = d.date.slice(0, 7);
    const b = map.get(key);
    if (b) b.count += d.count;
  }
  return buckets;
}

function monthlyBlock(p: ProfileData, height: number): Block {
  const months = monthlyBuckets(p.contributionDays);
  const max = Math.max(1, ...months.map((m) => m.count));
  const headerH = 24;
  const labelH = 14;
  const footerH = 28;
  const barAreaH = height - headerH - labelH - footerH;

  const out: string[] = [sectionTitle("monthly contributions")];
  out.push(
    `<text class="muted" x="${SIDEBAR_W}" y="14" font-size="9" text-anchor="end">last 12 months</text>`,
  );

  const baseY = headerH + barAreaH;
  const gap = 4;
  const bw = (SIDEBAR_W - gap * 11) / 12;
  months.forEach((m, i) => {
    const ratio = m.count / max;
    const bh = ratio * (barAreaH - 6);
    const by = baseY - bh;
    const bx = i * (bw + gap);
    out.push(
      `<rect class="accent2" x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="2" ry="2" opacity="${(0.55 + ratio * 0.45).toFixed(2)}"/>`,
      `<text class="muted" x="${bx + bw / 2}" y="${baseY + 12}" font-size="9" text-anchor="middle">${m.label[0]}</text>`,
    );
  });

  const total = months.reduce((s, m) => s + m.count, 0);
  out.push(
    `<text class="muted" x="0" y="${headerH + barAreaH + labelH + 14}" font-size="11">total</text>`,
    `<text class="fg" x="${SIDEBAR_W}" y="${headerH + barAreaH + labelH + 14}" font-size="12" text-anchor="end" font-weight="600">${total.toLocaleString()}</text>`,
  );

  return { content: out.join(""), width: SIDEBAR_W, height };
}

// ---------- Charts SVG ----------

const CHARTS_W = 920;
const CHARTS_PAD = 24;
const CHARTS_INNER = CHARTS_W - CHARTS_PAD * 2;
const CHARTS_GAP = 16;

const CARDS_ROW_H = 220;

export function renderCharts(p: ProfileData): string {
  const heat = projectHeatmapBlock(p, CHARTS_INNER);
  const lang = languagesBlock(p, CARDS_ROW_H);
  const hrs = hoursBlock(p, CARDS_ROW_H);
  const mo = monthlyBlock(p, CARDS_ROW_H);

  const sidebarRowH = Math.max(lang.height, hrs.height, mo.height);
  const totalH = CHARTS_PAD + heat.height + CHARTS_GAP + sidebarRowH + CHARTS_PAD;

  const langX = CHARTS_PAD;
  const hrsX = CHARTS_PAD + SIDEBAR_W + CHARTS_GAP;
  const moX = CHARTS_PAD + 2 * (SIDEBAR_W + CHARTS_GAP);
  const cardsY = CHARTS_PAD + heat.height + CHARTS_GAP;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CHARTS_W} ${totalH}" width="${CHARTS_W}" height="${totalH}" role="img" aria-label="${esc(p.login)} activity charts">
  <style>${STYLE}</style>
  <rect class="bg" x="0" y="0" width="${CHARTS_W}" height="${totalH}" rx="8" ry="8"/>
  <g transform="translate(${CHARTS_PAD}, ${CHARTS_PAD})">${heat.content}</g>
  <g transform="translate(${langX}, ${cardsY})">${lang.content}</g>
  <g transform="translate(${hrsX}, ${cardsY})">${hrs.content}</g>
  <g transform="translate(${moX}, ${cardsY})">${mo.content}</g>
</svg>`;
}

// ---------- Project cards ----------

const PROJECTS_W = 920;
const PROJECT_PAD = 24;
const PROJECT_COLS = 3;
const PROJECT_GAP = 16;
const PROJECT_CARD_W = (PROJECTS_W - PROJECT_PAD * 2 - PROJECT_GAP * (PROJECT_COLS - 1)) / PROJECT_COLS;
const PROJECT_CARD_H = 200;

const PULSE_WEEKS = 52;

// Smooth a polyline using Catmull-Rom-to-Bezier conversion. Tension 0..1; lower = tighter.
function smoothPath(pts: { x: number; y: number }[], tension = 0.2): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) * tension;
    const c1y = p1.y + (p2.y - p0.y) * tension;
    const c2x = p2.x - (p3.x - p1.x) * tension;
    const c2y = p2.y - (p3.y - p1.y) * tension;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

function weeklyPulseCounts(commits: CommitInfo[]): number[] {
  const now = Date.now();
  const counts = new Array(PULSE_WEEKS).fill(0);
  const weekMs = 7 * 24 * 3600 * 1000;
  for (const c of commits) {
    const t = new Date(c.date).getTime();
    if (Number.isNaN(t)) continue;
    const weeksAgo = Math.floor((now - t) / weekMs);
    if (weeksAgo >= 0 && weeksAgo < PULSE_WEEKS) counts[PULSE_WEEKS - 1 - weeksAgo]++;
  }
  return counts;
}

function pickProjects(
  p: ProfileData,
  t: Timeline,
  descriptions: Record<string, string>,
  max: number,
): { repo: RepoData; title: string; description: string }[] {
  const lookup = new Map<string, { title: string; description: string }>();
  for (const period of t.periods) {
    for (const item of period.items) {
      if (item.repo && !lookup.has(item.repo)) {
        lookup.set(item.repo, { title: item.title, description: item.description });
      }
    }
  }
  const out: { repo: RepoData; title: string; description: string }[] = [];
  for (const r of p.repos) {
    if (r.hidden || r.weight <= 0) continue;
    const entry = lookup.get(r.nameWithOwner);
    const desc =
      descriptions[r.nameWithOwner] ??
      r.description ??
      entry?.description ??
      "";
    out.push({
      repo: r,
      title: entry?.title ?? displayRepo(r.nameWithOwner, p.login),
      description: desc,
    });
    if (out.length >= max) break;
  }
  return out;
}

function renderProjectCard(
  card: { repo: RepoData; title: string; description: string },
  loginForDisplay: string,
  x: number,
  y: number,
): string {
  const w = PROJECT_CARD_W;
  const h = PROJECT_CARD_H;
  const r = card.repo;
  const pad = 14;
  const name = displayRepo(r.nameWithOwner, loginForDisplay);
  const out: string[] = [];

  // Card panel with subtle border via stroke on a fill="none" overlay
  out.push(
    `<rect class="panel" x="${x}" y="${y}" width="${w}" height="${h}" rx="8" ry="8"/>`,
    `<rect class="border" x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="8" ry="8" fill="none"/>`,
  );

  // Name + language pill
  const langName = r.language?.name ?? "—";
  const langColor = r.language?.color ?? "#888";
  out.push(
    `<text class="fg" x="${x + pad}" y="${y + pad + 12}" font-size="14" font-weight="700">${esc(trunc(name, 22))}</text>`,
    `<circle cx="${x + w - pad - 60}" cy="${y + pad + 8}" r="4" fill="${langColor}"/>`,
    `<text class="muted" x="${x + w - pad - 50}" y="${y + pad + 12}" font-size="10">${esc(trunc(langName, 10))}</text>`,
  );

  // Catchy title
  const titleLines = wrapText(card.title, Math.floor((w - pad * 2) / 6.5), 2);
  titleLines.forEach((line, i) => {
    out.push(
      `<text class="accent" x="${x + pad}" y="${y + pad + 36 + i * 16}" font-size="12" font-weight="600">${esc(line)}</text>`,
    );
  });

  // Description (3 lines)
  const descY = y + pad + 36 + titleLines.length * 16 + 6;
  const descLines = wrapText(card.description, Math.floor((w - pad * 2) / 5.8), 4);
  descLines.forEach((line, i) => {
    out.push(
      `<text class="muted" x="${x + pad}" y="${descY + i * 14}" font-size="11">${esc(line)}</text>`,
    );
  });

  // Pulse line at the bottom — weekly commit counts as a smooth Catmull-Rom-style
  // curve with a faint area fill below, mimicking GitHub's project pulse chart.
  const counts = weeklyPulseCounts(r.recentCommits);
  const max = Math.max(1, ...counts);
  const sparkAreaH = 32;
  const baselineY = y + h - pad - 14;
  const sparkW = w - pad * 2;
  const startX = x + pad;
  const dx = sparkW / (counts.length - 1);
  const pts = counts.map((c, i) => ({
    x: startX + i * dx,
    y: baselineY - (c / max) * sparkAreaH,
  }));
  const linePath = smoothPath(pts);
  const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(2)} ${baselineY} L ${pts[0].x.toFixed(2)} ${baselineY} Z`;
  out.push(
    `<path d="${areaPath}" fill="${langColor}" opacity="0.20"/>`,
    `<path d="${linePath}" stroke="${langColor}" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  );
  const totalCommitsInWindow = counts.reduce((a, b) => a + b, 0);
  out.push(
    `<text class="muted" x="${x + pad}" y="${y + h - pad}" font-size="9">last 12 months · ${totalCommitsInWindow} commits</text>`,
  );

  return out.join("");
}

export function renderProjectsCards(
  p: ProfileData,
  t: Timeline,
  descriptions: Record<string, string> = {},
): string {
  const maxCards = PROJECT_COLS * 3; // up to 3 rows
  const projects = pickProjects(p, t, descriptions, maxCards);
  if (projects.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PROJECTS_W} 60" width="${PROJECTS_W}" height="60"><style>${STYLE}</style><rect class="bg" width="${PROJECTS_W}" height="60" rx="8" ry="8"/><text class="muted" x="${PROJECTS_W / 2}" y="36" text-anchor="middle" font-size="12">No project cards available.</text></svg>`;
  }

  const rows = Math.ceil(projects.length / PROJECT_COLS);
  const totalH = PROJECT_PAD * 2 + rows * PROJECT_CARD_H + (rows - 1) * PROJECT_GAP;
  const out: string[] = [];
  projects.forEach((card, i) => {
    const col = i % PROJECT_COLS;
    const row = Math.floor(i / PROJECT_COLS);
    const x = PROJECT_PAD + col * (PROJECT_CARD_W + PROJECT_GAP);
    const y = PROJECT_PAD + row * (PROJECT_CARD_H + PROJECT_GAP);
    out.push(renderProjectCard(card, p.login, x, y));
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PROJECTS_W} ${totalH}" width="${PROJECTS_W}" height="${totalH}" role="img" aria-label="${esc(p.login)} project cards">
  <style>${STYLE}</style>
  <rect class="bg" x="0" y="0" width="${PROJECTS_W}" height="${totalH}" rx="8" ry="8"/>
  ${out.join("\n  ")}
</svg>`;
}

// ---------- Recent activity markdown (full timeline as markdown) ----------

export function renderActivitySummaryMarkdown(t: Timeline): string {
  const lines: string[] = [];
  lines.push("## Recent activity (last 12 months)");
  lines.push("");
  lines.push(`*Auto-generated weekly from commit history · updated ${t.generatedAt}*`);
  lines.push("");
  if (t.summary) {
    lines.push(t.summary);
    lines.push("");
  }
  return lines.join("\n");
}

export function renderTimelineMarkdown(t: Timeline, login: string): string {
  const lines: string[] = [];
  // Wrap each period inside a blockquote — GitHub renders these with a vertical
  // bar on the left, giving the timeline a rail look without needing HTML.
  for (const period of t.periods) {
    lines.push(`> **${esc(period.period)}**`);
    lines.push(">");
    for (const item of period.items) {
      const repoSuffix = item.repo ? ` *(${displayRepo(item.repo, login)})*` : "";
      lines.push(`> - **${item.title}**${repoSuffix} — ${item.description}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export function renderActivityMarkdown(t: Timeline, login: string): string {
  return renderActivitySummaryMarkdown(t) + renderTimelineMarkdown(t, login);
}
