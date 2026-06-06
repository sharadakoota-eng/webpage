import { InvoiceStatus, RoleType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePortalRole } from "@/lib/erp-auth";
import { createManualInvoice, recordCashPayment } from "@/lib/finance";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("createManualInvoice"),
    studentId: z.string().min(1),
    title: z.string().min(3),
    amount: z.coerce.number().positive(),
    dueDate: z.string().optional().or(z.literal("")),
    programId: z.string().optional().or(z.literal("")),
    paymentStatus: z.enum(["PAID", "DUE"]).optional(),
    paymentMethod: z.string().optional(),
    paymentReference: z.string().optional().or(z.literal("")),
  }),
  z.object({
    action: z.literal("recordCashPayment"),
    invoiceId: z.string().min(1),
    amount: z.coerce.number().positive().optional(),
    reference: z.string().optional().or(z.literal("")),
    method: z.string().optional(),
  }),
  z.object({
    action: z.literal("updateInvoice"),
    invoiceId: z.string().min(1),
    amount: z.coerce.number().positive(),
    dueDate: z.string().min(1),
    status: z.nativeEnum(InvoiceStatus),
    title: z.string().optional().or(z.literal("")),
  }),
  z.object({
    action: z.literal("deleteInvoice"),
    invoiceId: z.string().min(1),
  }),
]);

export async function POST(request: Request) {
  const session = await requirePortalRole([RoleType.ADMIN, RoleType.SUPER_ADMIN]);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = payloadSchema.parse(await request.json());

    if (payload.action === "createManualInvoice") {
      const invoice = await prisma.$transaction(async (tx) => {
        const created = await createManualInvoice({
          tx,
          studentId: payload.studentId,
          title: payload.title,
          amount: payload.amount,
          dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
          programId: payload.programId || undefined,
          createdBy: "admin_manual",
          metadata: {
            invoiceType: "MANUAL",
          },
        });

        if (payload.paymentStatus === "PAID") {
          await recordCashPayment({
            tx,
            invoiceId: created.id,
            amount: payload.amount,
            reference: payload.paymentReference || undefined,
            method: payload.paymentMethod || "CASH",
          });
        }

        return created;
      });

      return NextResponse.json({ success: true, invoiceId: invoice.id, message: "Manual invoice created successfully." });
    }

    if (payload.action === "updateInvoice") {
      const invoice = await prisma.invoice.findUnique({
        where: { id: payload.invoiceId },
      });

      if (!invoice) {
        return NextResponse.json({ success: false, message: "Invoice not found." }, { status: 404 });
      }

      const existingLineItems = invoice.lineItems && typeof invoice.lineItems === "object" && !Array.isArray(invoice.lineItems)
        ? (invoice.lineItems as Record<string, unknown>)
        : {};
      const existingTitle = typeof existingLineItems.title === "string" ? existingLineItems.title : undefined;

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          amount: payload.amount,
          dueDate: new Date(payload.dueDate),
          status: payload.status,
          lineItems: {
            ...existingLineItems,
            title: payload.title || existingTitle || null,
            adminEditedAt: new Date().toISOString(),
            adminEditedBy: session.sub,
          },
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.sub,
          action: "INVOICE_UPDATED",
          entityType: "Invoice",
          entityId: invoice.id,
          details: {
            invoiceNumber: invoice.invoiceNumber,
            amount: payload.amount,
            status: payload.status,
          },
        },
      });

      return NextResponse.json({ success: true, message: "Invoice updated successfully." });
    }

    if (payload.action === "deleteInvoice") {
      const invoice = await prisma.invoice.findUnique({
        where: { id: payload.invoiceId },
        include: {
          payments: true,
          receipt: true,
        },
      });

      if (!invoice) {
        return NextResponse.json({ success: false, message: "Invoice not found." }, { status: 404 });
      }

      const hasAccountingHistory = invoice.payments.length > 0 || Boolean(invoice.receipt);

      if (hasAccountingHistory) {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: InvoiceStatus.CANCELLED },
        });
      } else {
        await prisma.invoice.delete({
          where: { id: invoice.id },
        });
      }

      await prisma.auditLog.create({
        data: {
          userId: session.sub,
          action: hasAccountingHistory ? "INVOICE_CANCELLED" : "INVOICE_DELETED",
          entityType: "Invoice",
          entityId: invoice.id,
          details: {
            invoiceNumber: invoice.invoiceNumber,
            hadAccountingHistory: hasAccountingHistory,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: hasAccountingHistory
          ? "Invoice has payment history, so it was cancelled instead of hard-deleted."
          : "Invoice deleted successfully.",
      });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: payload.invoiceId },
    });

    if (!invoice) {
      return NextResponse.json({ success: false, message: "Invoice not found." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) =>
      recordCashPayment({
        tx,
        invoiceId: payload.invoiceId,
        amount: payload.amount ?? Number(invoice.amount),
        reference: payload.reference || undefined,
        method: payload.method || "CASH",
      }),
    );

    return NextResponse.json({ success: true, message: "Cash payment recorded and receipt generated." });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message ?? "Invalid finance payload." }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Unable to update finance records." }, { status: 400 });
  }
}
