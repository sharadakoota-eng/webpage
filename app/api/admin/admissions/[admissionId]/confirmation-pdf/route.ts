import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getAdmissionDocumentBundle } from "@/lib/admission-packet";

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

export async function GET(_request: Request, { params }: { params: Promise<{ admissionId: string }> }) {
  const { admissionId } = await params;
  const bundle = await getAdmissionDocumentBundle(admissionId);
  if (!bundle?.enrollmentConfirmation) {
    return new Response("Enrollment confirmation is available only after enrollment.", { status: 400 });
  }

  const data = bundle.enrollmentConfirmation;
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const heading = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const body = await pdf.embedFont(StandardFonts.Helvetica);
  const bodyBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logo = await pdf.embedPng(await fs.readFile(path.join(process.cwd(), "assets", "logo.png")));
  const MARGIN = 40;
  const WIDTH = page.getWidth() - MARGIN * 2;

  page.drawRectangle({ x: 0, y: 0, width: page.getWidth(), height: page.getHeight(), color: COLORS.bg });
  page.drawRectangle({ x: MARGIN, y: page.getHeight() - MARGIN - 100, width: WIDTH, height: 96, color: COLORS.card, borderColor: COLORS.border, borderWidth: 1 });
  page.drawImage(logo, { x: MARGIN + 16, y: page.getHeight() - MARGIN - 80, width: 48, height: 48 });
  page.drawText("SHARADA KOOTA MONTESSORI SCHOOL", { x: MARGIN + 78, y: page.getHeight() - MARGIN - 28, size: 10, font: bodyBold, color: COLORS.gold });
  page.drawText("Admission Confirmation", { x: MARGIN + 78, y: page.getHeight() - MARGIN - 54, size: 24, font: heading, color: COLORS.navy });
  page.drawText(`Application ${data.applicationNumber}`, { x: MARGIN + 78, y: page.getHeight() - MARGIN - 74, size: 9, font: body, color: COLORS.body });

  let y = page.getHeight() - MARGIN - 124;
  const sections = [
    { title: "Student Enrollment", rows: [["Student", data.childName], ["Program", data.programName ?? "Pending"], ["Assigned Class", data.className ?? "To be assigned"], ["Joining Month", data.joiningMonth ?? "To be confirmed"]] },
    { title: "Fee Summary", rows: data.feeSummary.length ? data.feeSummary.map((item) => ["Fee", item] as [string, string]) : [["Fee Plan", "Fee plan setup is pending"]] },
    { title: "Parent Portal Activation", rows: data.parentPortalSummary.length ? data.parentPortalSummary.map((item) => ["Portal", item] as [string, string]) : [["Portal", "Portal activation pending"]] },
    { title: "Next Steps", rows: data.nextSteps.map((item) => ["Action", item] as [string, string]) },
  ];

  sections.forEach((section) => {
    const height = 52 + section.rows.length * 24;
    page.drawRectangle({ x: MARGIN, y: y - height, width: WIDTH, height, color: COLORS.card, borderColor: COLORS.border, borderWidth: 1 });
    page.drawRectangle({ x: MARGIN, y: y - 36, width: WIDTH, height: 36, color: COLORS.soft, borderColor: COLORS.border, borderWidth: 1 });
    page.drawText(section.title, { x: MARGIN + 16, y: y - 22, size: 10.5, font: bodyBold, color: COLORS.gold });
    section.rows.forEach(([label, value], index) => {
      page.drawText(`${label}:`, { x: MARGIN + 16, y: y - 58 - index * 24, size: 9.5, font: bodyBold, color: COLORS.navy });
      page.drawText(value, { x: MARGIN + 140, y: y - 58 - index * 24, size: 9.5, font: body, color: COLORS.body });
    });
    y -= height + 16;
  });

  page.drawLine({ start: { x: MARGIN, y: 34 }, end: { x: page.getWidth() - MARGIN, y: 34 }, thickness: 1, color: COLORS.border });
  page.drawText("Sharada Koota Montessori School", { x: MARGIN, y: 18, size: 8, font: bodyBold, color: COLORS.navy });
  page.drawText("Admission confirmation", { x: page.getWidth() - MARGIN - 95, y: 18, size: 8, font: body, color: COLORS.muted });

  const bytes = await pdf.save();
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${data.applicationNumber}-enrollment-confirmation.pdf"`,
    },
  });
}
