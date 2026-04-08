import { RoleType } from "@prisma/client";
import { NextResponse } from "next/server";
import { requirePortalRole } from "@/lib/erp-auth";
import { buildReceiptPdf, getReceiptDocumentData } from "@/lib/finance-documents";

export async function GET(_request: Request, { params }: { params: Promise<{ receiptId: string }> }) {
  const session = await requirePortalRole([RoleType.ADMIN, RoleType.SUPER_ADMIN]);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { receiptId } = await params;
  const receipt = await getReceiptDocumentData(receiptId);
  if (!receipt) {
    return NextResponse.json({ success: false, message: "Receipt not found." }, { status: 404 });
  }

  const bytes = await buildReceiptPdf(receipt);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${receipt.receiptNumber.toLowerCase()}-receipt.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
