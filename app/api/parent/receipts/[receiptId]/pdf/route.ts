import { RoleType } from "@prisma/client";
import { NextResponse } from "next/server";
import { requirePortalRole } from "@/lib/erp-auth";
import { buildReceiptPdf, getReceiptDocumentData } from "@/lib/finance-documents";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ receiptId: string }> }) {
  const session = await requirePortalRole([RoleType.PARENT]);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { receiptId } = await params;
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

  const receipt = await prisma.receipt.findFirst({
    where: {
      id: receiptId,
      studentId: { in: parent.parentStudents.map((entry) => entry.studentId) },
    },
    select: { id: true },
  });

  if (!receipt) {
    return NextResponse.json({ success: false, message: "Receipt not found for this parent." }, { status: 404 });
  }

  const documentData = await getReceiptDocumentData(receipt.id);
  if (!documentData) {
    return NextResponse.json({ success: false, message: "Receipt not found." }, { status: 404 });
  }

  const bytes = await buildReceiptPdf(documentData);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${documentData.receiptNumber.toLowerCase()}-receipt.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
