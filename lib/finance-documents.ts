import fs from "node:fs/promises";
import path from "node:path";
import { Prisma } from "@prisma/client";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { prisma } from "@/lib/prisma";

const logoBytesPromise = fs.readFile(path.join(process.cwd(), "assets", "logo.png"));

type InvoiceDocumentView = {
  invoiceNumber: string;
  status: string;
  issuedOn: Date;
  dueDate: Date;
  amount: number;
  studentName: string;
  admissionNumber: string;
  parentName: string;
  parentEmail?: string | null;
  parentPhone?: string | null;
  classLabel?: string;
  programName?: string;
  lineItems: Array<{
    title: string;
    description?: string | null;
    amount: number;
  }>;
};

type ReceiptDocumentView = {
  receiptNumber: string;
  issuedOn: Date;
  amount: number;
  studentName: string;
  admissionNumber: string;
  parentName: string;
  classLabel?: string;
  programName?: string;
  invoiceNumber?: string;
  paymentMethod?: string | null;
  paymentReference?: string | null;
  paidOn?: Date | null;
};

function formatDate(value?: Date | null) {
  if (!value) return "Pending";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getPrimaryParentLabel(parentMaps: Array<{ isPrimary: boolean; parent: { user: { name: string; email: string | null; phone: string | null } } }>) {
  const primary = parentMaps.find((item) => item.isPrimary) ?? parentMaps[0];
  return {
    name: primary?.parent.user.name ?? "Parent pending",
    email: primary?.parent.user.email ?? null,
    phone: primary?.parent.user.phone ?? null,
  };
}

function getProgramName(
  invoiceOrReceipt: {
    feeStructure?: { program?: { name: string } | null } | null;
    student: { enrollments: Array<{ program: { name: string } }> };
  },
  lineItems: Prisma.JsonValue | null,
) {
  const lineItemProgramName =
    lineItems && typeof lineItems === "object" && !Array.isArray(lineItems) && typeof lineItems.programName === "string"
      ? lineItems.programName
      : null;

  return lineItemProgramName ?? invoiceOrReceipt.feeStructure?.program?.name ?? invoiceOrReceipt.student.enrollments[0]?.program.name;
}

function normalizeLineItems(lineItems: Prisma.JsonValue | null, fallbackTitle: string, fallbackAmount: number) {
  if (lineItems && typeof lineItems === "object" && !Array.isArray(lineItems)) {
    const items = Array.isArray(lineItems.items) ? lineItems.items : [];
    const normalized = items
      .map((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) return null;
        const title = typeof item.title === "string" ? item.title : fallbackTitle;
        const description = typeof item.description === "string" ? item.description : null;
        const amount = typeof item.amount === "number" ? item.amount : fallbackAmount;
        return { title, description, amount };
      })
      .filter((item): item is { title: string; description: string | null; amount: number } => !!item);

    if (normalized.length > 0) {
      return normalized;
    }
  }

  return [{ title: fallbackTitle, description: null, amount: fallbackAmount }];
}

export async function getInvoiceDocumentData(invoiceId: string): Promise<InvoiceDocumentView | null> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      feeStructure: {
        include: { program: true },
      },
      student: {
        include: {
          currentClass: true,
          enrollments: {
            include: { program: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          parentMaps: {
            include: {
              parent: {
                include: { user: true },
              },
            },
          },
        },
      },
    },
  });

  if (!invoice) {
    return null;
  }

  const parent = getPrimaryParentLabel(invoice.student.parentMaps);
  const classLabel = invoice.student.currentClass
    ? `${invoice.student.currentClass.name}${invoice.student.currentClass.section ? ` - ${invoice.student.currentClass.section}` : ""}`
    : undefined;
  const lineItems = normalizeLineItems(invoice.lineItems, invoice.feeStructure?.title ?? "School Fee", Number(invoice.amount));

  return {
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status.replaceAll("_", " "),
    issuedOn: invoice.createdAt,
    dueDate: invoice.dueDate,
    amount: Number(invoice.amount),
    studentName: `${invoice.student.firstName} ${invoice.student.lastName ?? ""}`.trim(),
    admissionNumber: invoice.student.admissionNumber,
    parentName: parent.name,
    parentEmail: parent.email,
    parentPhone: parent.phone,
    classLabel,
    programName: getProgramName(invoice, invoice.lineItems),
    lineItems,
  };
}

export async function getReceiptDocumentData(receiptId: string): Promise<ReceiptDocumentView | null> {
  const receipt = await prisma.receipt.findUnique({
    where: { id: receiptId },
    include: {
      invoice: {
        include: {
          feeStructure: {
            include: { program: true },
          },
        },
      },
      payment: true,
      student: {
        include: {
          currentClass: true,
          enrollments: {
            include: { program: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          parentMaps: {
            include: {
              parent: {
                include: { user: true },
              },
            },
          },
        },
      },
    },
  });

  if (!receipt) {
    return null;
  }

  const parent = getPrimaryParentLabel(receipt.student.parentMaps);
  const classLabel = receipt.student.currentClass
    ? `${receipt.student.currentClass.name}${receipt.student.currentClass.section ? ` - ${receipt.student.currentClass.section}` : ""}`
    : undefined;

  return {
    receiptNumber: receipt.receiptNumber,
    issuedOn: receipt.issuedAt,
    amount: Number(receipt.amount),
    studentName: `${receipt.student.firstName} ${receipt.student.lastName ?? ""}`.trim(),
    admissionNumber: receipt.student.admissionNumber,
    parentName: parent.name,
    classLabel,
    programName: getProgramName(
      {
        feeStructure: receipt.invoice?.feeStructure ?? null,
        student: { enrollments: receipt.student.enrollments },
      },
      receipt.invoice?.lineItems ?? null,
    ),
    invoiceNumber: receipt.invoice?.invoiceNumber,
    paymentMethod: receipt.payment?.method ?? null,
    paymentReference: receipt.payment?.externalReference ?? null,
    paidOn: receipt.payment?.paidAt ?? receipt.issuedAt,
  };
}

async function embedBrandAssets(pdf: PDFDocument) {
  const logo = await pdf.embedPng(await logoBytesPromise);
  const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  return { logo, fontRegular, fontBold };
}

function drawHeader(page: PDFPage, assets: Awaited<ReturnType<typeof embedBrandAssets>>, title: string, badgeLabel: string, badgeValue: string) {
  const { width, height } = page.getSize();
  page.drawRectangle({
    x: 36,
    y: height - 108,
    width: width - 72,
    height: 72,
    borderColor: rgb(0.9, 0.84, 0.71),
    borderWidth: 1,
    color: rgb(1, 1, 1),
  });

  page.drawImage(assets.logo, {
    x: 48,
    y: height - 96,
    width: 48,
    height: 48,
  });

  page.drawText("SHARADA KOOTA MONTESSORI SCHOOL", {
    x: 110,
    y: height - 52,
    size: 11,
    font: assets.fontBold,
    color: rgb(0.82, 0.61, 0.07),
  });
  page.drawText(title, {
    x: 110,
    y: height - 78,
    size: 24,
    font: assets.fontBold,
    color: rgb(0.07, 0.16, 0.29),
  });
  page.drawText("A House of Learning | HSR Layout, Bengaluru", {
    x: 110,
    y: height - 94,
    size: 10,
    font: assets.fontRegular,
    color: rgb(0.32, 0.37, 0.47),
  });

  page.drawRectangle({
    x: width - 206,
    y: height - 96,
    width: 158,
    height: 48,
    borderColor: rgb(0.9, 0.84, 0.71),
    borderWidth: 1,
  });
  page.drawText(badgeLabel.toUpperCase(), {
    x: width - 194,
    y: height - 62,
    size: 8,
    font: assets.fontBold,
    color: rgb(0.82, 0.61, 0.07),
  });
  page.drawText(badgeValue, {
    x: width - 194,
    y: height - 80,
    size: 12,
    font: assets.fontBold,
    color: rgb(0.07, 0.16, 0.29),
  });
}

function drawFooter(page: PDFPage, assets: Awaited<ReturnType<typeof embedBrandAssets>>, pageNumber: number, pageCount: number) {
  const { width } = page.getSize();
  page.drawText("Sharada Koota Montessori School", {
    x: 36,
    y: 22,
    size: 9,
    font: assets.fontBold,
    color: rgb(0.07, 0.16, 0.29),
  });
  page.drawText(`Document | Page ${pageNumber} of ${pageCount}`, {
    x: width - 156,
    y: 22,
    size: 9,
    font: assets.fontRegular,
    color: rgb(0.35, 0.4, 0.49),
  });
}

function drawSectionCard(args: {
  page: PDFPage;
  title: string;
  x: number;
  y: number;
  width: number;
  rows: Array<{ label: string; value: string }>;
  assets: Awaited<ReturnType<typeof embedBrandAssets>>;
}) {
  const { page, title, x, y, width, rows, assets } = args;
  const rowHeight = 30;
  const headerHeight = 24;
  const height = headerHeight + rows.length * rowHeight + 12;

  page.drawRectangle({
    x,
    y: y - height,
    width,
    height,
    borderColor: rgb(0.9, 0.84, 0.71),
    borderWidth: 1,
    color: rgb(1, 1, 1),
  });
  page.drawText(title, {
    x: x + 14,
    y: y - 16,
    size: 11,
    font: assets.fontBold,
    color: rgb(0.82, 0.61, 0.07),
  });

  rows.forEach((row, index) => {
    const rowY = y - headerHeight - index * rowHeight - 16;
    if (index > 0) {
      page.drawLine({
        start: { x: x + 12, y: rowY + 8 },
        end: { x: x + width - 12, y: rowY + 8 },
        thickness: 0.8,
        color: rgb(0.92, 0.9, 0.84),
      });
    }
    page.drawText(row.label.toUpperCase(), {
      x: x + 14,
      y: rowY,
      size: 7,
      font: assets.fontBold,
      color: rgb(0.82, 0.61, 0.07),
    });
    page.drawText(row.value, {
      x: x + 14,
      y: rowY - 12,
      size: 10.5,
      font: assets.fontRegular,
      color: rgb(0.07, 0.16, 0.29),
      maxWidth: width - 28,
      lineHeight: 12,
    });
  });

  return height;
}

function drawInvoiceItemsTable(args: {
  page: PDFPage;
  y: number;
  assets: Awaited<ReturnType<typeof embedBrandAssets>>;
  items: InvoiceDocumentView["lineItems"];
  total: number;
}) {
  const { page, y, assets, items, total } = args;
  const { width } = page.getSize();
  const x = 36;
  const tableWidth = width - 72;
  const rowHeight = 28;
  const headerY = y - 20;

  page.drawRectangle({
    x,
    y: headerY - 8,
    width: tableWidth,
    height: 28,
    color: rgb(0.98, 0.97, 0.94),
    borderColor: rgb(0.9, 0.84, 0.71),
    borderWidth: 1,
  });
  page.drawText("DESCRIPTION", { x: x + 12, y: headerY + 2, size: 9, font: assets.fontBold, color: rgb(0.82, 0.61, 0.07) });
  page.drawText("AMOUNT", { x: x + tableWidth - 88, y: headerY + 2, size: 9, font: assets.fontBold, color: rgb(0.82, 0.61, 0.07) });

  items.forEach((item, index) => {
    const rowTop = headerY - 20 - index * rowHeight;
    page.drawRectangle({
      x,
      y: rowTop - rowHeight + 4,
      width: tableWidth,
      height: rowHeight,
      borderColor: rgb(0.92, 0.9, 0.84),
      borderWidth: 1,
    });
    page.drawText(item.title, {
      x: x + 12,
      y: rowTop - 9,
      size: 10.5,
      font: assets.fontBold,
      color: rgb(0.07, 0.16, 0.29),
      maxWidth: tableWidth - 130,
    });
    if (item.description) {
      page.drawText(item.description, {
        x: x + 12,
        y: rowTop - 19,
        size: 8.5,
        font: assets.fontRegular,
        color: rgb(0.35, 0.4, 0.49),
        maxWidth: tableWidth - 130,
      });
    }
    page.drawText(formatCurrency(item.amount), {
      x: x + tableWidth - 96,
      y: rowTop - 12,
      size: 10,
      font: assets.fontBold,
      color: rgb(0.07, 0.16, 0.29),
    });
  });

  const totalTop = headerY - 20 - items.length * rowHeight - 6;
  page.drawRectangle({
    x,
    y: totalTop - 20,
    width: tableWidth,
    height: 24,
    color: rgb(0.95, 0.98, 0.96),
    borderColor: rgb(0.79, 0.91, 0.84),
    borderWidth: 1,
  });
  page.drawText("TOTAL", {
    x: x + 12,
    y: totalTop - 4,
    size: 10,
    font: assets.fontBold,
    color: rgb(0.07, 0.16, 0.29),
  });
  page.drawText(formatCurrency(total), {
    x: x + tableWidth - 96,
    y: totalTop - 4,
    size: 10,
    font: assets.fontBold,
    color: rgb(0.07, 0.16, 0.29),
  });
}

function drawSignatureStrip(page: PDFPage, assets: Awaited<ReturnType<typeof embedBrandAssets>>, y: number) {
  const labels = ["Parent Signature", "Accounts Office", "School Seal / Stamp"];
  labels.forEach((label, index) => {
    const x = 36 + index * 176;
    page.drawRectangle({
      x,
      y: y - 64,
      width: 156,
      height: 56,
      borderColor: rgb(0.9, 0.84, 0.71),
      borderWidth: 1,
    });
    page.drawText(label, {
      x: x + 12,
      y: y - 18,
      size: 9,
      font: assets.fontBold,
      color: rgb(0.82, 0.61, 0.07),
    });
    page.drawLine({
      start: { x: x + 14, y: y - 46 },
      end: { x: x + 142, y: y - 46 },
      thickness: 0.8,
      color: rgb(0.82, 0.82, 0.82),
    });
  });
}

export async function buildInvoicePdf(data: InvoiceDocumentView) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const assets = await embedBrandAssets(pdf);

  drawHeader(page, assets, "Invoice", "Invoice No", data.invoiceNumber);

  page.drawText(`Status: ${data.status}`, {
    x: 389,
    y: 722,
    size: 10,
    font: assets.fontBold,
    color: rgb(0.07, 0.16, 0.29),
  });
  page.drawText(`Issued: ${formatDate(data.issuedOn)} | Due: ${formatDate(data.dueDate)}`, {
    x: 389,
    y: 707,
    size: 9,
    font: assets.fontRegular,
    color: rgb(0.35, 0.4, 0.49),
  });

  drawSectionCard({
    page,
    title: "Student Details",
    x: 36,
    y: 688,
    width: 255,
    assets,
    rows: [
      { label: "Student Name", value: data.studentName },
      { label: "Admission No", value: data.admissionNumber },
      { label: "Class", value: data.classLabel ?? "Pending assignment" },
      { label: "Program", value: data.programName ?? "Pending program" },
    ],
  });

  drawSectionCard({
    page,
    title: "Billing Contact",
    x: 304,
    y: 688,
    width: 255,
    assets,
    rows: [
      { label: "Parent Name", value: data.parentName },
      ...(data.parentPhone ? [{ label: "Phone", value: data.parentPhone }] : []),
      ...(data.parentEmail ? [{ label: "Email", value: data.parentEmail }] : []),
    ],
  });

  page.drawText("Fee Breakdown", {
    x: 36,
    y: 500,
    size: 12,
    font: assets.fontBold,
    color: rgb(0.82, 0.61, 0.07),
  });
  drawInvoiceItemsTable({
    page,
    y: 490,
    assets,
    items: data.lineItems,
    total: data.amount,
  });

  page.drawRectangle({
    x: 36,
    y: 134,
    width: 523,
    height: 72,
    borderColor: rgb(0.9, 0.84, 0.71),
    borderWidth: 1,
  });
  page.drawText("Payment Instructions", {
    x: 50,
    y: 188,
    size: 11,
    font: assets.fontBold,
    color: rgb(0.82, 0.61, 0.07),
  });
  page.drawText(
    "Please complete the payment on or before the due date. Online and school-office verified cash payments will reflect in both the parent portal and the admin finance desk.",
    {
      x: 50,
      y: 164,
      size: 9.5,
      font: assets.fontRegular,
      color: rgb(0.07, 0.16, 0.29),
      maxWidth: 495,
      lineHeight: 13,
    },
  );

  drawFooter(page, assets, 1, 1);
  return await pdf.save();
}

export async function buildReceiptPdf(data: ReceiptDocumentView) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const assets = await embedBrandAssets(pdf);

  drawHeader(page, assets, "Fee Receipt", "Receipt No", data.receiptNumber);

  page.drawText(`Issued on ${formatDate(data.issuedOn)}`, {
    x: 389,
    y: 722,
    size: 10,
    font: assets.fontBold,
    color: rgb(0.07, 0.16, 0.29),
  });

  drawSectionCard({
    page,
    title: "Student Details",
    x: 36,
    y: 688,
    width: 255,
    assets,
    rows: [
      { label: "Student Name", value: data.studentName },
      { label: "Admission No", value: data.admissionNumber },
      { label: "Class", value: data.classLabel ?? "Pending assignment" },
      { label: "Program", value: data.programName ?? "Pending program" },
    ],
  });

  drawSectionCard({
    page,
    title: "Receipt Summary",
    x: 304,
    y: 688,
    width: 255,
    assets,
    rows: [
      { label: "Parent Name", value: data.parentName },
      { label: "Invoice No", value: data.invoiceNumber ?? "Manual collection" },
      { label: "Amount Received", value: formatCurrency(data.amount) },
      { label: "Payment Mode", value: data.paymentMethod ?? "School verified payment" },
      ...(data.paymentReference ? [{ label: "Reference", value: data.paymentReference }] : []),
      { label: "Received On", value: formatDate(data.paidOn ?? data.issuedOn) },
    ],
  });

  page.drawRectangle({
    x: 36,
    y: 330,
    width: 523,
    height: 120,
    borderColor: rgb(0.9, 0.84, 0.71),
    borderWidth: 1,
    color: rgb(0.99, 0.98, 0.95),
  });
  page.drawText("Amount Acknowledgement", {
    x: 50,
    y: 426,
    size: 11,
    font: assets.fontBold,
    color: rgb(0.82, 0.61, 0.07),
  });
  page.drawText(
    `This receipt confirms that ${formatCurrency(data.amount)} has been received towards ${data.programName ?? "school fee"} for ${data.studentName}. Please retain this document for your records.`,
    {
      x: 50,
      y: 398,
      size: 10,
      font: assets.fontRegular,
      color: rgb(0.07, 0.16, 0.29),
      maxWidth: 495,
      lineHeight: 15,
    },
  );

  drawSignatureStrip(page, assets, 274);
  drawFooter(page, assets, 1, 1);
  return await pdf.save();
}
