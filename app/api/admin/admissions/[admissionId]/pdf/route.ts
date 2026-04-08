import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import { getAdmissionDocumentBundle } from "@/lib/admission-packet";

const PAGE_SIZE: [number, number] = [595.28, 841.89];
const PAGE_WIDTH = PAGE_SIZE[0];
const PAGE_HEIGHT = PAGE_SIZE[1];
const PAGE_MARGIN = 34;
const FOOTER_Y = 24;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
const GUTTER = 16;
const HALF_WIDTH = (CONTENT_WIDTH - GUTTER) / 2;

const COLORS = {
  page: rgb(0.985, 0.972, 0.936),
  card: rgb(1, 1, 1),
  soft: rgb(0.996, 0.986, 0.958),
  border: rgb(0.905, 0.868, 0.778),
  gold: rgb(0.788, 0.612, 0.184),
  navy: rgb(0.113, 0.164, 0.286),
  text: rgb(0.215, 0.25, 0.312),
  muted: rgb(0.456, 0.492, 0.548),
  success: rgb(0.173, 0.541, 0.32),
  successBg: rgb(0.913, 0.973, 0.928),
  badge: rgb(0.973, 0.955, 0.889),
  line: rgb(0.932, 0.9, 0.833),
};

const logoBytesPromise = fs.readFile(path.join(process.cwd(), "assets", "logo.png"));

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const chunks = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const chunk of chunks) {
    const candidate = current ? `${current} ${chunk}` : chunk;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = chunk;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function drawPageBackground(page: PDFPage) {
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    color: COLORS.page,
  });

  page.drawRectangle({
    x: PAGE_MARGIN - 10,
    y: PAGE_MARGIN - 10,
    width: CONTENT_WIDTH + 20,
    height: PAGE_HEIGHT - (PAGE_MARGIN - 10) * 2,
    borderColor: rgb(0.945, 0.918, 0.854),
    borderWidth: 1,
  });
}

function drawFooter(page: PDFPage, bodyFont: PDFFont, boldFont: PDFFont, pageNumber: number, totalPages: number) {
  page.drawLine({
    start: { x: PAGE_MARGIN, y: 34 },
    end: { x: PAGE_WIDTH - PAGE_MARGIN, y: 34 },
    color: COLORS.line,
    thickness: 1,
  });

  page.drawText("Sharada Koota Montessori School", {
    x: PAGE_MARGIN,
    y: FOOTER_Y,
    size: 8,
    font: boldFont,
    color: COLORS.navy,
  });

  page.drawText(`Admission form | Page ${pageNumber} of ${totalPages}`, {
    x: PAGE_WIDTH - PAGE_MARGIN - 124,
    y: FOOTER_Y,
    size: 8,
    font: bodyFont,
    color: COLORS.muted,
  });
}

function drawHeader(
  page: PDFPage,
  logo: PDFImage,
  headingFont: PDFFont,
  bodyFont: PDFFont,
  bodyBold: PDFFont,
  meta: { applicationNumber: string; submittedOn: string; statusLabel: string },
) {
  const top = PAGE_HEIGHT - PAGE_MARGIN;

  page.drawRectangle({
    x: PAGE_MARGIN,
    y: top - 112,
    width: CONTENT_WIDTH,
    height: 98,
    color: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
  });

  page.drawRectangle({
    x: PAGE_MARGIN,
    y: top - 18,
    width: CONTENT_WIDTH,
    height: 4,
    color: COLORS.gold,
  });

  page.drawRectangle({
    x: PAGE_MARGIN + 14,
    y: top - 90,
    width: 72,
    height: 56,
    color: COLORS.soft,
    borderColor: COLORS.border,
    borderWidth: 1,
  });

  page.drawImage(logo, {
    x: PAGE_MARGIN + 26,
    y: top - 82,
    width: 48,
    height: 48,
  });

  page.drawText("SHARADA KOOTA MONTESSORI SCHOOL", {
    x: PAGE_MARGIN + 98,
    y: top - 36,
    size: 10.5,
    font: bodyBold,
    color: COLORS.gold,
  });

  page.drawText("Admission Form", {
    x: PAGE_MARGIN + 98,
    y: top - 62,
    size: 23,
    font: headingFont,
    color: COLORS.navy,
  });

  page.drawText("A House of Learning | HSR Layout, Bengaluru", {
    x: PAGE_MARGIN + 98,
    y: top - 81,
    size: 9,
    font: bodyFont,
    color: COLORS.muted,
  });

  const badgeX = PAGE_WIDTH - PAGE_MARGIN - 160;
  page.drawRectangle({
    x: badgeX,
    y: top - 92,
    width: 146,
    height: 66,
    color: COLORS.soft,
    borderColor: COLORS.border,
    borderWidth: 1,
  });

  page.drawText("APPLICATION NO", {
    x: badgeX + 12,
    y: top - 42,
    size: 8,
    font: bodyBold,
    color: COLORS.gold,
  });

  page.drawText(meta.applicationNumber, {
    x: badgeX + 12,
    y: top - 60,
    size: 10.5,
    font: bodyBold,
    color: COLORS.navy,
  });

  page.drawText(`Submitted: ${meta.submittedOn}`, {
    x: badgeX + 12,
    y: top - 77,
    size: 8.75,
    font: bodyFont,
    color: COLORS.text,
  });

  const statusWidth = bodyBold.widthOfTextAtSize(meta.statusLabel.toUpperCase(), 8) + 22;
  page.drawRectangle({
    x: PAGE_MARGIN,
    y: top - 134,
    width: statusWidth,
    height: 20,
    color: COLORS.badge,
    borderColor: COLORS.border,
    borderWidth: 1,
  });

  page.drawText(meta.statusLabel.toUpperCase(), {
    x: PAGE_MARGIN + 11,
    y: top - 127,
    size: 8,
    font: bodyBold,
    color: COLORS.gold,
  });

  return top - 152;
}

function drawSectionTitle(page: PDFPage, x: number, y: number, width: number, title: string, font: PDFFont) {
  page.drawRectangle({
    x,
    y: y - 36,
    width,
    height: 36,
    color: COLORS.soft,
    borderColor: COLORS.border,
    borderWidth: 1,
  });

  page.drawText(title, {
    x: x + 14,
    y: y - 23,
    size: 11,
    font,
    color: COLORS.gold,
  });
}

function measureRows(rows: Array<[string, string]>, bodyFont: PDFFont, width: number) {
  const innerWidth = width - 28;
  return rows.map(([label, value]) => {
    const lines = wrapText(value, bodyFont, 10, innerWidth);
    const height = 28 + lines.length * 13;
    return { label, lines, height };
  });
}

function drawRowsCard(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  title: string,
  rows: Array<[string, string]>,
  headingFont: PDFFont,
  bodyFont: PDFFont,
  boldFont: PDFFont,
) {
  const measured = measureRows(rows, bodyFont, width);
  const bodyHeight = measured.reduce((sum, item) => sum + item.height, 0) + 16;
  const totalHeight = 36 + bodyHeight;

  page.drawRectangle({
    x,
    y: y - totalHeight,
    width,
    height: totalHeight,
    color: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
  });

  drawSectionTitle(page, x, y, width, title, headingFont);

  let rowY = y - 54;
  measured.forEach((row, index) => {
    page.drawText(row.label.toUpperCase(), {
      x: x + 14,
      y: rowY,
      size: 7.4,
      font: boldFont,
      color: COLORS.gold,
    });

    row.lines.forEach((line, lineIndex) => {
      page.drawText(line, {
        x: x + 14,
        y: rowY - 15 - lineIndex * 13,
        size: 10,
        font: bodyFont,
        color: COLORS.text,
      });
    });

    rowY -= row.height;
    if (index < measured.length - 1) {
      page.drawLine({
        start: { x: x + 14, y: rowY + 7 },
        end: { x: x + width - 14, y: rowY + 7 },
        color: COLORS.line,
        thickness: 1,
      });
    }
  });

  return totalHeight;
}

function drawDocumentGrid(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  labels: string[],
  headingFont: PDFFont,
  bodyFont: PDFFont,
  boldFont: PDFFont,
) {
  const items = labels.length ? labels : ["No supporting documents submitted yet"];
  const columns = 2;
  const itemWidth = (width - 28 - 12) / columns;
  const rowCount = Math.ceil(items.length / columns);
  const totalHeight = 36 + 20 + rowCount * 42;

  page.drawRectangle({
    x,
    y: y - totalHeight,
    width,
    height: totalHeight,
    color: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
  });

  drawSectionTitle(page, x, y, width, "Submitted Documents", headingFont);

  items.forEach((item, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    const cardX = x + 14 + col * (itemWidth + 12);
    const cardY = y - 54 - row * 42;
    const isEmpty = !labels.length;

    page.drawRectangle({
      x: cardX,
      y: cardY - 24,
      width: itemWidth,
      height: 30,
      color: COLORS.soft,
      borderColor: COLORS.border,
      borderWidth: 1,
    });

    page.drawCircle({
      x: cardX + 13,
      y: cardY - 9,
      size: 5,
      color: isEmpty ? COLORS.badge : COLORS.successBg,
      borderColor: isEmpty ? COLORS.border : rgb(0.74, 0.91, 0.8),
      borderWidth: 1,
    });

    if (!isEmpty) {
      page.drawText("OK", {
        x: cardX + 8.5,
        y: cardY - 12.5,
        size: 6.5,
        font: boldFont,
        color: COLORS.success,
      });
    }

    page.drawText(item, {
      x: cardX + 24,
      y: cardY - 13,
      size: 9.6,
      font: isEmpty ? bodyFont : boldFont,
      color: isEmpty ? COLORS.muted : COLORS.text,
      maxWidth: itemWidth - 32,
    });
  });

  return totalHeight;
}

function drawDeclarationCard(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  text: string,
  headingFont: PDFFont,
  bodyFont: PDFFont,
) {
  const lines = wrapText(text, bodyFont, 10, width - 28);
  const totalHeight = 36 + 24 + lines.length * 14;

  page.drawRectangle({
    x,
    y: y - totalHeight,
    width,
    height: totalHeight,
    color: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
  });

  drawSectionTitle(page, x, y, width, "Declaration & Signature", headingFont);

  lines.forEach((line, index) => {
    page.drawText(line, {
      x: x + 14,
      y: y - 58 - index * 14,
      size: 10,
      font: bodyFont,
      color: COLORS.text,
    });
  });

  return totalHeight;
}

function drawSignatureBlocks(page: PDFPage, x: number, y: number, headingFont: PDFFont, bodyFont: PDFFont) {
  const boxWidth = (CONTENT_WIDTH - 24) / 3;
  [
    { title: "Parent Signature", hint: "Parent / Guardian" },
    { title: "Admissions Office", hint: "Verified by office" },
    { title: "School Seal / Stamp", hint: "Official seal" },
  ].forEach((item, index) => {
    const left = x + index * (boxWidth + 12);
    page.drawRectangle({
      x: left,
      y: y - 92,
      width: boxWidth,
      height: 92,
      color: COLORS.card,
      borderColor: COLORS.border,
      borderWidth: 1,
    });
    page.drawText(item.title, {
      x: left + 12,
      y: y - 22,
      size: 10,
      font: headingFont,
      color: COLORS.gold,
    });
    page.drawLine({
      start: { x: left + 12, y: y - 64 },
      end: { x: left + boxWidth - 12, y: y - 64 },
      color: COLORS.line,
      thickness: 1,
    });
    page.drawText(item.hint, {
      x: left + 12,
      y: y - 78,
      size: 8,
      font: bodyFont,
      color: COLORS.muted,
    });
  });
}

export async function GET(_request: Request, { params }: { params: Promise<{ admissionId: string }> }) {
  const { admissionId } = await params;
  const bundle = await getAdmissionDocumentBundle(admissionId);
  if (!bundle) {
    return new Response("Admission not found", { status: 404 });
  }

  const { parentApplication } = bundle;
  const pdfDoc = await PDFDocument.create();
  const pages = [pdfDoc.addPage(PAGE_SIZE), pdfDoc.addPage(PAGE_SIZE), pdfDoc.addPage(PAGE_SIZE)];
  const titleFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bodyBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const logo = await pdfDoc.embedPng(await logoBytesPromise);

  pages.forEach(drawPageBackground);

  let y = drawHeader(pages[0], logo, titleFont, bodyFont, bodyBold, {
    applicationNumber: parentApplication.applicationNumber,
    submittedOn: parentApplication.submittedOn,
    statusLabel: parentApplication.statusLabel,
  });

  const childHeight = drawRowsCard(
    pages[0],
    PAGE_MARGIN,
    y,
    HALF_WIDTH,
    "Child Profile",
    parentApplication.childProfile,
    bodyBold,
    bodyFont,
    bodyBold,
  );

  const programHeight = drawRowsCard(
    pages[0],
    PAGE_MARGIN + HALF_WIDTH + GUTTER,
    y,
    HALF_WIDTH,
    "Program Selection",
    parentApplication.programSelection,
    bodyBold,
    bodyFont,
    bodyBold,
  );

  const addressY = y - programHeight - 16;

  const addressHeight = drawRowsCard(
    pages[0],
    PAGE_MARGIN + HALF_WIDTH + GUTTER,
    addressY,
    HALF_WIDTH,
    "Address Details",
    parentApplication.addressDetails,
    bodyBold,
    bodyFont,
    bodyBold,
  );

  y -= Math.max(childHeight, programHeight + 16 + addressHeight) + 16;

  drawRowsCard(
    pages[0],
    PAGE_MARGIN,
    y,
    CONTENT_WIDTH,
    "Parent & Guardian Details",
    parentApplication.parentGuardianDetails,
    bodyBold,
    bodyFont,
    bodyBold,
  );

  y = drawHeader(pages[1], logo, titleFont, bodyFont, bodyBold, {
    applicationNumber: parentApplication.applicationNumber,
    submittedOn: parentApplication.submittedOn,
    statusLabel: "Parent Application Copy",
  });

  const schoolHeight = drawRowsCard(
    pages[1],
    PAGE_MARGIN,
    y,
    HALF_WIDTH,
    "Previous School Details",
    parentApplication.previousSchoolDetails,
    bodyBold,
    bodyFont,
    bodyBold,
  );

  const preferenceHeight = drawRowsCard(
    pages[1],
    PAGE_MARGIN + HALF_WIDTH + GUTTER,
    y,
    HALF_WIDTH,
    "Admission Preferences",
    parentApplication.admissionPreferences,
    bodyBold,
    bodyFont,
    bodyBold,
  );

  y -= Math.max(schoolHeight, preferenceHeight) + 18;

  drawDocumentGrid(
    pages[1],
    PAGE_MARGIN,
    y,
    CONTENT_WIDTH,
    parentApplication.submittedDocuments,
    bodyBold,
    bodyFont,
    bodyBold,
  );

  y = drawHeader(pages[2], logo, titleFont, bodyFont, bodyBold, {
    applicationNumber: parentApplication.applicationNumber,
    submittedOn: parentApplication.submittedOn,
    statusLabel: "Declaration Copy",
  });

  const declarationHeight = drawDeclarationCard(
    pages[2],
    PAGE_MARGIN,
    y,
    CONTENT_WIDTH,
    parentApplication.declaration,
    bodyBold,
    bodyFont,
  );

  y -= declarationHeight + 24;

  drawRowsCard(
    pages[2],
    PAGE_MARGIN,
    y,
    CONTENT_WIDTH,
    "Parent Note",
    [[
      "Important",
      "Please carry one printed copy of this application along with the original supporting documents during in-person admission verification at the school office.",
    ]],
    bodyBold,
    bodyFont,
    bodyBold,
  );

  drawSignatureBlocks(pages[2], PAGE_MARGIN, 210, bodyBold, bodyFont);

  pages.forEach((page, index) => drawFooter(page, bodyFont, bodyBold, index + 1, pages.length));

  const pdfBytes = await pdfDoc.save();
  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${parentApplication.applicationNumber}-admission-form.pdf"`,
    },
  });
}
