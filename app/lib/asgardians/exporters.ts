// Renders an enhanced ResumeData object to TXT, DOCX, and PDF.
// Layout targets: 2 pages max, 0.7" margins, single column, ATS-safe
// (no tables, no text boxes, standard section headings).
import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TabStopType,
  TextRun,
} from "docx";
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import type { ResumeData } from "./types";

function contactLine(r: ResumeData): string {
  return [r.contact.location, r.contact.phone, r.contact.email, ...(r.contact.links ?? [])]
    .filter(Boolean)
    .join(" | ");
}

function dateRange(start?: string | null, end?: string | null): string {
  if (!start && !end) return "";
  return `${start ?? ""} – ${end ?? "Present"}`;
}

// ---------------------------------------------------------------- TXT

export function toTxt(r: ResumeData): string {
  const lines: string[] = [];
  lines.push(r.contact.fullName.toUpperCase());
  if (r.contact.headline) lines.push(r.contact.headline);
  lines.push(contactLine(r), "");
  lines.push("PROFESSIONAL SUMMARY", r.summary, "");
  lines.push("PROFESSIONAL EXPERIENCE");
  for (const job of r.experience) {
    const head = [job.title, job.company, job.location].filter(Boolean).join(" | ");
    lines.push(`${head}  (${dateRange(job.startDate, job.endDate)})`);
    for (const b of job.bullets) lines.push(`- ${b}`);
    lines.push("");
  }
  if (r.skills.length) lines.push("SKILLS & COMPETENCIES", r.skills.join(" | "), "");
  lines.push("EDUCATION");
  for (const e of r.education) {
    lines.push([e.degree, e.institution, e.date].filter(Boolean).join(" | "));
    for (const d of e.details ?? []) lines.push(`- ${d}`);
  }
  if (r.certifications.length) {
    lines.push("", "CERTIFICATIONS");
    for (const c of r.certifications)
      lines.push([c.name, c.issuer, c.date].filter(Boolean).join(" | "));
  }
  if (r.interests?.length) lines.push("", "INTERESTS", r.interests.join(" | "));
  return lines.join("\n");
}

// ---------------------------------------------------------------- DOCX

const HEADING_COLOR = "1F2937";

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 180, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "999999" } },
    children: [
      new TextRun({ text: text.toUpperCase(), bold: true, size: 22, color: HEADING_COLOR }),
    ],
  });
}

export async function toDocx(r: ResumeData): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: r.contact.fullName, bold: true, size: 34 })],
    }),
  ];
  if (r.contact.headline) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: r.contact.headline, size: 22, color: "444444" })],
      }),
    );
  }
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: contactLine(r), size: 19, color: "444444" })],
    }),
  );

  children.push(sectionHeading("Professional Summary"));
  children.push(
    new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: r.summary, size: 20 })] }),
  );

  children.push(sectionHeading("Professional Experience"));
  for (const job of r.experience) {
    const head = [job.title, job.company].filter(Boolean).join(" — ");
    children.push(
      new Paragraph({
        spacing: { before: 100 },
        tabStops: [{ type: TabStopType.RIGHT, position: 10440 }],
        children: [
          new TextRun({ text: head, bold: true, size: 21 }),
          new TextRun({ text: `\t${dateRange(job.startDate, job.endDate)}`, size: 19, color: "444444" }),
        ],
      }),
    );
    if (job.location) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: job.location, italics: true, size: 19, color: "666666" })],
        }),
      );
    }
    for (const b of job.bullets) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 20 },
          children: [new TextRun({ text: b, size: 20 })],
        }),
      );
    }
  }

  if (r.skills.length) {
    children.push(sectionHeading("Skills & Competencies"));
    children.push(
      new Paragraph({ children: [new TextRun({ text: r.skills.join("  •  "), size: 20 })] }),
    );
  }

  children.push(sectionHeading("Education"));
  for (const e of r.education) {
    children.push(
      new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: 10440 }],
        children: [
          new TextRun({ text: e.degree, bold: true, size: 20 }),
          new TextRun({ text: e.institution ? ` — ${e.institution}` : "", size: 20 }),
          new TextRun({ text: e.date ? `\t${e.date}` : "", size: 19, color: "444444" }),
        ],
      }),
    );
    for (const d of e.details ?? []) {
      children.push(
        new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: d, size: 20 })] }),
      );
    }
  }

  if (r.certifications.length) {
    children.push(sectionHeading("Certifications"));
    for (const c of r.certifications) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({
              text: [c.name, c.issuer, c.date].filter(Boolean).join(" — "),
              size: 20,
            }),
          ],
        }),
      );
    }
  }

  if (r.interests?.length) {
    children.push(sectionHeading("Interests"));
    children.push(
      new Paragraph({ children: [new TextRun({ text: r.interests.join("  •  "), size: 20 })] }),
    );
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: "Calibri" } } } },
    sections: [
      {
        properties: {
          page: { margin: { top: 1008, bottom: 1008, left: 1008, right: 1008 } },
        },
        children,
      },
    ],
  });
  return Packer.toBuffer(doc);
}

// ---------------------------------------------------------------- PDF

const PAGE_W = 612; // US Letter, points
const PAGE_H = 792;
const MARGIN = 50;
const BODY = 10;
const GRAY = rgb(0.33, 0.33, 0.33);

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const candidate = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function toPdf(r: ResumeData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);
  const width = PAGE_W - MARGIN * 2;

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const ensure = (needed: number): void => {
    if (y - needed < MARGIN) {
      page = doc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }
  };
  const text = (
    t: string,
    opts: { font?: PDFFont; size?: number; x?: number; color?: ReturnType<typeof rgb>; gap?: number } = {},
  ): void => {
    const f = opts.font ?? font;
    const s = opts.size ?? BODY;
    ensure(s + 2);
    page.drawText(t, { x: opts.x ?? MARGIN, y: y - s, size: s, font: f, color: opts.color });
    y -= s + (opts.gap ?? 3);
  };
  const centered = (t: string, f: PDFFont, s: number, color?: ReturnType<typeof rgb>): void => {
    const w = f.widthOfTextAtSize(t, s);
    ensure(s + 2);
    page.drawText(t, { x: (PAGE_W - w) / 2, y: y - s, size: s, font: f, color });
    y -= s + 4;
  };
  const heading = (t: string): void => {
    ensure(30);
    y -= 8;
    text(t.toUpperCase(), { font: bold, size: 11, gap: 2 });
    page.drawLine({
      start: { x: MARGIN, y: y },
      end: { x: PAGE_W - MARGIN, y: y },
      thickness: 0.7,
      color: rgb(0.6, 0.6, 0.6),
    });
    y -= 6;
  };
  const bullets = (items: string[]): void => {
    for (const b of items) {
      const lines = wrap(b, font, BODY, width - 14);
      for (let i = 0; i < lines.length; i++) {
        ensure(BODY + 2);
        if (i === 0) page.drawText("•", { x: MARGIN + 2, y: y - BODY, size: BODY, font });
        page.drawText(lines[i], { x: MARGIN + 14, y: y - BODY, size: BODY, font });
        y -= BODY + 2.5;
      }
    }
  };

  centered(r.contact.fullName, bold, 17);
  if (r.contact.headline) centered(r.contact.headline, font, 10.5, GRAY);
  centered(contactLine(r), font, 9.5, GRAY);

  heading("Professional Summary");
  for (const line of wrap(r.summary, font, BODY, width)) text(line, { gap: 2.5 });

  heading("Professional Experience");
  for (const job of r.experience) {
    ensure(28);
    const head = [job.title, job.company].filter(Boolean).join(" — ");
    const dates = dateRange(job.startDate, job.endDate);
    const dw = font.widthOfTextAtSize(dates, 9.5);
    page.drawText(head, { x: MARGIN, y: y - 10.5, size: 10.5, font: bold });
    page.drawText(dates, { x: PAGE_W - MARGIN - dw, y: y - 10.5, size: 9.5, font, color: GRAY });
    y -= 14;
    if (job.location) text(job.location, { font: italic, size: 9.5, color: GRAY, gap: 2 });
    bullets(job.bullets);
    y -= 3;
  }

  if (r.skills.length) {
    heading("Skills & Competencies");
    for (const line of wrap(r.skills.join("  •  "), font, BODY, width)) text(line, { gap: 2.5 });
  }

  heading("Education");
  for (const e of r.education) {
    const head = [e.degree, e.institution].filter(Boolean).join(" — ");
    ensure(14);
    const dw = e.date ? font.widthOfTextAtSize(e.date, 9.5) : 0;
    page.drawText(head, { x: MARGIN, y: y - 10.5, size: 10.5, font: bold });
    if (e.date)
      page.drawText(e.date, { x: PAGE_W - MARGIN - dw, y: y - 10.5, size: 9.5, font, color: GRAY });
    y -= 14;
    if (e.details?.length) bullets(e.details);
  }

  if (r.certifications.length) {
    heading("Certifications");
    bullets(r.certifications.map((c) => [c.name, c.issuer, c.date].filter(Boolean).join(" — ")));
  }

  if (r.interests?.length) {
    heading("Interests");
    for (const line of wrap(r.interests.join("  •  "), font, BODY, width)) text(line, { gap: 2.5 });
  }

  return doc.save();
}
