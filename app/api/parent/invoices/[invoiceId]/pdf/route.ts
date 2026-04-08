import { RoleType } from "@prisma/client";
import { NextResponse } from "next/server";
import { requirePortalRole } from "@/lib/erp-auth";
import { buildInvoicePdf, getInvoiceDocumentData } from "@/lib/finance-documents";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ invoiceId: string }> }) {
  const session = await requirePortalRole([RoleType.PARENT]);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { invoiceId } = await params;
  const parent = await prisma.parent.findUnique({
    where: { userId: session.sub },
    include: {
      parentStudents: {
        select: { studentId: true },
      },
    },
  });

  if (!parent) {
    return NextResponse.json({ success: false, message: "Parent profile not found." }, { status: 404 });
  }

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      studentId: { in: parent.parentStudents.map((entry) => entry.studentId) },
    },
    select: { id: true },
  });

  if (!invoice) {
    return NextResponse.json({ success: false, message: "Invoice not found for this parent." }, { status: 404 });
  }

  const documentData = await getInvoiceDocumentData(invoice.id);
  if (!documentData) {
    return NextResponse.json({ success: false, message: "Invoice not found." }, { status: 404 });
  }

  const bytes = await buildInvoicePdf(documentData);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${documentData.invoiceNumber.toLowerCase()}-invoice.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
