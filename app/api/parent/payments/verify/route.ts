import crypto from "node:crypto";
import { RoleType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePortalRole } from "@/lib/erp-auth";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await requirePortalRole([RoleType.PARENT]);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = payloadSchema.parse(await request.json());
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ success: false, message: "Razorpay secret is not configured yet." }, { status: 400 });
    }

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

    const payment = await prisma.payment.findUnique({
      where: { externalReference: payload.orderId },
      include: {
        invoice: true,
      },
    });

    if (!payment || !parent.parentStudents.some((entry) => entry.studentId === payment.invoice.studentId)) {
      return NextResponse.json({ success: false, message: "Payment order not found for this parent." }, { status: 404 });
    }

    const expectedSignature = crypto.createHmac("sha256", secret).update(`${payload.orderId}|${payload.paymentId}`).digest("hex");
    if (expectedSignature !== payload.signature) {
      return NextResponse.json({ success: false, message: "Payment signature verification failed." }, { status: 400 });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paidAt: new Date(),
        gatewayPayload: {
          ...(payment.gatewayPayload as Record<string, unknown> | null),
          razorpayPaymentId: payload.paymentId,
          razorpaySignature: payload.signature,
          signatureVerified: true,
          parentSubmittedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment received from Razorpay and sent to the school office for verification.",
    });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message ?? "Invalid verification payload." }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: "Unable to verify the payment." }, { status: 400 });
  }
}
