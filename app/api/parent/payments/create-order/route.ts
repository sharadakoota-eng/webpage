import { InvoiceStatus, PaymentStatus, RoleType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePortalRole } from "@/lib/erp-auth";
import { triggerPaymentCreatedEvent } from "@/lib/notifications/events";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.object({
  invoiceId: z.string().min(1),
});

function getRazorpayConfig() {
  return {
    keyId: process.env.RAZORPAY_KEY_ID ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  };
}

export async function POST(request: Request) {
  const session = await requirePortalRole([RoleType.PARENT]);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = payloadSchema.parse(await request.json());
    const { keyId, keySecret } = getRazorpayConfig();
    if (!keyId || !keySecret) {
      return NextResponse.json({ success: false, message: "Razorpay keys are not configured yet." }, { status: 400 });
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
        id: payload.invoiceId,
        studentId: { in: studentIds },
        status: { in: [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] },
      },
      include: {
        student: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ success: false, message: "Invoice not found for this parent portal." }, { status: 404 });
    }

    const amountInPaise = Math.round(Number(invoice.amount) * 100);
    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: invoice.invoiceNumber,
        notes: {
          invoiceId: invoice.id,
          studentId: invoice.studentId,
          studentName: `${invoice.student.firstName} ${invoice.student.lastName ?? ""}`.trim(),
          parentName: session.name,
        },
      }),
    });

    const orderData = (await orderResponse.json()) as { id?: string; error?: { description?: string } };
    if (!orderResponse.ok || !orderData.id) {
      return NextResponse.json(
        { success: false, message: orderData.error?.description ?? "Unable to create Razorpay order." },
        { status: 400 },
      );
    }

    const existingPending = await prisma.payment.findFirst({
      where: {
        invoiceId: invoice.id,
        status: PaymentStatus.PENDING,
      },
    });
    const payment = existingPending
      ? await prisma.payment.update({
          where: { id: existingPending.id },
          data: {
            externalReference: orderData.id,
            amount: invoice.amount,
            method: "RAZORPAY",
            gatewayPayload: {
              orderId: orderData.id,
              invoiceNumber: invoice.invoiceNumber,
              createdBy: "parent_portal",
              signatureVerified: false,
            },
          },
        })
      : await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            externalReference: orderData.id,
            amount: invoice.amount,
            method: "RAZORPAY",
            status: PaymentStatus.PENDING,
            gatewayPayload: {
              orderId: orderData.id,
              invoiceNumber: invoice.invoiceNumber,
              createdBy: "parent_portal",
              signatureVerified: false,
            },
          },
        });

    await triggerPaymentCreatedEvent({
      paymentId: payment.id,
      invoiceNumber: invoice.invoiceNumber,
      parentName: session.name,
    });

    return NextResponse.json({
      success: true,
      keyId,
      orderId: orderData.id,
      amount: amountInPaise,
      invoiceNumber: invoice.invoiceNumber,
      studentName: `${invoice.student.firstName} ${invoice.student.lastName ?? ""}`.trim(),
      parentName: session.name,
      parentEmail: session.email,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message ?? "Invalid payment payload." }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: "Unable to start the payment." }, { status: 400 });
  }
}
