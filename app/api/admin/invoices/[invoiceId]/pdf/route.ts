import { RoleType } from "@prisma/client";
import { NextResponse } from "next/server";
import { requirePortalRole } from "@/lib/erp-auth";
import { buildInvoicePdf, getInvoiceDocumentData } from "@/lib/finance-documents";

export async function GET(_request: Request, { params }: { params: Promise<{ invoiceId: string }> }) {
  const session = await requirePortalRole([RoleType.ADMIN, RoleType.SUPER_ADMIN]);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { invoiceId } = await params;
  const invoice = await getInvoiceDocumentData(invoiceId);
  if (!invoice) {
    return NextResponse.json({ success: false, message: "Invoice not found." }, { status: 404 });
  }

  const bytes = await buildInvoicePdf(invoice);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoiceNumber.toLowerCase()}-invoice.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
