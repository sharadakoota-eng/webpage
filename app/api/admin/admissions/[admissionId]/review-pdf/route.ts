import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import { getAdmissionDocumentBundle } from "@/lib/admission-packet";

const PAGE_SIZE: [number, number] = [595.28, 841.89];
const MARGIN = 38;
const WIDTH = PAGE_SIZE[0] - MARGIN * 2;
const COLORS = {
  bg: rgb(0.98, 0.96, 0.91),
  card: rgb(1, 1, 1),
  soft: rgb(0.99, 0.98, 0.95),
  border: rgb(0.91, 0.87, 0.79),
  navy: rgb(0.1, 0.16, 0.31),
  gold: rgb(0.77, 0.6, 0.16),
  body: rgb(0.18, 0.22, 0.28),
  muted: rgb(0.43, 0.47, 0.53),
};

function wrap(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else current = candidate;
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function bg(page: PDFPage) {
  page.drawRectangle({ x: 0, y: 0, width: page.getWidth(), height: page.getHeight(), color: COLORS.bg });
}

function section(page: PDFPage, x: number, y: number, w: number, h: number, title: string, font: PDFFont) {
  page.drawRectangle({ x, y: y - h, width: w, height: h, color: COLORS.card, borderColor: COLORS.border, borderWidth: 1 });
  page.drawRectangle({ x, y: y - 34, width: w, height: 34, color: COLORS.soft, borderColor: COLORS.border, borderWidth: 1 });
  page.drawText(title, { x: x + 14, y: y - 22, size: 10, font, color: COLORS.gold });
}

export async function GET(_request: Request, { params }: { params: Promise<{ admissionId: string }> }) {
  const { admissionId } = await params;
  const bundle = await getAdmissionDocumentBundle(admissionId);
  if (!bundle) return new Response("Admission not found", { status: 404 });

  const { adminReview } = bundle;
  const pdf = await PDFDocument.create();
  const page = pdf.addPage(PAGE_SIZE);
  bg(page);
  const heading = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const body = await pdf.embedFont(StandardFonts.Helvetica);
  const bodyBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logo = await pdf.embedPng(await fs.readFile(path.join(process.cwd(), "assets", "logo.png")));

  const top = page.getHeight() - MARGIN;
  page.drawRectangle({ x: MARGIN, y: top - 102, width: WIDTH, height: 92, color: COLORS.card, borderColor: COLORS.border, borderWidth: 1 });
  page.drawImage(logo, { x: MARGIN + 16, y: top - 82, width: 46, height: 46 });
  page.drawText("SHARADA KOOTA MONTESSORI SCHOOL", { x: MARGIN + 76, y: top - 30, size: 10, font: bodyBold, color: COLORS.gold });
  page.drawText("Admission Review Sheet", { x: MARGIN + 76, y: top - 56, size: 24, font: heading, color: COLORS.navy });
  page.drawText(`Application ${adminReview.applicationNumber} | Status ${adminReview.status}`, { x: MARGIN + 76, y: top - 75, size: 9, font: body, color: COLORS.body });

  let y = top - 124;
  const leftW = (WIDTH - 14) / 2;
  const rightX = MARGIN + leftW + 14;

  section(page, MARGIN, y, leftW, 156, "Review Timeline", bodyBold);
  [
    `Source: ${adminReview.source}`,
    `Submitted: ${adminReview.submittedOn}`,
    `Approved: ${adminReview.approvedOn ?? "Pending"}`,
    `Portal creation: ${adminReview.portalAccessState}`,
  ].forEach((line, index) =>
    page.drawText(line, { x: MARGIN + 16, y: y - 56 - index * 26, size: 10, font: body, color: COLORS.body }),
  );

  section(page, rightX, y, leftW, 156, "Child & Parent Summary", bodyBold);
  [...adminReview.child.slice(0, 3), ...adminReview.parents.slice(0, 2)].forEach(([label, value], index) => {
    const lines = wrap(`${label}: ${value}`, body, 9.5, leftW - 32);
    lines.forEach((line, lineIndex) => {
      page.drawText(line, { x: rightX + 16, y: y - 56 - index * 24 - lineIndex * 11, size: 9.5, font: body, color: COLORS.body });
    });
  });

  y -= 174;
  section(page, MARGIN, y, WIDTH, 170, "Structured Notes", bodyBold);
  adminReview.structuredNotes.forEach(([label, value], index) => {
    page.drawText(`${label}:`, { x: MARGIN + 16, y: y - 56 - index * 26, size: 9.5, font: bodyBold, color: COLORS.navy });
    page.drawText(value, { x: MARGIN + 140, y: y - 56 - index * 26, size: 9.5, font: body, color: COLORS.body });
  });
  page.drawText(`Review Notes: ${adminReview.reviewNotes ?? "No review notes yet."}`, {
    x: MARGIN + 16,
    y: y - 56 - adminReview.structuredNotes.length * 26 - 8,
    size: 9.5,
    font: body,
    color: COLORS.body,
  });

  y -= 188;
  const docHeight = Math.max(120, 48 + adminReview.documents.length * 24);
  section(page, MARGIN, y, WIDTH, docHeight, "Document Verification", bodyBold);
  adminReview.documents.forEach((doc, index) => {
    page.drawText(doc.label, { x: MARGIN + 16, y: y - 56 - index * 24, size: 9.25, font: bodyBold, color: COLORS.navy });
    page.drawText(doc.status, { x: MARGIN + 250, y: y - 56 - index * 24, size: 9.25, font: body, color: COLORS.body });
    page.drawText(doc.notes ?? "-", { x: MARGIN + 340, y: y - 56 - index * 24, size: 9.25, font: body, color: COLORS.muted });
  });

  page.drawLine({ start: { x: MARGIN, y: 34 }, end: { x: page.getWidth() - MARGIN, y: 34 }, thickness: 1, color: COLORS.border });
  page.drawText("Sharada Koota Montessori School", { x: MARGIN, y: 18, size: 8, font: bodyBold, color: COLORS.navy });
  page.drawText("Admin review sheet", { x: page.getWidth() - MARGIN - 78, y: 18, size: 8, font: body, color: COLORS.muted });

  const bytes = await pdf.save();
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${adminReview.applicationNumber}-review-sheet.pdf"`,
    },
  });
}
