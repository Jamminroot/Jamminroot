import { createWriteStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import PDFDocument from "pdfkit";
import type { ProfileData } from "./github.js";
import type { Timeline } from "./render.js";

type Experience = {
  company: string;
  role: string;
  employmentType: string | null;
  start: string; // YYYY-MM
  end: string | null; // YYYY-MM, null = present
  location: string | null;
  bullets: string[];
};

type Career = { experiences: Experience[] };

const COLORS = {
  fg: "#1f2328",
  muted: "#656d76",
  accent: "#0969da",
  accent2: "#1f883d",
  rule: "#d0d7de",
};

function ageFromDOB(dobStr: string): number | null {
  const dob = new Date(dobStr);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

function formatPeriod(start: string, end: string | null): { range: string; duration: string } {
  const [sy, sm] = start.split("-").map(Number);
  const startDate = new Date(sy, sm - 1, 1);
  const endDate = end ? new Date(...(end.split("-").map(Number) as [number, number]).map((v, i) => (i === 1 ? v - 1 : v)) as [number, number, number?]) : new Date();
  const fmt = (d: Date) => d.toLocaleString("en-US", { month: "short", year: "numeric" });
  const range = `${fmt(startDate)} – ${end ? fmt(endDate) : "Present"}`;
  // Duration in years and months
  let months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
  if (months < 0) months = 0;
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  const parts: string[] = [];
  if (yrs > 0) parts.push(`${yrs} yr${yrs > 1 ? "s" : ""}`);
  if (mos > 0) parts.push(`${mos} mo${mos > 1 ? "s" : ""}`);
  const duration = parts.length > 0 ? parts.join(" ") : "<1 mo";
  return { range, duration };
}

async function fetchAvatarPng(login: string): Promise<Buffer | null> {
  try {
    const res = await fetch(`https://github.com/${encodeURIComponent(login)}.png?size=240`);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

async function loadCareer(): Promise<Career | null> {
  try {
    const raw = await readFile(resolve("career.json"), "utf8");
    return JSON.parse(raw) as Career;
  } catch {
    return null;
  }
}

export async function renderCVPdf(
  p: ProfileData,
  timeline: Timeline,
  outPath: string,
): Promise<void> {
  const legalName = process.env.LEGAL_NAME?.trim() || p.name;
  const dob = process.env.DATE_OF_BIRTH?.trim();
  const age = dob ? ageFromDOB(dob) : null;
  const career = await loadCareer();
  const avatar = await fetchAvatarPng(p.login);

  const doc = new PDFDocument({ size: "A4", margin: 48, info: { Title: `${legalName} – CV` } });
  const stream = createWriteStream(outPath);
  doc.pipe(stream);

  const pageW = doc.page.width;
  const margin = 48;
  const contentW = pageW - margin * 2;

  // ---------- Header ----------
  const headerTop = margin;
  const avatarSize = 84;
  if (avatar) {
    doc.save();
    doc.roundedRect(margin, headerTop, avatarSize, avatarSize, 8).clip();
    doc.image(avatar, margin, headerTop, { width: avatarSize, height: avatarSize });
    doc.restore();
  }
  const textX = margin + (avatar ? avatarSize + 16 : 0);
  doc.fontSize(22).fillColor(COLORS.fg).font("Helvetica-Bold").text(`${legalName} (@${p.login})`, textX, headerTop + 4);

  const subParts: string[] = [];
  if (age != null) subParts.push(`${age} y/o`);
  if (p.location) subParts.push(p.location);
  if (subParts.length > 0) {
    doc.fontSize(11).fillColor(COLORS.muted).font("Helvetica").text(subParts.join("  ·  "), textX, doc.y + 2);
  }
  if (p.bio) {
    doc.fontSize(11).fillColor(COLORS.fg).text(p.bio, textX, doc.y + 6, { width: contentW - (textX - margin) });
  }

  doc.y = headerTop + avatarSize + 16;
  doc.moveTo(margin, doc.y).lineTo(margin + contentW, doc.y).strokeColor(COLORS.rule).lineWidth(0.5).stroke();
  doc.y += 16;

  // ---------- Recent activity (summary) ----------
  if (timeline.summary) {
    sectionTitle(doc, "Recent activity");
    doc.fontSize(10).fillColor(COLORS.fg).font("Helvetica").text(timeline.summary, margin, doc.y, {
      width: contentW,
      lineGap: 2,
    });
    doc.y += 14;
  }

  // ---------- Activity timeline (last 12 months) ----------
  if (timeline.periods.length > 0) {
    sectionTitle(doc, "Activity timeline (last 12 months)");
    for (const period of timeline.periods) {
      doc.fontSize(11).fillColor(COLORS.accent).font("Helvetica-Bold").text(period.period, margin, doc.y, {
        width: contentW,
      });
      doc.y += 2;
      for (const item of period.items) {
        const titleLine = item.repo
          ? `${item.title}  —  ${displayRepoForPdf(item.repo, p.login)}`
          : item.title;
        doc.fontSize(10).fillColor(COLORS.fg).font("Helvetica-Bold").text(titleLine, margin + 12, doc.y, {
          width: contentW - 12,
        });
        doc.fontSize(9.5).fillColor(COLORS.muted).font("Helvetica").text(item.description, margin + 12, doc.y + 1, {
          width: contentW - 12,
          lineGap: 1.5,
        });
        doc.y += 4;
      }
      doc.y += 6;
    }
    doc.y += 4;
  }

  // ---------- Career history ----------
  if (career && career.experiences.length > 0) {
    sectionTitle(doc, "Experience");
    for (const exp of career.experiences) {
      // Page break if too close to bottom
      if (doc.y > doc.page.height - margin - 90) doc.addPage();

      const { range, duration } = formatPeriod(exp.start, exp.end);
      const rightLine = `${range}  ·  ${duration}`;

      const rowTop = doc.y;
      // Role + company (left)
      doc.fontSize(11).fillColor(COLORS.fg).font("Helvetica-Bold").text(exp.role, margin, rowTop, {
        width: contentW * 0.65,
      });
      const companyLine = exp.employmentType ? `${exp.company}  ·  ${exp.employmentType}` : exp.company;
      doc.fontSize(10).fillColor(COLORS.muted).font("Helvetica").text(companyLine, margin, doc.y, {
        width: contentW * 0.65,
      });
      // Date range (right column)
      doc.fontSize(9.5).fillColor(COLORS.muted).font("Helvetica").text(rightLine, margin + contentW * 0.65, rowTop, {
        width: contentW * 0.35,
        align: "right",
      });
      if (exp.location) {
        doc.fontSize(9).fillColor(COLORS.muted).text(exp.location, margin + contentW * 0.65, doc.y - 2, {
          width: contentW * 0.35,
          align: "right",
        });
      }
      // Reset y to the lower of the two columns
      doc.y = Math.max(doc.y, rowTop + 28);
      doc.y += 2;

      // Bullets
      for (const b of exp.bullets) {
        doc.fontSize(10).fillColor(COLORS.fg).font("Helvetica").text(`•  ${b}`, margin + 12, doc.y, {
          width: contentW - 12,
          lineGap: 1.5,
        });
        doc.y += 1;
      }
      doc.y += 8;
    }
  }

  // ---------- Footer (stats) ----------
  if (doc.y > doc.page.height - margin - 30) doc.addPage();
  doc.moveTo(margin, doc.y).lineTo(margin + contentW, doc.y).strokeColor(COLORS.rule).lineWidth(0.5).stroke();
  doc.y += 8;
  doc.fontSize(8).fillColor(COLORS.muted).font("Helvetica").text(
    `Last 12 months on GitHub: ${p.totals.contributions.toLocaleString()} contributions · ${p.totals.commits.toLocaleString()} public commits · ${p.totals.pullRequests} PRs · ${p.totals.reviews} reviews. Generated ${timeline.generatedAt}.`,
    margin,
    doc.y,
    { width: contentW },
  );

  doc.end();
  await new Promise<void>((res, rej) => {
    stream.on("finish", () => res());
    stream.on("error", rej);
  });
}

function sectionTitle(doc: PDFKit.PDFDocument, text: string): void {
  doc.fontSize(13).fillColor(COLORS.fg).font("Helvetica-Bold").text(text, doc.page.margins.left, doc.y);
  doc.y += 4;
  doc
    .moveTo(doc.page.margins.left, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .strokeColor(COLORS.rule)
    .lineWidth(0.5)
    .stroke();
  doc.y += 8;
}

function displayRepoForPdf(nameWithOwner: string, login: string): string {
  const slash = nameWithOwner.indexOf("/");
  if (slash < 0) return nameWithOwner;
  const owner = nameWithOwner.slice(0, slash);
  return owner.toLowerCase() === login.toLowerCase() ? nameWithOwner.slice(slash + 1) : nameWithOwner;
}
