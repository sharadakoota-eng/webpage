import { InvoiceStatus, PaymentStatus, RoleType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePortalRole } from "@/lib/erp-auth";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("verify"),
  }),
  z.object({
    action: z.literal("reject"),
  }),
]);

function createReceiptNumber() {
  const year = new Date().getFullYear();
  return `RCT-${year}-${Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0")}`;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ paymentId: string }> }) {
  const session = await requirePortalRole([RoleType.ADMIN, RoleType.SUPER_ADMIN]);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { paymentId } = await params;
    const payload = payloadSchema.parse(await request.json());
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        invoice: {
          include: {
            student: true,
            payments: true,
            receipt: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ success: false, message: "Payment not found." }, { status: 404 });
    }

    if (payload.action === "reject") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });

      return NextResponse.json({ success: true, message: "Payment marked as failed." });
    }

    const gatewayPayload = (payment.gatewayPayload as Record<string, unknown> | null) ?? {};
    if (!gatewayPayload.signatureVerified) {
      return NextResponse.json({ success: false, message: "This payment has not been confirmed by Razorpay yet." }, { status: 400 });
    }

    const successfulAmount = payment.invoice.payments
      .filter((entry) => entry.id !== payment.id && entry.status === PaymentStatus.SUCCESS)
      .reduce((sum, entry) => sum + Number(entry.amount), 0) + Number(payment.amount);
    const invoiceAmount = Number(payment.invoice.amount);
    const nextInvoiceStatus = successfulAmount >= invoiceAmount ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCESS,
        },
      });

      await tx.invoice.update({
        where: { id: payment.invoiceId },
        data: {
          status: nextInvoiceStatus,
        },
      });

      if (!payment.invoice.receipt && nextInvoiceStatus === InvoiceStatus.PAID) {
        await tx.receipt.create({
          data: {
            receiptNumber: createReceiptNumber(),
            studentId: payment.invoice.studentId,
            invoiceId: payment.invoiceId,
            paymentId: payment.id,
            amount: payment.amount,
            issuedAt: new Date(),
          },
        });
      }
    });

    return NextResponse.json({ success: true, message: "Payment verified and receipt released." });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message ?? "Invalid payment action." }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: "Unable to update payment verification." }, { status: 400 });
  }
}
