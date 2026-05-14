import { jsPDF } from "jspdf";
import type { GeneratedPlan } from "@/types/garden";
import { displayDimension } from "@/utils/units";

const COLORS = {
  forest:      [26, 60, 46]   as [number, number, number],
  forestSoft:  [60, 95, 80]   as [number, number, number],
  cream:       [245, 240, 232] as [number, number, number],
  creamDark:   [232, 223, 209] as [number, number, number],
  terracotta:  [196, 98, 45]  as [number, number, number],
  gold:        [212, 168, 83] as [number, number, number],
  text:        [40, 50, 45]   as [number, number, number],
  textMuted:   [100, 110, 105] as [number, number, number],
  vegetable:   [157, 201, 173] as [number, number, number],
  herb:        [212, 176, 104] as [number, number, number],
  flower:      [200, 160, 200] as [number, number, number],
  foliage:     [136, 176, 152] as [number, number, number],
};

const TYPE_LABEL: Record<string, string> = {
  vegetable: "Vegetables",
  herb:      "Herbs",
  flower:    "Flowers",
  foliage:   "Foliage & Ornamental",
};

const TYPE_COLOR: Record<string, [number, number, number]> = {
  vegetable: COLORS.vegetable,
  herb:      COLORS.herb,
  flower:    COLORS.flower,
  foliage:   COLORS.foliage,
};

const PAGE = {
  width:   210,
  height:  297,
  margin:  16,
  bottom:  280,
};

interface Cursor { y: number }

export function downloadPlanAsPdf(plan: GeneratedPlan): void {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  doc.setFont("helvetica", "normal");

  const cursor: Cursor = { y: PAGE.margin };

  drawHeader(doc, plan);
  cursor.y = 56;

  drawSummaryCard(doc, plan, cursor);
  drawAreasSection(doc, plan, cursor);
  drawPlantsByCategory(doc, plan, cursor);
  drawCustomPlantsSection(doc, plan, cursor);
  drawScheduleSection(doc, plan, cursor);
  drawNotesSection(doc, plan, cursor);

  drawFooterAllPages(doc);

  const fileName = buildFileName(plan);
  doc.save(fileName);
}

function buildFileName(plan: GeneratedPlan): string {
  const safeRegion = plan.region.label.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const d = new Date();
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return `SproutIt_Garden_Plan_${safeRegion}_${dateStr}.pdf`;
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function ensureSpace(doc: jsPDF, cursor: Cursor, needed: number): void {
  if (cursor.y + needed > PAGE.bottom) {
    doc.addPage();
    cursor.y = PAGE.margin;
  }
}

function setFill(doc: jsPDF, c: [number, number, number]) { doc.setFillColor(c[0], c[1], c[2]); }
function setText(doc: jsPDF, c: [number, number, number]) { doc.setTextColor(c[0], c[1], c[2]); }
function setDraw(doc: jsPDF, c: [number, number, number]) { doc.setDrawColor(c[0], c[1], c[2]); }

function sectionHeading(doc: jsPDF, cursor: Cursor, title: string, minFollowingHeight = 24) {
  // Reserve room for the heading itself plus enough body for at least one
  // card header + one body line, so headings never end up orphaned at the
  // bottom of a page.
  ensureSpace(doc, cursor, 8 + minFollowingHeight);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  setText(doc, COLORS.forest);
  doc.text(title.toUpperCase(), PAGE.margin, cursor.y);

  setDraw(doc, COLORS.creamDark);
  doc.setLineWidth(0.4);
  doc.line(PAGE.margin, cursor.y + 1.5, PAGE.width - PAGE.margin, cursor.y + 1.5);

  cursor.y += 8;
}

function card(
  doc: jsPDF,
  cursor: Cursor,
  height: number,
  draw: (x: number, y: number, w: number) => void,
  options: { fill?: [number, number, number]; border?: [number, number, number] } = {},
) {
  ensureSpace(doc, cursor, height + 4);
  const x = PAGE.margin;
  const w = PAGE.width - PAGE.margin * 2;
  setFill(doc, options.fill ?? COLORS.cream);
  setDraw(doc, options.border ?? COLORS.creamDark);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, cursor.y, w, height, 2.5, 2.5, "FD");
  draw(x, cursor.y, w);
  cursor.y += height + 4;
}

// ── Sections ────────────────────────────────────────────────────────────────

function drawHeader(doc: jsPDF, plan: GeneratedPlan) {
  setFill(doc, COLORS.forest);
  doc.rect(0, 0, PAGE.width, 44, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  setText(doc, COLORS.cream);
  doc.text("SproutIt", PAGE.margin, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setText(doc, [220, 215, 205]);
  doc.text("Your Alberta garden, perfectly planned", PAGE.margin, 25);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  setText(doc, COLORS.cream);
  doc.text(`${plan.region.label} Garden Plan`, PAGE.margin, 36);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setText(doc, [200, 195, 185]);
  const generatedDate = new Date(plan.generatedAt).toLocaleDateString(undefined, {
    year: "numeric", month: "long", day: "numeric",
  });
  doc.text(`Generated ${generatedDate}`, PAGE.width - PAGE.margin, 36, { align: "right" });
}

function drawSummaryCard(doc: jsPDF, plan: GeneratedPlan, cursor: Cursor) {
  const profile = plan.profile;
  const region  = plan.region;
  const unit    = profile.unitPreference === "metric" ? "Metric (cm/m)" : "Imperial (in/ft)";
  card(doc, cursor, 28, (x, y, w) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    setText(doc, COLORS.forest);
    doc.text("Garden Overview", x + 5, y + 7);

    const cols = [
      { label: "Region",  value: `${region.label}, ${region.province}` },
      { label: "Zone",    value: region.zone },
      { label: "Last spring frost", value: region.lastSpringFrost },
      { label: "First fall frost",  value: region.firstFallFrost },
      { label: "Plants selected",   value: String(plan.selectedPlants.length) },
      { label: "Units",   value: unit },
    ];
    const colW = (w - 10) / 3;
    cols.forEach((col, i) => {
      const cx = x + 5 + (i % 3) * colW;
      const cy = y + 14 + Math.floor(i / 3) * 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      setText(doc, COLORS.textMuted);
      doc.text(col.label.toUpperCase(), cx, cy);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      setText(doc, COLORS.text);
      doc.text(col.value, cx, cy + 4);
    });
  });
}

function drawAreasSection(doc: jsPDF, plan: GeneratedPlan, cursor: Cursor) {
  sectionHeading(doc, cursor, "Garden Areas");
  const areas = plan.areaPlans?.length
    ? plan.areaPlans.map(ap => ({
        name: ap.area.name,
        size: `${displayDimension(ap.area.lengthFt, plan.profile.unitPreference)} × ${displayDimension(ap.area.widthFt, plan.profile.unitPreference)}`,
        sun:  ap.area.sunlight,
        soil: ap.area.soilType,
        plantCount: ap.selectedPlants.length,
      }))
    : [{
        name: "My Garden",
        size: `${displayDimension(plan.profile.lengthFt, plan.profile.unitPreference)} × ${displayDimension(plan.profile.widthFt, plan.profile.unitPreference)}`,
        sun:  plan.profile.sunlight,
        soil: plan.profile.soilType,
        plantCount: plan.selectedPlants.length,
      }];

  for (const a of areas) {
    card(doc, cursor, 18, (x, y, w) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      setText(doc, COLORS.forest);
      doc.text(a.name, x + 5, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      setText(doc, COLORS.textMuted);
      doc.text(`${a.size}  ·  ${a.sun}  ·  ${a.soil}`, x + 5, y + 13);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      setText(doc, COLORS.forest);
      doc.text(`${a.plantCount} plant${a.plantCount !== 1 ? "s" : ""}`, x + w - 5, y + 11, { align: "right" });
    });
  }
}

// Render a header strip + paginated body lines. If the body doesn't all fit
// on the current page, the remaining lines continue on a new page with a
// "<title> (continued)" strip — never clipped.
function paginatedBlock(
  doc: jsPDF,
  cursor: Cursor,
  opts: {
    title:        string;
    titleFill:    [number, number, number];
    titleColor:   [number, number, number];
    accentStripe?: [number, number, number];
    bodyFill?:    [number, number, number];
    border?:      [number, number, number];
    lines:        string[];
    lineHeight?:  number;
    bodyTextColor?: [number, number, number];
    fontSize?:    number;
  },
) {
  const lineHeight     = opts.lineHeight ?? 4.8;
  const fontSize       = opts.fontSize ?? 9;
  const headerHeight   = 7;
  const topPad         = 4;
  const bottomPad      = 4;
  const sidePad        = 5;
  const border         = opts.border ?? COLORS.creamDark;
  const bodyFill       = opts.bodyFill ?? COLORS.cream;

  const allLines = [...opts.lines];
  if (allLines.length === 0) allLines.push("(none)");

  let isFirst = true;
  let idx = 0;

  while (idx < allLines.length) {
    // Make sure header + at least 1 line fits on the current page; otherwise
    // start a new page so we never orphan the header.
    if (cursor.y + headerHeight + topPad + lineHeight + bottomPad > PAGE.bottom) {
      doc.addPage();
      cursor.y = PAGE.margin;
    }

    const available = PAGE.bottom - cursor.y - headerHeight - topPad - bottomPad;
    const linesThatFit = Math.max(1, Math.floor(available / lineHeight));
    const slice = allLines.slice(idx, idx + linesThatFit);
    const blockHeight = headerHeight + topPad + slice.length * lineHeight + bottomPad;

    const x = PAGE.margin;
    const w = PAGE.width - PAGE.margin * 2;

    setFill(doc, bodyFill);
    setDraw(doc, border);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, cursor.y, w, blockHeight, 2.5, 2.5, "FD");

    // Header strip
    setFill(doc, opts.titleFill);
    doc.rect(x, cursor.y, w, headerHeight, "F");

    // Optional left accent stripe spanning whole block
    if (opts.accentStripe) {
      setFill(doc, opts.accentStripe);
      doc.rect(x, cursor.y, 3, blockHeight, "F");
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    setText(doc, opts.titleColor);
    const headerLabel = isFirst ? opts.title : `${opts.title} (continued)`;
    doc.text(headerLabel, x + sidePad, cursor.y + 5);

    // Body lines
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    setText(doc, opts.bodyTextColor ?? COLORS.text);
    let ly = cursor.y + headerHeight + topPad + lineHeight - 1;
    for (const line of slice) {
      doc.text(line, x + sidePad + (opts.accentStripe ? 3 : 0), ly);
      ly += lineHeight;
    }

    cursor.y += blockHeight + 3;
    idx += slice.length;
    isFirst = false;
  }
}

function drawPlantsByCategory(doc: jsPDF, plan: GeneratedPlan, cursor: Cursor) {
  sectionHeading(doc, cursor, "Selected Plants");
  const grouped = new Map<string, typeof plan.selectedPlants>();
  for (const p of plan.selectedPlants) {
    if (!grouped.has(p.type)) grouped.set(p.type, []);
    grouped.get(p.type)!.push(p);
  }

  const innerWidth = PAGE.width - PAGE.margin * 2 - 14; // sidePad*2 + accent stripe
  const order = ["vegetable", "herb", "flower", "foliage"];
  for (const type of order) {
    const list = grouped.get(type);
    if (!list || list.length === 0) continue;
    const accent = TYPE_COLOR[type] ?? COLORS.foliage;

    const lines: string[] = [];
    for (const p of list) {
      const detail = p.daysToMaturity > 0
        ? `${p.daysToMaturity} days · needs ${p.minSunlight}`
        : `perennial · needs ${p.minSunlight}`;
      const raw = `•  ${p.name}  —  ${detail}`;
      const wrapped = doc.splitTextToSize(raw, innerWidth) as string[];
      lines.push(...wrapped);
    }

    paginatedBlock(doc, cursor, {
      title:        `${TYPE_LABEL[type] ?? type} (${list.length})`,
      titleFill:    COLORS.cream,
      titleColor:   COLORS.forest,
      accentStripe: accent,
      lines,
    });
  }
}

function drawCustomPlantsSection(doc: jsPDF, plan: GeneratedPlan, cursor: Cursor) {
  const customs = plan.profile.customPlants ?? [];
  if (customs.length === 0) return;

  sectionHeading(doc, cursor, "Custom Plants");
  const innerWidth = PAGE.width - PAGE.margin * 2 - 10;
  const lines: string[] = [];
  for (const cp of customs) {
    const raw = `•  ${cp.name}  (${cp.category})${cp.notes ? ` — ${cp.notes}` : ""}`;
    lines.push(...(doc.splitTextToSize(raw, innerWidth) as string[]));
  }
  paginatedBlock(doc, cursor, {
    title:      "Your Custom Plants",
    titleFill:  COLORS.cream,
    titleColor: COLORS.forest,
    lines,
  });
}

function drawScheduleSection(doc: jsPDF, plan: GeneratedPlan, cursor: Cursor) {
  const weeks = plan.schedule.filter(w => w.hasActions);
  if (weeks.length === 0) return;

  sectionHeading(doc, cursor, "Weekly Schedule");
  const innerWidth = PAGE.width - PAGE.margin * 2 - 10;

  for (const week of weeks) {
    const lines: string[] = [];
    for (const a of week.actions) {
      const raw = `•  ${a.description}${a.timingNote ? `  (${a.timingNote})` : ""}`;
      lines.push(...(doc.splitTextToSize(raw, innerWidth) as string[]));
    }
    paginatedBlock(doc, cursor, {
      title:        week.weekLabel,
      titleFill:    COLORS.forest,
      titleColor:   COLORS.cream,
      lines,
    });
  }
}

function drawNotesSection(doc: jsPDF, plan: GeneratedPlan, cursor: Cursor) {
  const notes = plan.cautionNotes ?? [];
  if (notes.length === 0) return;

  sectionHeading(doc, cursor, "Caution Notes");
  const innerWidth = PAGE.width - PAGE.margin * 2 - 10;
  const lines: string[] = [];
  for (const n of notes) {
    lines.push(...(doc.splitTextToSize(`•  ${n}`, innerWidth) as string[]));
  }
  paginatedBlock(doc, cursor, {
    title:      "Things to watch",
    titleFill:  COLORS.gold,
    titleColor: COLORS.forest,
    bodyFill:   [251, 246, 232],
    border:     COLORS.gold,
    lines,
    lineHeight: 5,
  });
}

function drawFooterAllPages(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setText(doc, COLORS.textMuted);
    doc.text("Generated by SproutIt — Alberta garden planning", PAGE.margin, 290);
    doc.text(`Page ${i} of ${pageCount}`, PAGE.width - PAGE.margin, 290, { align: "right" });
  }
}
