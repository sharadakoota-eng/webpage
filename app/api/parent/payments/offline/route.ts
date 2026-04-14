import { InvoiceStatus, PaymentStatus, RoleType } from "@prisma/client";
import { NextResponse } from "next/server";
import { requirePortalRole } from "@/lib/erp-auth";
import { prisma } from "@/lib/prisma";
import { storeAdmissionUpload } from "@/lib/admission-uploads";

export async function POST(request: Request) {
  const session = await requirePortalRole([RoleType.PARENT]);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const invoiceId = (formData.get("invoiceId") ?? "").toString();
    const reference = (formData.get("reference") ?? "").toString();
    const note = (formData.get("note") ?? "").toString();
    const file = formData.get("file");

    if (!invoiceId) {
      return NextResponse.json({ success: false, message: "Invoice id is required." }, { status: 400 });
    }

    const parent = await prisma.parent.findUnique({
      where: { userId: session.sub },
      include: {
        parentStudents: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!parent) {
      return NextResponse.json({ success: false, message: "Parent profile not found." }, { status: 404 });
    }

    const studentIds = parent.parentStudents.map((entry) => entry.studentId);
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        studentId: { in: studentIds },
        status: { in: [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] },
      },
    });

    if (!invoice) {
      return NextResponse.json({ success: false, message: "Invoice not found for this parent portal." }, { status: 404 });
    }

    let uploadResult: { fileUrl: string; fileName: string } | null = null;
    if (file instanceof File && file.size > 0) {
      uploadResult = await storeAdmissionUpload({
        file,
        applicationNumber: invoice.invoiceNumber,
        documentKey: "upi-proof",
      });
    }

    const existingPending = await prisma.payment.findFirst({
      where: { invoiceId: invoice.id, status: PaymentStatus.PENDING },
    });

    const gatewayPayload = {
      mode: "MANUAL_UPI",
      reference: reference || null,
      note: note || null,
      fileUrl: uploadResult?.fileUrl ?? null,
      fileName: uploadResult?.fileName ?? null,
      uploadedAt: new Date().toISOString(),
      createdBy: "parent_portal",
    };

    const payment = existingPending
      ? await prisma.payment.update({
          where: { id: existingPending.id },
          data: {
            amount: invoice.amount,
            method: "UPI",
            status: PaymentStatus.PENDING,
            gatewayPayload,
          },
        })
      : await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            amount: invoice.amount,
            method: "UPI",
            status: PaymentStatus.PENDING,
            gatewayPayload,
          },
        });

    return NextResponse.json({ success: true, paymentId: payment.id, message: "Offline payment uploaded for verification." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Unable to upload offline payment proof." }, { status: 400 });
  }
}
